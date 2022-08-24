const basePath = process.cwd();
const fs = require("fs");
const sharp = require("sharp");

if (!fs.existsSync(`${basePath}/build/previews`)) {
  fs.mkdirSync(`${basePath}/build/previews`);
}

fs.readdirSync(`${basePath}/build/images`).forEach(async (fileName) => {
  sharp(`${basePath}/build/images/${fileName}`)
    .resize({ height: 350, width: 350 })
    .toFile(`${basePath}/build/previews/${fileName}`);
});
