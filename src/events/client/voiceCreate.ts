import { ChannelType, GuildMember, VoiceChannel } from 'discord.js';
import { guildVoiceChannel, userVoiceChannel } from '@/database/schema';
import { EventHandler } from '@/class/event';
import { eq } from 'drizzle-orm';
import { t as $t } from 'i18next';
import logger from 'logger';

interface VoiceSettings {
  name: string | null;
  bitrate: number;
  limit: number;
  region: string | null;
}

type Nullable<T> = { [P in keyof T]: T[P] | null };

const resolveSetting = <K extends keyof VoiceSettings>(
  property: K,
  guild: VoiceSettings,
  user?: Nullable<VoiceSettings>,
): VoiceSettings[K] => {
  return user?.[property] ?? guild[property];
};

const formatVoiceName = (name: string, member: GuildMember): string => {
  name = name.replace(/({displayName})/g, member.displayName);
  name = name.replace(/({nickname})/g, member.nickname ?? '');
  name = name.replace(/({username})/g, member.user.username);
  name = name.replace(/({globalName})/g, member.user.globalName ?? '');
  name = name.replace(/({tag})/g, member.user.tag);
  return name;
};

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

    logger.trace(newState.channel.id, guildVoiceData);

    if (!guildVoiceData) return;

    const userVoiceData = await this.database.query.userVoiceChannel.findFirst({
      where: eq(userVoiceChannel.userId, newState.member.id),
    });

    if (newState.channel.id in guildVoiceData) {
      const channel = await newState.guild.channels.create({
        name: formatVoiceName(
          resolveSetting('name', guildVoiceData, userVoiceData)
          ?? $t('voice:default_channel_name'),
          newState.member,
        ),
        type: ChannelType.GuildVoice,
        bitrate: resolveSetting('bitrate', guildVoiceData, userVoiceData),
        userLimit: resolveSetting('limit', guildVoiceData, userVoiceData),
        rtcRegion:
          resolveSetting('region', guildVoiceData, userVoiceData) ?? undefined,
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

      await newState.member.voice.setChannel(
        channel,
        'Temporary Voice Channel',
      );
    }
  },
});
