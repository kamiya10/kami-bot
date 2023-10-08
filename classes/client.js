const { Client } = require("discord.js");
const { KamiStates } = require("./states");
const fs = require("node:fs");
const path = require("node:path");

const ListenerFolder = path.join(__dirname, "..", "listeners");
const CommandFolder = path.join(__dirname, "..", "commands");

class KamiClient extends Client {
  constructor(database, clientOptions) {
    super(clientOptions);
    this.database = database;
    this.states = new KamiStates();

    this.listeners = new Map();

    /**
     * @type {Map<string, import("./command").KamiCommand>}
     */
    this.commands = new Map();

    this.setupListeners();
    this.loadCommands();
  }

  setupListeners() {
    for (const filename of fs.readdirSync(ListenerFolder)) {
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
    for (const category of fs.readdirSync(CommandFolder)) {
      const CategoryFolder = path.join(CommandFolder, category);

      for (const filename of fs.readdirSync(CategoryFolder)) {
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

        const newCommand = require(`./${command.data.name}.js`);
        this.commands.set(newCommand.data.name, newCommand);
        console.log(`Reloaded command /${name}.`);
      } else {
        console.error(`Command /${name} not found.`);
      }
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = { KamiClient };