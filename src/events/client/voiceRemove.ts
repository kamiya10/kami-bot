import { Events } from "@/classes/client";
import { Logger } from "@/classes/logger";

import type { KamiEventListener } from "@/events";

const name = Events.ChannelDelete;

/**
 * Temporary voice channel deletion event listener.
 * @param {KamiClient} client
 * @returns {KamiListener}
 */
export default {
  name,
  async on(channel) {
    if (!channel.isVoiceBased()) return;

    if (channel.id in this.database.guild(channel.guild.id).voice) {
      Logger.info(`Removing #${channel.name} from temporary voice creator as channel is being deleted.`);
      delete this.database.guild(channel.guild.id).voice[channel.id];
      await this.database.database.user.write();
    }
  },
} as KamiEventListener<typeof name>;