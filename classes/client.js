const { Client, Collection, Events } = require("discord.js");
const { existsSync, readFileSync, readdirSync } = require("node:fs");
const { KamiStates } = require("./states");
const { Logger } = require("./logger");
const path = require("node:path");

const ListenerFolder = path.join(__dirname, "..", "listeners");
const CommandFolder = path.join(__dirname, "..", "commands");

class KamiClient extends Client {
  constructor(database, clientOptions) {
    super(clientOptions);
    this.database = database;

    let cachedState;

    if (existsSync("./.cache/states.json")) {
      cachedState = JSON.parse(readFileSync("./.cache/states.json", { encoding: "utf-8" }));
    }

    this.states = new KamiStates(cachedState);
    this.listeners = new Collection();
    this.commands = new Collection();

    this.loadListeners();
    this.loadCommands();

    this.once(Events.ClientReady, () => {
      this.sweepStates();
    });
  }

  loadListeners() {
    for (const filename of readdirSync(ListenerFolder)) {
      /**
       * @type {import("./listener").KamiListener}
       */
      const listener = require(path.join(ListenerFolder, filename))(this);

      this.listeners.set(listener.name, listener);

      if (listener.callOnce) {
        this.once(listener.event, listener.callback);
      } else {
        this.on(listener.event, listener.callback);
      }
    }
  }

  loadCommands() {
    for (const category of readdirSync(CommandFolder)) {
      const CategoryFolder = path.join(CommandFolder, category);

      for (const filename of readdirSync(CategoryFolder)) {
        /**
         * @type {import("./command").KamiCommand}
         */
        const command = require(path.join(CategoryFolder, filename))(this);
        this.commands.set(command.builder.name, command);
      }
    }
  }

  reloadCommands(name) {
    try {
      const command = this.commands.get(name);

      if (command) {
        delete require.cache[require.resolve(command.filePath)];
        this.commands.delete(command.data.name);

        const newCommand = require(command.filePath);
        this.commands.set(newCommand.data.name, newCommand);
        Logger.info(`Reloaded command /${name}.`);
      } else {
        Logger.error(`Command /${name} not found.`);
      }
    } catch (error) {
      Logger.error(error);
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

module.exports = { KamiClient };