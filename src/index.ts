import "dotenv/config";
import { dirname, resolve } from "node:path";
import { existsSync, writeFileSync } from "node:fs";
import { KamiClient, type ClientDatabase } from "./classes/client";
import { KamiDatabase } from "./classes/database";
import { KamiIntents } from "./constants";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import i18next from "i18next";
import strings from "./localization/strings";
import PrettyError from "pretty-error";
import type { GuildDataModel } from "./databases/GuildDatabase";
import type { UserDataModel } from "./databases/UserDatabase";

const pe = PrettyError.start() as PrettyError;

pe.skipNodeFiles();
pe.alias(`${dirname(import.meta.url).replace(/\\/g, "/")}/`, "kami-bot @ ");
pe.appendStyle({
  "pretty-error": {
    marginLeft: 0,
  },
  "pretty-error > header > message": {
    color: "white",
  },
  "pretty-error > trace": {
    marginTop: 0,
    marginLeft: 1,
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

const databasePath = resolve("database");
const guildDatabasePath = resolve(databasePath, "guild.json");
const userDatabasePath = resolve(databasePath, "user.json");

if (!existsSync(guildDatabasePath)) {
  writeFileSync(guildDatabasePath, "{}", { encoding: "utf-8" });
}

if (!existsSync(userDatabasePath)) {
  writeFileSync(userDatabasePath, "{}", { encoding: "utf-8" });
}

await i18next.init({
  resources: strings,
});

const databases: ClientDatabase = {
  guild: new Low<Record<string, GuildDataModel>>(new JSONFile(guildDatabasePath), {}),
  user: new Low<Record<string, UserDataModel>>(new JSONFile(userDatabasePath), {}),
};

await databases.guild.read();
await databases.user.read();

const client = new KamiClient(new KamiDatabase(databases), { intents: KamiIntents });

await client.login(process.env.DEV_TOKEN);