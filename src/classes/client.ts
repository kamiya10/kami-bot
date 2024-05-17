import { Client, Collection, Events, type ClientOptions } from "discord.js";
import { existsSync, readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { KamiStates, type KamiStatesOptions } from "./states";
import { Logger } from "./logger";
import { SingleBar } from "cli-progress";
import path from "node:path";
import type { GuildDataModel } from "../databases/GuildDatabase";
import type { Low } from "lowdb/lib";
import type { UserDataModel } from "../databases/UserDatabase";
import type { KamiDatabase } from "./database";
import type { CommandBuilder, KamiCommand } from "./command";
import type { KamiListener, ListenerBuilder } from "./listener";

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
      cachedState = JSON.parse(readFileSync("./.cache/states.json", { encoding: "utf-8" })) as KamiStatesOptions;
    }

    this.states = new KamiStates(this, cachedState);
    this.eventListeners = new Collection();
    this.commands = new Collection();

    void this.loadListeners();
    void this.loadCommands();

    this.once(Events.ClientReady, () => {
      this.sweepStates();
      void this.updateCommands();
    });
  }

  async loadListeners() {
    for (const filename of readdirSync("./src/listeners")) {
      const listener = (await import(`../listeners/${filename}`) as ListenerBuilder).build(this);

      this.eventListeners.set(listener.name, listener);

      if (listener.callOnce) {
        this.once(listener.event, () => void listener.callback());
      } else {
        this.on(listener.event, () => void listener.callback());
      }
    }
  }

  async loadCommands() {
    for (const category of readdirSync("./src/commands")) {
      const CategoryFolder = path.join("./src/commands", category);

      for (const filename of readdirSync(CategoryFolder)) {
        const command = ((await import(`../../${CategoryFolder}/${filename}`)) as CommandBuilder).build(this);
        this.commands.set(command.builder.name, command);
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

    const version = readFileSync("./.cache/DEV_COMMAND_VERSION", { encoding: "utf-8" });

    const commands = this.commands.map(command => command.builder.toJSON());

    const hash = createHash("sha256")
      .update(JSON.stringify(commands))
      .digest()
      .toString();

    if (hash == version) {
      Logger.info("Command Version is the same. Skipping command registration.");
      return;
    } else {
      Logger.info("Command Version is different! Registering commands...");
      writeFileSync("./.cache/DEV_COMMAND_VERSION", hash, { encoding: "utf-8" });

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