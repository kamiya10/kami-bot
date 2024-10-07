import { EventHandler } from '@/class/event';
import { guildVoiceChannel } from '@/database/schema';
import { eq } from 'drizzle-orm';
import logger from 'logger';

/**
 * Temporary voice channel deletion event listener.
 * @param {KamiClient} client
 * @returns {KamiListener}
 */
export default new EventHandler({
  event: 'channelDelete',
  async on(channel) {
    if (!channel.isVoiceBased()) return;

    const result = await this.database
      .select({
        channelId: guildVoiceChannel.channelId,
      })
      .from(guildVoiceChannel);

    const list = result.map((v) => v.channelId);

    if (list.includes(channel.id)) {
      logger.info(
        `Removing #${channel.name} from temporary voice creator as channel is being deleted.`,
      );
      await this.database
        .delete(guildVoiceChannel)
        .where(eq(guildVoiceChannel.channelId, channel.guild.id));
      this.states.voice.delete(channel.id);
    }
  },
});
