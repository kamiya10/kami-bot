import { Events, VoiceChannel } from "discord.js";

import type { KamiEventListener } from "@/events";

const name = Events.VoiceStateUpdate;

/**
 * Temporary voice channel deletion event listener.
 * @param {KamiClient} client
 * @returns {KamiListener}
 */
export default {
  name,
  async on(oldState) {
    if (oldState.channel instanceof VoiceChannel) {
      if (this.states.voice.has(oldState.channel.id)) {
        if (oldState.channel.members.filter(m => !m.user.bot).size == 0) {
          const id = oldState.channel.id;

          await oldState.channel.delete("Temporary Voice Channel");
          this.states.voice.delete(id);
        }
      }
    }
  },
} as KamiEventListener<typeof name>;