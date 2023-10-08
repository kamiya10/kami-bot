const { Collection } = require("discord.js");

class KamiStates {
  constructor(data = {}) {
    this.voice = new Collection(data.voice);
  }

  toJSON() {
    return {
      voice: this.voice.toJSON(),
    };
  }
}

module.exports = { KamiStates };