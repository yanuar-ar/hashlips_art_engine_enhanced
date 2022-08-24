const basePath = process.cwd();
const fs = require("fs");
const path = require("path");

if (!fs.existsSync(`${basePath}/layers`)) {
  fs.mkdirSync(`${basePath}/layers`);
}

if (!fs.existsSync(`${basePath}/export`)) {
  console.log("Export folder doesn't exists");
  process.exit();
}

if (fs.existsSync(`${basePath}/layers`)) {
  fs.rmdirSync(`${basePath}/layers`, { recursive: true });
}

fs.mkdirSync(`${basePath}/layers`);

fs.readdirSync(`${basePath}/export`).forEach(async (fileName) => {
  if (path.extname(fileName) !== ".png") return;

  const include = fileName.includes("#");
  if (!include) return;

  const folderName = fileName.split("#")[0].replaceAll("-", " ");

  //count https://stackoverflow.com/questions/4009756/how-to-count-string-occurrence-in-string

  if (!fs.existsSync(`${basePath}/layers/${folderName}`)) {
    fs.mkdirSync(`${basePath}/layers/${folderName}`);
  }

  let newFileName = fileName.replaceAll("-", " ");

  newFileName = newFileName.substring(
    newFileName.indexOf("#") + 1,
    newFileName.length
  );

  fs.renameSync(
    `${basePath}/export/${fileName}`,
    `${basePath}/layers/${folderName}/${newFileName}`
  );

  console.log(
    `${basePath}/export/${fileName}`,
    " ke ",
    `${basePath}/layers/${folderName}/${newFileName}`
  );
});
