import { ChannelType, GuildMember, VoiceChannel } from 'discord.js';

import type { Guild } from 'discord.js';
import type { GuildDataModel } from '@/database/GuildDatabase';
import type { UserDataModel } from '@/database/UserDatabase';
import { EventHandler } from '@/class/event';
import { user, voiceChannel } from '@/database/schema';
import { eq } from 'drizzle-orm';

const getName = (
  uvd: UserDataModel['voice'],
  gvd: GuildDataModel['voice'],
  channelId: string,
  guildId: string,
): string => {
  let name = '{displayName}\'s Room';

  if (gvd.global.name != null) {
    name = gvd.global.name;
  }

  if (gvd[channelId].name != null) {
    name = gvd[channelId].name!;
  }

  if (uvd.global.name != null) {
    name = uvd.global.name;
  }

  if (uvd[guildId]?.name != null) {
    name = uvd[guildId].name!;
  }

  if (gvd[channelId].name != null && gvd[channelId].nameOverride == true) {
    name = gvd[channelId].name!;
  }

  return name;
};

const getBitrate = (
  uvd: UserDataModel['voice'],
  gvd: GuildDataModel['voice'],
  channelId: string,
  guild: Guild,
): number => {
  let bitrate = 64_000;

  if (gvd.global.bitrate != null) {
    bitrate = gvd.global.bitrate * 1000;
  }
  else if (gvd[channelId].bitrate != null) {
    bitrate = gvd[channelId].bitrate * 1000;
  }
  else if (uvd.global.bitrate != null) {
    bitrate = uvd.global.bitrate * 1000;
  }
  else if (uvd[channelId]?.bitrate != null) {
    bitrate = uvd[channelId].bitrate * 1000;
  }

  if (
    gvd[channelId].bitrate != null
    && gvd[channelId].bitrateOverride == true
  ) {
    bitrate = gvd[channelId].bitrate * 1000;
  }

  if (bitrate > guild.maximumBitrate) {
    bitrate = guild.maximumBitrate;
  }

  return bitrate;
};

const getUserLimit = (
  uvd: UserDataModel['voice'],
  gvd: GuildDataModel['voice'],
  channelId: string,
): number => {
  let limit = 0;

  if (gvd.global.limit != null) {
    limit = gvd.global.limit;
  }
  else if (gvd[channelId].limit != null) {
    limit = gvd[channelId].limit!;
  }
  else if (uvd.global.limit != null) {
    limit = uvd.global.limit;
  }
  else if (uvd[channelId]?.limit != null) {
    limit = uvd[channelId].limit!;
  }

  if (gvd[channelId].limit != null && gvd[channelId].limitOverride == true) {
    limit = gvd[channelId].limit!;
  }

  return limit;
};

interface VoiceSettings {
  name: string | null;
  bitrate: number | null;
  limit: number | null;
  region: string | null;
}

const resolveSetting = <K extends keyof VoiceSettings>(
  property: K,
  guild: VoiceSettings,
  user: VoiceSettings,
): VoiceSettings[K] => {
  return user[property] ?? guild[property];
};

const formatVoiceName
  = (name: string = , member: GuildMember): string => {
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
    if (!(newState.channel instanceof VoiceChannel)) {
      return;
    }

    if (!(newState.member instanceof GuildMember)) {
      return;
    }

    const guildVoiceData = await this.database.query.voiceChannel.findFirst({
      where: eq(voiceChannel.channelId, newState.channel.id),
    });

    if (!guildVoiceData) return;

    const userVoiceData = await this.database.query.user.findFirst({
      where: eq(user.id, newState.member.id),
    });

    if (newState.channel.id in guildVoiceData) {
      const channel = await newState.guild.channels.create({
        name: formatVoiceName(
          resolveSetting(
            'name',
            guildVoiceData,
            userVoiceData,
          ),
          newState.member,
        ),
        type: ChannelType.GuildVoice,
        bitrate: getBitrate(
          userVoiceData,
          guildVoiceData,
          newState.channel.id,
          newState.guild,
        ),
        userLimit: getUserLimit(
          userVoiceData,
          guildVoiceData,
          newState.channel.id,
        ),
        rtcRegion: getVoiceRegion(
          userVoiceData,
          guildVoiceData,
          newState.channel.id,
        ),
        parent: guildVoiceData[newState.channel.id].category,
        reason: 'Temporary Voice Channel',
      });

      this.states.voice.set(channel.id, {
        categoryId: guildVoiceData[newState.channel.id].category,
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
