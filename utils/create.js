const basePath = process.cwd();
const fs = require("fs");
const sharp = require("sharp");
const path = require("path");

if (!fs.existsSync(`${basePath}/build2`)) {
  fs.mkdirSync(`${basePath}/build2`);
}

if (!fs.existsSync(`${basePath}/build2/images`)) {
  fs.mkdirSync(`${basePath}/build2/images`);
}

if (!fs.existsSync(`${basePath}/build2/json`)) {
  fs.mkdirSync(`${basePath}/build2/json`);
}

if (!fs.existsSync(`${basePath}/build2/no`)) {
  fs.mkdirSync(`${basePath}/build2/no`);
}

fs.readdirSync(`${basePath}/build2/json`).forEach(async (fileName) => {
  if (path.extname(fileName) !== ".json") return;

  let json = fs.readFileSync(`${basePath}/build2/json/${fileName}`);
  let metadata = JSON.parse(json);

  const sharpLayers = [];

  for (const item of metadata.attributes) {
    const trait_type = item.trait_type;
    const value = item.value;
    //blank png
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

  await sharp(sharpLayers[0].input)
    .composite(sharpLayers)
    .toFile(
      `${basePath}/build2/images/${fileName.replaceAll(".json", "")}.png`
    );
  console.log(`created : ${fileName}`);
});
