const { existsSync, mkdirSync } = require("node:fs");
const { Collection } = require("discord.js");
const { Logger } = require("./logger");
const { join } = require("node:path");
const { writeFile } = require("node:fs/promises");

class KamiStates {
  constructor(data = {}) {
    this.voice = new Collection(data.voice);
  }

  async save() {
    Logger.info("Saving states...");

    try {
      if (!existsSync("./.cache")) {
        mkdirSync("./.cache");
      }

      await writeFile(join("./.cache", "states.json"), JSON.stringify(this.toJSON()), { encoding: "utf-8" });
    } catch (error) {
      Logger.error(error);
      Logger.warn("States within this session is not saved.");
    }
  }

  toJSON() {
    return {
      voice: [...this.voice.entries()],
    };
  }
}

module.exports = { KamiStates };