const logger = require("../Core/logger");

module.exports = {
  name: "voiceDelete",
  event: "voiceStateUpdate",
  once: false,

  /**
   * @param {import("discord.js").VoiceState} oldState
   * @param {import("discord.js").VoiceState} newState
   */
  async execute(client, oldState) {
    try {
      if (oldState.channel)
        if (client.watchedChanels.has(oldState.channelId))
          if (oldState.channel.members.filter((v) => !v.user.bot).size == 0) {
            client.watchedChanels.delete(oldState.channel.id);
            await oldState.channel.delete();
          }

      return;
    } catch (e) {
      logger.error(
        `${this.name} has encountered an error: ${e} in ${oldState.guild.name} (${oldState.guild.id})`,
      );
    }
  },
};
