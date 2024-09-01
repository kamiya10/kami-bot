import { Client, Collection, Events } from "discord.js";
import { existsSync, readFileSync } from "fs";
import { join, resolve } from "path";
import { KamiStates } from "@/classes/states";
import { Logger } from "@/classes/logger";
import { SingleBar } from "cli-progress";

import type { ClientOptions } from "discord.js";
import type { GuildDataModel } from "@/databases/GuildDatabase";
import type { KamiCommand } from "@/commands";
import type { KamiDatabase } from "@/classes/database";
import type { KamiStatesOptions } from "@/classes/states";
import type { Low } from "lowdb";
import type { UserDataModel } from "@/databases/UserDatabase";

import commands from "@/commands";
import events from "@/events";

export interface ClientDatabase {
  guild: Low<Record<string, GuildDataModel>>;
  user: Low<Record<string, UserDataModel>>;
}

export class KamiClient extends Client {
  database: KamiDatabase;
  states: KamiStates;
  commands = new Collection<string, KamiCommand>();
  
  cacheDirectory = resolve(".cache");

  constructor(database: KamiDatabase, clientOptions: ClientOptions) {
    super(clientOptions);
    this.database = database;

    let cachedState;

    if (existsSync("./.cache/states.json")) {
      cachedState = JSON.parse(
        readFileSync("./.cache/states.json", { encoding: "utf-8" }),
      ) as KamiStatesOptions;
    }

    this.states = new KamiStates(this, cachedState);

    for (const command of commands) {
      this.commands.set(command.data.name, command);
    }

    void this.loadListeners();

    this.once(Events.ClientReady, () => {
      this.sweepStates();
      void this.updateCommands();
    });
  }

  loadListeners() {
    for (const listener of events) {
      if (listener.on) {
        const on = listener.on;
        this.on(listener.name, (...args) => void on.apply(this, args));
      }
      if (listener.once) {
        const once = listener.once;
        this.once(listener.name, (...args) => void once.apply(this, args));
      }
    }
  }

  async updateCommands() {
    const lockfile = Bun.file(join(this.cacheDirectory, "commands.lock"));

    const commands = this.commands.map((command) => command.data.toJSON());

    const hash = new Bun.CryptoHasher("sha256")
      .update(JSON.stringify(commands))
      .digest("hex");

    if (await lockfile.text().catch(e => void e) == hash) {
      Logger.debug("Command Version is the same. Skipping command registration.");
      return;
    }
    
    Logger.info("Command Version is different! Registering commands...");
      
    await Bun.write(lockfile, hash);

    const bar = new SingleBar({
      format: "{bar} {percentage}% | {value} of {total} Guilds",
      hideCursor: true,
    });

    let count = 0;
    bar.start(this.guilds.cache.size, 0);

    setInterval(() => {
      bar.updateETA();
    }, 1000);

    for (const [, guild] of this.guilds.cache) {
      try {
        await guild.commands.set(commands);
      } catch (error) {
        if (error instanceof Error) {
          Logger.blank();
          Logger.error(`Error while updating command for ${guild}: ${error}`, commands);
        }
      }

      count++;
      bar.update(count);

      if (count == this.guilds.cache.size) {
        Logger.blank();
        Logger.info("Done.");
      }
    }
  }

  sweepStates() {
    for (const [id] of this.states.voice) {
      if (!this.channels.cache.has(id)) {
        this.states.voice.delete(id);
      }
    }
  }
}
