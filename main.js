require("dotenv").config();
const { dirname, join } = require("node:path");
const { existsSync, writeFileSync } = require("node:fs");
const { KamiClient } = require("./classes/client");
const { KamiDatabase } = require("./classes/database");
const { KamiIntents } = require("./constants");
const i18next = require("i18next");
const pe = require("pretty-error").start();

pe.skipNodeFiles();
pe.alias(`${dirname(require.main.filename).replace(/\\/g, "/")}/`, "kami-bot @ ");
pe.appendStyle({
  "pretty-error": {
    marginLeft: 0,
  },
  "pretty-error > header > message": {
    color: "white",
  },
  "pretty-error > trace": {
    marginTop  : 0,
    marginLeft : 1,
  },
  "pretty-error > trace > item": {
    marginBottom: 0,
  },
  "pretty-error > trace > item > header > pointer > file": {
    color: "blue",
  },
  "pretty-error > trace > item > header > pointer > line": {
    color: "yellow",
  },
  "pretty-error > trace > item > header > what": {
    color: "none",
  },
  "pretty-error > trace > item > footer > addr": {
    color: "black",
  },
  "pretty-error > trace > item > footer > extra": {
    color: "black",
  },
});

async function main() {
  const { JSONFile } = await import("lowdb/node");
  const { Low } = await import("lowdb");

  const databasePath = join(__dirname, "databases");
  const guildDatabasePath = join(databasePath, "guild.json");
  const userDatabasePath = join(databasePath, "user.json");

  if (!existsSync(guildDatabasePath)) {
    writeFileSync(guildDatabasePath, "{}", { encoding: "utf-8" });
  }

  if (!existsSync(userDatabasePath)) {
    writeFileSync(userDatabasePath, "{}", { encoding: "utf-8" });
  }

  await i18next.init({
    resources: {
      en      : require("./localization/en.json"),
      ja      : require("./localization/ja.json"),
      "zh-tw" : require("./localization/zh-TW.json"),
    },
  });

  const databases = {
    guild : new Low(new JSONFile(guildDatabasePath), {}),
    user  : new Low(new JSONFile(userDatabasePath), {}),
  };

  await databases.guild.read();
  await databases.user.read();

  const client = new KamiClient(new KamiDatabase(databases), { intents: KamiIntents });

  client.login(process.env.DEV_TOKEN);
}

main();