import { Client, Collection, Events, type ClientOptions } from "discord.js";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { KamiStates, type KamiStatesOptions } from "./states";
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

    this.states = new KamiStates(cachedState);
    this.eventListeners = new Collection();
    this.commands = new Collection();

    void this.loadListeners();
    void this.loadCommands();

    this.once(Events.ClientReady, () => {
      this.sweepStates();
    });
  }

  async loadListeners() {
    for (const filename of readdirSync("./src/listeners")) {
      const listener = (await import(`../listeners/${filename}`) as ListenerBuilder).build(this);

      this.eventListeners.set(listener.name, listener);

      if (listener.callOnce) {
        this.once(listener.event, listener.callback);
      } else {
        this.on(listener.event, listener.callback);
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

  sweepStates() {
    for (const [id] of this.states.voice) {
      if (!this.channels.cache.has(id)) {
        this.states.voice.delete(id);
      }
    }
  }
}