const basePath = process.cwd();
const fs = require("fs");
const sharp = require("sharp");
const path = require("path");

const variation = "HEAD GEAR";

const { layerConfigurations } = require(`${basePath}/src/config.js`);

if (!fs.existsSync(`${basePath}/build2`)) {
  fs.mkdirSync(`${basePath}/build2`);
}

if (!fs.existsSync(`${basePath}/build2/variations`)) {
  fs.mkdirSync(`${basePath}/build2/variations`);
}

if (!fs.existsSync(`${basePath}/build2/json`)) {
  fs.mkdirSync(`${basePath}/build2/json`);
}

const variations = fs
  .readdirSync(`${basePath}/layers/${variation}`)
  .filter((fileName) => path.extname(fileName) === ".png");

const traitIndex = layerConfigurations[0].layersOrder.findIndex(
  (x) => x.name === variation
);

fs.readdirSync(`${basePath}/build2/json`).forEach(async (fileName) => {
  if (path.extname(fileName) !== ".json") return;

  let json = fs.readFileSync(`${basePath}/build2/json/${fileName}`);
  let metadata = JSON.parse(json);

  let sharpLayers = [];

  for (const item of metadata.attributes) {
    const trait_type = item.trait_type;
    const value = item.value;
    if (item.value.trim() == "NO") {
      sharpLayers.push({
        input: `${basePath}/build2/no/NO.png`,
      });
    } else {
      sharpLayers.push({
        input: `${basePath}/layers/${trait_type}/${value}.png`,
      });
    }
  }

  variations.map(async (fileVariationName) => {
    sharpLayers[
      traitIndex
    ].input = `${basePath}/layers/${variation}/${fileVariationName}`;

    await sharp(sharpLayers[0].input)
      .composite(sharpLayers)
      .toFile(
        `${basePath}/build2/variations/${fileName.replaceAll(
          ".json",
          ""
        )}-${fileVariationName}.png`
      );
    console.log(
      `created : ${fileName} / ${fileVariationName.replaceAll(".png", "")}`
    );
  });
});
