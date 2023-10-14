// @ts-check

const { Events, VoiceChannel } = require("discord.js");
const { KamiListener } = require("../classes/listener");

/**
 * Temporary voice channel deletion event listener.
 * @param {import("../classes/client").KamiClient} client
 * @returns {KamiListener}
 */
const onVoiceDelete = (client) => new KamiListener("voiceCreate")
  .on(Events.VoiceStateUpdate, async (oldState) => {
    try {
      if (oldState.channel instanceof VoiceChannel) {
        if (client.states.voice.has(oldState.channel.id)) {
          if (oldState.channel.members.filter(m => !m.user.bot).size == 0) {
            const id = oldState.channel.id;

            await oldState.channel.delete("Temporary Voice Channel");
            client.states.voice.delete(id);
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  });

module.exports = onVoiceDelete;