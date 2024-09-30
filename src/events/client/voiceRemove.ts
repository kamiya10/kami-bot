import { EventHandler } from '@/class/event';
import logger from 'logger';

/**
 * Temporary voice channel deletion event listener.
 * @param {KamiClient} client
 * @returns {KamiListener}
 */
export default new EventHandler ({
  event: 'channelDelete',
  async on(channel) {
    if (!channel.isVoiceBased()) return;

    if (channel.id in this.database.guild(channel.guild.id).voice) {
      logger.info(`Removing #${channel.name} from temporary voice creator as channel is being deleted.`);
      delete this.database.guild(channel.guild.id).voice[channel.id];
      await this.database.database.user.write();
    }
  },
});
