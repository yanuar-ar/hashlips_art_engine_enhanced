const basePath = process.cwd();
const fs = require("fs");

const { layerConfigurations } = require(`${basePath}/src/config.js`);

if (!fs.existsSync(`${basePath}/build/previews`)) {
  fs.mkdirSync(`${basePath}/build/previews`);
}

for (const item of layerConfigurations[0].layersOrder) {
  const name = item.name;
  console.log(name);
  fs.readdirSync(`${basePath}/layers/${name}`).forEach(async (fileName) => {
    const newFileName = fileName.replaceAll("-", " ").replaceAll("#", " ");
    fs.renameSync(
      `${basePath}/layers/${name}/${fileName}`,
      `${basePath}/layers/${name}/${newFileName}`
    );
  });
}
