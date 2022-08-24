const basePath = process.cwd();
const { NETWORK } = require(`${basePath}/constants/network.js`);
const fs = require("fs");
const sharp = require("sharp");
const sha1 = require(`${basePath}/node_modules/sha1`);
const buildDir = `${basePath}/build`;
const layersDir = `${basePath}/layers`;
const {
  format,
  baseUri,
  description,
  background,
  uniqueDnaTorrance,
  layerConfigurations,
  rarityDelimiter,
  shuffleLayerConfigurations,
  debugLogs,
  extraMetadata,
  text,
  namePrefix,
  network,
  solanaMetadata,
  gif,
  excludeLayers,
  includeLayers,
  mutuallyExclusiveType,
  mutuallyExclusiveTrait,
} = require(`${basePath}/src/config.js`);

var metadataList = [];
var attributesList = [];
var dnaList = new Set();
const DNA_DELIMITER = "-";

const buildSetup = () => {
  if (fs.existsSync(buildDir)) {
    fs.rmdirSync(buildDir, { recursive: true });
  }
  fs.mkdirSync(buildDir);
  fs.mkdirSync(`${buildDir}/json`);
  fs.mkdirSync(`${buildDir}/images`);
  if (gif.export) {
    fs.mkdirSync(`${buildDir}/gifs`);
  }
};

const getRarityWeight = (_str) => {
  let nameWithoutExtension = _str.slice(0, -4);
  var nameWithoutWeight = Number(
    nameWithoutExtension.split(rarityDelimiter).pop()
  );
  if (isNaN(nameWithoutWeight)) {
    nameWithoutWeight = 1;
  }
  return nameWithoutWeight;
};

const cleanDna = (_str) => {
  const withoutOptions = removeQueryStrings(_str);
  var dna = Number(withoutOptions.split(":").shift());
  return dna;
};

const cleanName = (_str) => {
  let nameWithoutExtension = _str.slice(0, -4);
  var nameWithoutWeight = nameWithoutExtension.split(rarityDelimiter).shift();
  return nameWithoutWeight;
};

const getElements = (path) => {
  return fs
    .readdirSync(path)
    .filter((item) => !/(^|\/)\.[^\/\.]/g.test(item))
    .map((i, index) => {
      if (i.includes("-")) {
        throw new Error(`layer name can not contain dashes, please fix: ${i}`);
      }
      return {
        id: index,
        name: cleanName(i),
        filename: i,
        path: `${path}${i}`,
        weight: getRarityWeight(i),
      };
    });
};

const layersSetup = (layersOrder) => {
  const layers = layersOrder.map((layerObj, index) => ({
    id: index,
    elements: getElements(`${layersDir}/${layerObj.name}/`),
    name:
      layerObj.options?.["displayName"] != undefined
        ? layerObj.options?.["displayName"]
        : layerObj.name,
    blend:
      layerObj.options?.["blend"] != undefined
        ? layerObj.options?.["blend"]
        : "source-over",
    opacity:
      layerObj.options?.["opacity"] != undefined
        ? layerObj.options?.["opacity"]
        : 1,
    bypassDNA:
      layerObj.options?.["bypassDNA"] !== undefined
        ? layerObj.options?.["bypassDNA"]
        : false,
  }));
  return layers;
};

const addMetadata = (_dna, _edition) => {
  let dateTime = Date.now();
  let tempMetadata = {
    name: `${namePrefix} #${_edition}`,
    description: description,
    image: `${baseUri}/${_edition}.png`,
    dna: sha1(_dna),
    edition: _edition,
    date: dateTime,
    ...extraMetadata,
    attributes: attributesList,
    compiler: "HashLips Art Engine",
  };
  if (network == NETWORK.sol) {
    tempMetadata = {
      //Added metadata for solana
      name: tempMetadata.name,
      symbol: solanaMetadata.symbol,
      description: tempMetadata.description,
      //Added metadata for solana
      seller_fee_basis_points: solanaMetadata.seller_fee_basis_points,
      image: `${_edition}.png`,
      //Added metadata for solana
      external_url: solanaMetadata.external_url,
      edition: _edition,
      ...extraMetadata,
      attributes: tempMetadata.attributes,
      properties: {
        files: [
          {
            uri: `${_edition}.png`,
            type: "image/png",
          },
        ],
        category: "image",
        creators: solanaMetadata.creators,
      },
    };
  }
  metadataList.push(tempMetadata);
  attributesList = [];
};

