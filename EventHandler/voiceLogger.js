const { ChannelType, Collection, Colors, EmbedBuilder } = require("discord.js");
const logger = require("../Core/logger");

module.exports = {
  name  : "voiceCreate",
  event : "voiceStateUpdate",
  once  : false,

  /**
   *
   * @param {import("discord.js").Client} client
   * @param {import("discord.js").VoiceState} oldState
   * @param {import("discord.js").VoiceState} newState
   */
  async execute(client, oldState, newState) {
    try {
      if (oldState.channelId != newState.channelId) {
        const enter = [];
        const leave = [];

        if (oldState.channel && newState.channel) {
          enter.push(
            new EmbedBuilder()
              .setDescription(
                `📥 ${newState.member} 加入了語音頻道（從${oldState.channel}）`,
              )
              .setColor(Colors.Green)
              .setTimestamp(),
          );
          leave.push(
            new EmbedBuilder()
              .setDescription(
                `📤 ${oldState.member} 離開了語音頻道（到${newState.channel}）`,
              )
              .setColor(Colors.Red)
              .setTimestamp(),
          );
        } else if (oldState.channel) {
          leave.push(
            new EmbedBuilder()
              .setDescription(`📤 ${oldState.member} 離開了語音頻道`)
              .setColor(Colors.Red)
              .setTimestamp(),
          );
        } else if (newState.channel) {
          enter.push(
            new EmbedBuilder()
              .setDescription(`📥 ${newState.member} 加入了語音頻道`)
              .setColor(Colors.Green)
              .setTimestamp(),
          );
        }

        if (newState.channel?.send)
          if (enter.length && newState.channel)
            await newState.channel.send({ embeds: enter }).catch(() => void 0);

        if (oldState.channel?.send)
          if (leave.length && oldState.channel)
            await oldState.channel.send({ embeds: leave }).catch(() => void 0);
      }
    } catch (e) {
      logger.error(
        `${this.name} has encountered an error: ${e} in ${oldState.guild.name} (${oldState.guild.id})`,
      );
      logger.error(e);
    }
  },
};
