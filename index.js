const basePath = process.cwd();
const { buildSetup } = require(`${basePath}/src/main.js`);
const {
  workersNumber,
  layerConfigurations,
} = require(`${basePath}/src/config.js`);
const Piscina = require("piscina");
const { resolve } = require("path");

const piscina = new Piscina({
  filename: resolve(__dirname, "src\\\\main.js"),
});

const workers = [];

for (let i = 0; i < workersNumber; i++) {
  const totalNFT = layerConfigurations[0].growEditionSizeTo;
  const chunk = totalNFT / workersNumber;
  const total = chunk * (i + 1);
  const start = 1 + chunk * i;

  workers.push(
    piscina.run({ index: start, total: total }, { name: "startCreating" })
  );
}

(async function () {
  buildSetup();
  await Promise.all(workers);
})();