const constructLayerToDna = (_dna = "", _layers = []) => {
  let mappedDnaToLayers = _layers.map((layer, index) => {
    let selectedElement = layer.elements.find(
      (e) => e.id == cleanDna(_dna.split(DNA_DELIMITER)[index])
    );
    return {
      name: layer.name,
      blend: layer.blend,
      opacity: layer.opacity,
      selectedElement: selectedElement,
    };
  });
  return mappedDnaToLayers;
};

/**
 * In some cases a DNA string may contain optional query parameters for options
 * such as bypassing the DNA isUnique check, this function filters out those
 * items without modifying the stored DNA.
 *
 * @param {String} _dna New DNA string
 * @returns new DNA string with any items that should be filtered, removed.
 */
const filterDNAOptions = (_dna) => {
  const dnaItems = _dna.split(DNA_DELIMITER);
  const filteredDNA = dnaItems.filter((element) => {
    const query = /(\?.*$)/;
    const querystring = query.exec(element);
    if (!querystring) {
      return true;
    }
    const options = querystring[1].split("&").reduce((r, setting) => {
      const keyPairs = setting.split("=");
      return { ...r, [keyPairs[0]]: keyPairs[1] };
    }, []);

    return options.bypassDNA;
  });

  return filteredDNA.join(DNA_DELIMITER);
};

/**
 * Cleaning function for DNA strings. When DNA strings include an option, it
 * is added to the filename with a ?setting=value query string. It needs to be
 * removed to properly access the file name before Drawing.
 *
 * @param {String} _dna The entire newDNA string
 * @returns Cleaned DNA string without querystring parameters.
 */
const removeQueryStrings = (_dna) => {
  const query = /(\?.*$)/;
  return _dna.replace(query, "");
};

const isDnaUnique = (_DnaList = new Set(), _dna = "") => {
  const _filteredDNA = filterDNAOptions(_dna);
  return !_DnaList.has(_filteredDNA);
};

const createDna = (_layers) => {
  let qcResult = false;

  while (qcResult == false) {
    let randNum = [];
    let qcData = [];
    _layers.forEach((layer) => {
      var totalWeight = 0;
      layer.elements.forEach((element) => {
        totalWeight += element.weight;
      });
      // number between 0 - totalWeight
      let random = Math.floor(Math.random() * totalWeight);
      for (var i = 0; i < layer.elements.length; i++) {
        // subtract the current weight from the random weight until we reach a sub zero value.
        random -= layer.elements[i].weight;
        if (random < 0) {
          qcData.push(layer.elements[i].filename.replace(".png", ""));
          return randNum.push(
            `${layer.elements[i].id}:${layer.elements[i].filename}${
              layer.bypassDNA ? "?bypassDNA=true" : ""
            }`
          );
        }
      }
    });

    //include
    for (const include of includeLayers) {
      let layer1 = qcData.includes(include.trait);
      let layer2 = false;

      for (const trait of include.includes) {
        layer2 = qcData.includes(trait);

        if (layer2 == true) {
          break;
        }
      }

      if (layer1 == true && layer2 == false) {
        qcResult = false;
        break;
      }
      qcResult = true;
    }

    if (qcResult == false) continue;

    // exclude
    for (const exclude of excludeLayers) {
      let layer1 = qcData.includes(exclude.trait);
      let layer2 = false;

      for (const trait of exclude.excludes) {
        layer2 = qcData.includes(trait);

        if (layer2 == true) {
          break;
        }
      }

      if (layer1 == true && layer2 == true) {
        qcResult = false;
        break;
      } else {
        qcResult = true;
      }
    }

    if (qcResult == false) continue;

    //mutually exclusive type
    for (const mutuallyExclusive of mutuallyExclusiveType) {
      let trait1 = mutuallyExclusive.trait1;
      let trait2 = mutuallyExclusive.trait2;

      const traitIndex1 = layerConfigurations[0].layersOrder.findIndex(
        (x) => x.name === trait1
      );

      const traitIndex2 = layerConfigurations[0].layersOrder.findIndex(
        (x) => x.name === trait2
      );

      let trait1Name = qcData[traitIndex1];
      let trait2Name = qcData[traitIndex2];

      // console.log(trait1Name, "/", trait2Name);

      if (trait1Name.includes("#")) {
        trait1Name = trait1Name.split("#")[0];
      }
      if (trait2Name.includes("#")) {
        trait2Name = trait1Name.split("#")[0];
      }

      if (trait1Name !== "NO" && trait2Name !== "NO") {
        qcResult = false;
        break;
      } else {
        qcResult = true;
        break;
      }
    }

    if (qcResult == false) continue;

    //mutually exclusive trait
    for (const mutuallyExclusive of mutuallyExclusiveTrait) {
      let trait1 = mutuallyExclusive.trait1;

      const traitIndex1 = layerConfigurations[0].layersOrder.findIndex(
        (x) => x.name === trait1
      );

      let trait1Name = qcData[traitIndex1];
      // console.log(trait1Name, "/", trait2Name);

      if (trait1Name.includes("#")) {
        trait1Name = trait1Name.split("#")[0];
      }

      let layer1 = false;
      let layer2 = false;

      if (trait1Name == "NO") {
        layer1 = true;
      } else {
        layer1 = false;
      }

      for (const trait of mutuallyExclusive.trait2) {
        layer2 = qcData.includes(trait);
        if (layer2 == true) {
          break;
        }
      }

      if (layer1 == true && layer2 == true) qcResult = true;
      if (layer1 == false && layer2 == true) qcResult = false;
      if (layer1 == false && layer2 == false) qcResult = true;
      if (layer1 == true && layer2 == false) qcResult = true;
    }

    if (qcResult == true) return randNum.join(DNA_DELIMITER);
    if (qcResult == false) continue;
  }
};

