import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "fs";
import { createHash } from "crypto";
import path from "path";

import { Client, type ClientOptions, Collection, Events } from "discord.js";
import type { Low } from "lowdb";
import { SingleBar } from "cli-progress";

import type { KamiListener, ListenerBuilder } from "@/classes/listener";
import { KamiStates, type KamiStatesOptions } from "@/classes/states";
import type { GuildDataModel } from "@/databases/GuildDatabase";
import type { KamiCommand } from "@/classes/command";
import type { KamiDatabase } from "@/classes/database";
import { Logger } from "@/classes/logger";
import type { UserDataModel } from "@/databases/UserDatabase";

import Commands from "@/commands/commands";

export interface ClientDatabase {
  guild: Low<Record<string, GuildDataModel>>;
  user: Low<Record<string, UserDataModel>>;
}

export class KamiClient extends Client {
  database: KamiDatabase;
  states: KamiStates;
  eventListeners: Collection<string, KamiListener>;
  commands: Collection<string, KamiCommand>;

  constructor(database: KamiDatabase, clientOptions: ClientOptions) {
    super(clientOptions);
    this.database = database;

    let cachedState;

    if (existsSync("./.cache/states.json")) {
      cachedState = JSON.parse(
        readFileSync("./.cache/states.json", { encoding: "utf-8" })
      ) as KamiStatesOptions;
    }

    this.states = new KamiStates(this, cachedState);
    this.eventListeners = new Collection();
    this.commands = new Collection();

    for (const build of Commands) {
      const command = build(this);
      this.commands.set(command.builder.name, command);
    }

    console.log(this.commands);

    void this.loadListeners();

    this.once(Events.ClientReady, () => {
      this.sweepStates();
      void this.updateCommands();
    });
  }

  async loadListeners() {
    const __dirname = new URL("..", import.meta.url).href;
    const listenersDir = path.join(__dirname.slice(8), "listeners");

    for (const filename of readdirSync(listenersDir)) {
      const listener = (
        (await import(
          path.join(__dirname, "listeners", filename)
        )) as ListenerBuilder
      ).build(this);

      this.eventListeners.set(listener.name, listener);

      if (listener.callOnce) {
        this.once(listener.event, (...args) => void listener.callback(...args));
      } else {
        this.on(listener.event, (...args) => void listener.callback(...args));
      }
    }
  }

  async updateCommands() {
    if (!existsSync("./.cache")) {
      mkdirSync("./.cache");
    }

    if (!existsSync("./.cache/DEV_COMMAND_VERSION")) {
      writeFileSync("./.cache/DEV_COMMAND_VERSION", "", { encoding: "utf-8" });
    }

    const version = readFileSync("./.cache/DEV_COMMAND_VERSION", {
      encoding: "utf-8",
    });

    const commands = this.commands.map((command) => command.builder.toJSON());

    const hash = createHash("sha256")
      .update(JSON.stringify(commands))
      .digest()
      .toString();

    if (hash == version) {
      Logger.info(
        "Command Version is the same. Skipping command registration."
      );
      return;
    } else {
      Logger.info("Command Version is different! Registering commands...");
      writeFileSync("./.cache/DEV_COMMAND_VERSION", hash, {
        encoding: "utf-8",
      });

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
          Logger.blank();
          Logger.error(error, commands);
        }

        count++;
        bar.update(count);

        if (count == this.guilds.cache.size) {
          Logger.blank();
          Logger.success("Done.");
        }
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
