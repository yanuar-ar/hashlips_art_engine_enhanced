const basePath = process.cwd();
const { MODE } = require(`${basePath}/constants/blend_mode.js`);
const { NETWORK } = require(`${basePath}/constants/network.js`);

const network = NETWORK.eth;

// how many threads
const workersNumber = 4;

// General metadata for Ethereum
const namePrefix = "Project Re:";
const description = "Project Re: DAO. A Nouns of Anime.";
const baseUri = "ipfs://NewUriToReplace";

const solanaMetadata = {
  symbol: "YC",
  seller_fee_basis_points: 1000, // Define how much % you want from secondary market sales 1000 = 10%
  external_url: "------",
  creators: [
    {
      address: "-----",
      share: 100,
    },
  ],
};

// If you have selected Solana then the collection starts from 0 automatically
const layerConfigurations = [
  {
    growEditionSizeTo: 5000,
    layersOrder: [
      { name: "BACKGROUND" }, //0
      { name: "EFFECT" }, //2
      { name: "BACKGEAR" }, //1
      { name: "OFFHAND" }, //3
      { name: "BODY" }, //4
      { name: "BODY ATTACHMENT" }, //5
      { name: "EYES" }, //6
      { name: "HAND" }, //3
      { name: "OUTFIT" }, //7
      { name: "EAR" }, //8
      { name: "MOUTH PART" }, //9
      { name: "HAIR" }, //10
      { name: "MOUTH" }, //11
      { name: "FACE GEAR" }, //12
      { name: "NECK" }, //13
      { name: "HEAD GEAR" }, //14
    ],
  },
];

const excludeLayers = [
  {
    trait: "HEADGEAR (4)",
    excludes: [
      "OUTFIT (1)",
      "OUTFIT (2)",
      "OUTFIT (4)",
      "OUTFIT (5)",
      "OUTFIT (6)",
      "OUTFIT (7)",
      "OUTFIT (8)",
      "OUTFIT (10)",
      "OUTFIT (11)",
      "OUTFIT (13)",
      "OUTFIT (14)",
      "OUTFIT (16)",
      "OUTFIT (17)",
      "OUTFIT (20)",
      "OUTFIT (22)",
      "OUTFIT (23)",
      "OUTFIT (24)",
      "OUTFIT (25)",
      "OUTFIT (26)",
      "OUTFIT (27)",
      "OUTFIT (28)",
      "OUTFIT (29)",
      "OUTFIT (30)",
      "OUTFIT (31)",
      "OUTFIT (32)",
      "OUTFIT (33)",
      "OUTFIT (34)",
      "OUTFIT (35)",
      "OUTFIT (36)",
      "OUTFIT (37)",
      "OUTFIT (38)",
      "OUTFIT (39)",
      "OUTFIT (40)",
    ],
  },
];

const includeLayers = [
  {
    trait: "HEADGEAR (4)",
    includes: [
      "HAIR (1)",
      "HAIR (2)",
      "HAIR (3)",
      "HAIR (4)",
      "HAIR (5)",
      "HAIR (6)",
      "HAIR (7)",
      "HAIR (8)",
      "HAIR (19)",
    ],
  },
  {
    trait: "HEADGEAR (4)",
    includes: [
      "OUTFIT (7)",
      "OUTFIT (11)",
      "OUTFIT (15)",
      "OUTFIT (18)",
      "OUTFIT (21)",
    ],
  },
];

const mutuallyExclusiveType = [
  { trait1: "HAND", trait2: "OFFHAND" },
  { trait1: "HAIR", trait2: "HEAD GEAR" },
];

const mutuallyExclusiveTrait = [
  {
    trait1: "HEAD GEAR",
    trait2: [
      "BLONDE IVY LEAGUE HAIR CUT",
      "BLONDE TOP KNOT HALF PONYTAIL",
      "BROWN IVY LEAGUE HAIR CUT",
      //messy
      "RED SHORT STYLE WITH MESSY BANGS",
      "GREEN SHORT STYLE WITH MESSY BANGS",
      "BLUE SHORT STYLE WITH MESSY BANGS",
      "BLACK SHORT STYLE WITH MESSY BANGS",
      "BROWN SHORT STYLE WITH MESSY BANGS",
      "WHITE SHORT STYLE WITH MESSY BANGS",
      //long flat top
      "YELLOW LONG FLAT TOP",
      "BLUE LONG FLAT TOP",
      "PURPLE LONG FLAT TOP",
      "ORANGE LONG FLAT TOP",
      //ponytail
      "BROWN TOP KNOT HALF PONYTAIL",
      "GREEN TOP KNOT HALF PONYTAIL",
      "BLUE TOP KNOT HALF PONYTAIL",
      "BLONDE TOP KNOT HALF PONYTAIL",
      "BROWN PONYTAIL MEN",
      "GREEN PONYTAIL MEN",
      "PURPLE PONYTAIL MEN",
      "BLUE ASIAN PONYTAIL MEN",
      //fade
      "RED DROP FADE",
      "YELLOW DROP FADE",
      "BROWN DROP FADE",
      //ivy league
      "PURPLE IVY LEAGUE HAIR CUT",
      "RED IVY LEAGUE HAIR CUT",
      "BLONDE IVY LEAGUE HAIR CUT",
      "BLUE IVY LEAGUE HAIR CUT",
      "GREEN IVY LEAGUE HAIR CUT",
      "BLACK IVY LEAGUE HAIR CUT",
      "BROWN IVY LEAGUE HAIR CUT",
      //attractive
      "GREEN ATTRACTIVE TEXTURED CROP",
      "RED ATTRACTIVE TEXTURED CROP",
      "NAVY ATTRACTIVE TEXTURED CROP",
    ],
  },
];

const shuffleLayerConfigurations = false;

const debugLogs = false;

const format = {
  width: 2000,
  height: 2000,
  smoothing: false,
};

const gif = {
  export: false,
  repeat: 0,
  quality: 100,
  delay: 500,
};

const text = {
  only: false,
  color: "#ffffff",
  size: 20,
  xGap: 40,
  yGap: 40,
  align: "left",
  baseline: "top",
  weight: "regular",
  family: "Courier",
  spacer: " => ",
};

const pixelFormat = {
  ratio: 2 / 128,
};

const background = {
  generate: true,
  brightness: "80%",
  static: false,
  default: "#000000",
};

const extraMetadata = {};

const rarityDelimiter = "#";

const uniqueDnaTorrance = 10000;

const preview = {
  thumbPerRow: 5,
  thumbWidth: 50,
  imageRatio: format.height / format.width,
  imageName: "preview.png",
};

const preview_gif = {
  numberOfImages: 5,
  order: "ASC", // ASC, DESC, MIXED
  repeat: 0,
  quality: 100,
  delay: 500,
  imageName: "preview.gif",
};

module.exports = {
  format,
  baseUri,
  description,
  background,
  uniqueDnaTorrance,
  layerConfigurations,
  rarityDelimiter,
  preview,
  shuffleLayerConfigurations,
  debugLogs,
  extraMetadata,
  pixelFormat,
  text,
  namePrefix,
  network,
  solanaMetadata,
  gif,
  preview_gif,
  includeLayers,
  excludeLayers,
  workersNumber,
  mutuallyExclusiveType,
  mutuallyExclusiveTrait,
};
