const {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} = require("node:fs");
const { join } = require("node:path");

const cacheFolder = join(__dirname, "../.cache");
const cacheFile = join(cacheFolder, "cache.json");
let cachedData = {};

const cache = (key, data, expire) => {
  if (!existsSync(cacheFolder)) {mkdirSync(cacheFolder);}

  cachedData[key] = {
    cachedTimestamp: Date.now(),
    expiresTimestamp: expire,
    data,
  };

  writeFileSync(cacheFile, JSON.stringify(cachedData), { encoding: "utf-8" });
};

const checkExpires = (timestamp) => timestamp && Date.now() > timestamp;

cache.get = (key) => {
  if (cachedData[key])
    {if (checkExpires(cachedData[key].expiresTimestamp)) {delete cachedData[key];}}

  writeFileSync(cacheFile, JSON.stringify(cachedData), { encoding: "utf-8" });
  return cachedData[key]?.data;
};

cache.delete = (key) => {
  delete cachedData[key];
};

if (existsSync(cacheFile)) {
  cachedData = JSON.parse(readFileSync(cacheFile, { encoding: "utf-8" }));
  for (const key in cachedData)
    {if (checkExpires(cachedData[key].expiresTimestamp)) {delete cachedData[key];}}

  writeFileSync(cacheFile, JSON.stringify(cachedData), { encoding: "utf-8" });
}

module.exports = { cache };
