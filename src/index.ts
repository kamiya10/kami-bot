import "dotenv/config";
import "@/init";

import { existsSync, writeFileSync } from "fs";
import { JSONFile } from "lowdb/node";
import { KamiClient } from "@/classes/client";
import { KamiDatabase } from "@/classes/database";
import { KamiIntents } from "@/constants";
import { Low } from "lowdb";
import { resolve } from "path";

import type { ClientDatabase } from "@/classes/client";
import type { GuildDataModel } from "@/databases/GuildDatabase";
import type { UserDataModel } from "@/databases/UserDatabase";

const databasePath = resolve("database");
const guildDatabasePath = resolve(databasePath, "guild.json");
const userDatabasePath = resolve(databasePath, "user.json");

if (!existsSync(guildDatabasePath)) {
  writeFileSync(guildDatabasePath, "{}", { encoding: "utf-8" });
}

if (!existsSync(userDatabasePath)) {
  writeFileSync(userDatabasePath, "{}", { encoding: "utf-8" });
}

const databases: ClientDatabase = {
  guild: new Low<Record<string, GuildDataModel>>(
    new JSONFile(guildDatabasePath),
    {},
  ),
  user: new Low<Record<string, UserDataModel>>(
    new JSONFile(userDatabasePath),
    {},
  ),
};

await databases.guild.read();
await databases.user.read();

const client = new KamiClient(new KamiDatabase(databases), {
  intents: KamiIntents,
});

await client.login(process.env["DEV_TOKEN"]);
