import { ChannelType } from 'discord.js';
import { EventHandler } from '@/class/event';
import { formatVoiceName, resolveSetting } from '@/utils/voice';
import { guildVoiceChannel, userVoiceChannel } from '@/database/schema';
import { eq } from 'drizzle-orm';

import logger from 'logger';

/**
 * Temporary voice channel creation event listener.
 * @param {KamiClient} client
 * @returns {KamiListener}
 */
export default new EventHandler({
  event: 'voiceStateUpdate',
  async on(_, newState) {
    if (!newState.channel) return;
    if (!newState.member) return;

    const guildData
      = await this.database.query.guildVoiceChannel.findFirst({
        where: eq(guildVoiceChannel.channelId, newState.channel.id),
      });

    if (!guildData) return;

    const userData = await this.database.query.userVoiceChannel.findFirst({
      where: eq(userVoiceChannel.userId, newState.member.id),
    });

    const channel = await newState.guild.channels
      .create({
        name: formatVoiceName(resolveSetting('name', guildData, userData), newState.member),
        type: ChannelType.GuildVoice,
        userLimit: resolveSetting('limit', guildData, userData),
        bitrate: resolveSetting('bitrate', guildData, userData),
        rtcRegion: resolveSetting('region', guildData, userData) ?? undefined,
        videoQualityMode: resolveSetting('videoQuality', guildData, userData),
        rateLimitPerUser: resolveSetting('slowMode', guildData, userData),
        nsfw: resolveSetting('nsfw', guildData, userData),
        parent: guildData.categoryId,
        reason: 'Temporary Voice Channel',
      })
      .catch(logger.error);

    if (!channel) return;

    this.states.voice.set(channel.id, {
      categoryId: guildData.categoryId,
      creatorId: newState.channel.id,
      ownerId: newState.member.id,
      defaultOptions: {
        name: channel.name,
        bitrate: channel.bitrate,
        limit: channel.userLimit,
        region: channel.rtcRegion,
      },
    });

    await newState.member.voice
      .setChannel(channel, 'Temporary Voice Channel')
      .catch(logger.error);
  },
});
