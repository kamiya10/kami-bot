// @ts-check

const { Events } = require("discord.js");
const { KamiListener } = require("../classes/listener");
const { Logger } = require("../classes/logger");

/**
 * Temporary voice channel deletion event listener.
 * @param {import("../classes/client").KamiClient} client
 * @returns {KamiListener}
 */
const onVoiceRemove = (client) => new KamiListener("voiceCreate")
  .on(Events.ChannelDelete, async (channel) => {
    try {
      if (channel.isVoiceBased()) {
        if (channel.id in client.database.guild(channel.guild.id).voice) {
          Logger.info(`Removing #${channel.name} from temporary voice creator as channel is being deleted.`);
          delete client.database.guild(channel.guild.id).voice[channel.id];
          await client.database.database.user.write();
        }
      }
    } catch (error) {
      Logger.error(error);
    }
  });

module.exports = onVoiceRemove;