const writeMetaData = (_data) => {
  fs.writeFileSync(`${buildDir}/json/_metadata.json`, _data);
};

const saveMetaDataSingleFile = (_editionCount) => {
  let metadata = metadataList.find((meta) => meta.edition == _editionCount);
  debugLogs
    ? console.log(
        `Writing metadata for ${_editionCount}: ${JSON.stringify(metadata)}`
      )
    : null;
  fs.writeFileSync(
    `${buildDir}/json/${_editionCount}.json`,
    JSON.stringify(metadata, null, 2)
  );
};

function shuffle(array) {
  let currentIndex = array.length,
    randomIndex;
  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
}

const startCreating = async ({ index, total }) => {
  let layerConfigIndex = 0;
  let editionCount = index;
  let failedCount = 0;
  let abstractedIndexes = [];
  for (let i = network == NETWORK.sol ? 0 : index; i <= total; i++) {
    abstractedIndexes.push(i);
  }
  if (shuffleLayerConfigurations) {
    abstractedIndexes = shuffle(abstractedIndexes);
  }
  debugLogs
    ? console.log("Editions left to create: ", abstractedIndexes)
    : null;
  while (layerConfigIndex < layerConfigurations.length) {
    const layers = layersSetup(
      layerConfigurations[layerConfigIndex].layersOrder
    );
    while (editionCount <= total) {
      const startTime = performance.now(); // catat waktu
      let newDna = createDna(layers);
      //console.log("dna : ", dnaList);
      if (isDnaUnique(dnaList, newDna)) {
        let results = constructLayerToDna(newDna, layers);
        let loadedElements = [];

        //console.log(results);

        let sharpLayers = [];
        for (const item of results) {
          sharpLayers.push({ input: item.selectedElement.path });
          attributesList.push({
            trait_type: item.name,
            value: item.selectedElement.name,
          });
        }

        //console.log(sharpLayers);

        debugLogs
          ? console.log("Editions left to create: ", abstractedIndexes)
          : null;

        //     .tint({ r: 50, g: 24, b: 10 })
        //save image with sharp
        await sharp(sharpLayers[0].input)
          .composite(sharpLayers)
          // .tint({ r: 50, g: 24, b: 10 })
          .toFile(`${buildDir}/images/${abstractedIndexes[0]}.png`);
        addMetadata(newDna, abstractedIndexes[0]);
        saveMetaDataSingleFile(abstractedIndexes[0]);
        const executionTime = ((performance.now() - startTime) / 1000).toFixed(
          2
        );
        const estimatedToFinish =
          ((total - abstractedIndexes[0]) * executionTime) / 3600;
        console.log(
          `Created edition: ${abstractedIndexes[0]}, with DNA: ${sha1(
            newDna
          )}, execution time: ${executionTime}, completed: ${
            abstractedIndexes[0]
          }/${total}, estimated: ${estimatedToFinish.toFixed(2)} hours`
        );

        dnaList.add(filterDNAOptions(newDna));
        editionCount++;
        abstractedIndexes.shift();
      } else {
        console.log("DNA exists!");
        failedCount++;
        if (failedCount >= uniqueDnaTorrance) {
          console.log(
            `You need more layers or elements to grow your edition to ${layerConfigurations[layerConfigIndex].growEditionSizeTo} artworks!`
          );
          process.exit();
        }
      }
    }
    layerConfigIndex++;
  }
  writeMetaData(JSON.stringify(metadataList, null, 2));
};

module.exports = { startCreating, buildSetup, getElements };
