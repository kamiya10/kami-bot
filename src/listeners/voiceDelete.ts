// @ts-check

import { Events, VoiceChannel } from "discord.js";
import { KamiListener } from "../classes/listener";
import { Logger } from "../classes/logger";
import type { KamiClient } from "../classes/client";

/**
 * Temporary voice channel deletion event listener.
 * @param {KamiClient} client
 * @returns {KamiListener}
 */
export const build = (client: KamiClient): KamiListener => new KamiListener("voiceCreate")
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
      Logger.error(error);
    }
  });