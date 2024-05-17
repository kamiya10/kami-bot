import { Events } from "discord.js";
import { KamiListener } from "../classes/listener";
import { Logger } from "../classes/logger";
import type { KamiClient } from "../classes/client";

/**
 * Temporary voice channel deletion event listener.
 * @param {KamiClient} client
 * @returns {KamiListener}
 */
export const build = (client: KamiClient): KamiListener => new KamiListener("voiceCreate")
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