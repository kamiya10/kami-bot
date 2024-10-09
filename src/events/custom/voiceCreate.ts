import { ChannelType } from 'discord.js';
import { guildVoiceChannel, userVoiceChannel } from '@/database/schema';
import { EventHandler } from '@/class/event';
import { eq } from 'drizzle-orm';
import { formatVoiceName, resolveSetting } from '@/utils/voice';

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

    const guildVoiceData
      = await this.database.query.guildVoiceChannel.findFirst({
        where: eq(guildVoiceChannel.channelId, newState.channel.id),
      });

    if (!guildVoiceData) return;

    const userVoiceData = await this.database.query.userVoiceChannel.findFirst({
      where: eq(userVoiceChannel.userId, newState.member.id),
    });

    const channel = await newState.guild.channels.create({
      name: formatVoiceName(
        resolveSetting('name', guildVoiceData, userVoiceData),
        newState.member,
      ),
      type: ChannelType.GuildVoice,
      userLimit: resolveSetting('limit', guildVoiceData, userVoiceData),
      bitrate: resolveSetting('bitrate', guildVoiceData, userVoiceData),
      rtcRegion:
        resolveSetting('region', guildVoiceData, userVoiceData) ?? undefined,
      videoQualityMode: resolveSetting(
        'videoQuality',
        guildVoiceData,
        userVoiceData,
      ),
      rateLimitPerUser: resolveSetting(
        'slowMode',
        guildVoiceData,
        userVoiceData,
      ),
      nsfw: resolveSetting('nsfw', guildVoiceData, userVoiceData),
      parent: guildVoiceData.categoryId,
      reason: 'Temporary Voice Channel',
    });

    this.states.voice.set(channel.id, {
      categoryId: guildVoiceData.categoryId,
      creatorId: newState.channel.id,
      ownerId: newState.member.id,
      defaultOptions: {
        name: channel.name,
        bitrate: channel.bitrate,
        limit: channel.userLimit,
        region: channel.rtcRegion,
      },
    });

    await newState.member.voice.setChannel(channel, 'Temporary Voice Channel');
  },
});
