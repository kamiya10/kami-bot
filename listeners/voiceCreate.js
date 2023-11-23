// @ts-check

const { ChannelType, Events, VoiceChannel } = require("discord.js");
const { KamiListener } = require("../classes/listener");
const { Logger } = require("../classes/logger");

const getName =

/**
 * Gets a user's voice channel name.
 * @param {Record<string, import("../databases/UserDatabase").VoiceSettings>} uvd
 * @param {Record<string, import("../databases/GuildDatabase").GuildVoiceSettings>} gvd
 * @param {string} channelId
 * @return {string} name
 */
(uvd, gvd, channelId, guildId) => {
  let name = "{displayName}'s Room";

  if (gvd.global.name != null) {
    name = gvd.global.name;
  }

  if (gvd[channelId].name != null) {
    name = gvd[channelId].name;
  }

  if (uvd.global.name != null) {
    name = uvd.global.name;
  }

  if (uvd[guildId] && uvd[guildId].name != null) {
    name = uvd[guildId].name;
  }

  if (gvd[channelId].name != null && gvd[channelId].nameOverride == true) {
    name = gvd[channelId].name;
  }

  return name;
};

const getBitrate =

/**
 * Gets a user's voice channel bitrate.
 * @param {Record<string, import("../databases/UserDatabase").VoiceSettings>} uvd
 * @param {Record<string, import("../databases/GuildDatabase").GuildVoiceSettings>} gvd
 * @param {string} channelId
 * @param {import("discord.js").Guild} guild
 * @return {number} bitrate
 */
(uvd, gvd, channelId, guild) => {
  let bitrate = 64_000;

  if (gvd.global.bitrate != null) {
    bitrate = gvd.global.bitrate * 1000;
  } else if (gvd[channelId].bitrate != null) {
    bitrate = gvd[channelId].bitrate * 1000;
  } else if (uvd.global.bitrate != null) {
    bitrate = uvd.global.bitrate * 1000;
  } else if (uvd[channelId] && uvd[channelId].bitrate != null) {
    bitrate = uvd[channelId].bitrate * 1000;
  }

  if (gvd[channelId].bitrate != null && gvd[channelId].bitrateOverride == true) {
    bitrate = gvd[channelId].bitrate * 1000;
  }

  if (bitrate > guild.maximumBitrate) {
    bitrate = guild.maximumBitrate;
  }

  return bitrate;
};

const getLimit =

/**
 * Gets a user's voice channel user limit.
 * @param {Record<string, import("../databases/UserDatabase").VoiceSettings>} uvd
 * @param {Record<string, import("../databases/GuildDatabase").GuildVoiceSettings>} gvd
 * @param {string} channelId
 * @return {number} limit
 */
(uvd, gvd, channelId) => {
  let limit = 0;

  if (gvd.global.limit != null) {
    limit = gvd.global.limit;
  } else if (gvd[channelId].limit != null) {
    limit = gvd[channelId].limit;
  } else if (uvd.global.limit != null) {
    limit = uvd.global.limit;
  } else if (uvd[channelId] && uvd[channelId].limit != null) {
    limit = uvd[channelId].limit;
  }

  if (gvd[channelId].limit != null && gvd[channelId].limitOverride == true) {
    limit = gvd[channelId].limit;
  }

  return limit;
};

const getRegion =

/**
 * Gets a user's voice channel region.
 * @param {Record<string, import("../databases/UserDatabase").VoiceSettings>} uvd
 * @param {Record<string, import("../databases/GuildDatabase").GuildVoiceSettings>} gvd
 * @param {string} channelId
 * @return {string} region
 */
(uvd, gvd, channelId) => {
  let region;

  if (gvd.global.region != null) {
    region = gvd.global.region;
  } else if (gvd[channelId].region != null) {
    region = gvd[channelId].region;
  } else if (uvd.global.region != null) {
    region = uvd.global.region;
  } else if (uvd[channelId] && uvd[channelId].region != null) {
    region = uvd[channelId].region;
  }

  if (gvd[channelId].region != null && gvd[channelId].regionOverride == true) {
    region = gvd[channelId].region;
  }

  return region;
};

const formatVoiceName =

/**
 * @param {string} name
 * @param {import("discord.js").GuildMember} member
 * @returns {string} name
 */
(name, member) => {
  name = name.replace(/({displayName})/g, member.displayName);
  name = name.replace(/({nickname})/g, member.nickname);
  name = name.replace(/({username})/g, member.user.username);
  name = name.replace(/({globalName})/g, member.user.globalName);
  name = name.replace(/({tag})/g, member.user.tag);
  return name;
};

/**
 * Temporary voice channel creation event listener.
 * @param {import("../classes/client").KamiClient} client
 * @returns {KamiListener}
 */
const onVoiceCreate = (client) => new KamiListener("voiceCreate")
  .on(Events.VoiceStateUpdate, async (oldState, newState) => {
    try {
      if (newState.channel instanceof VoiceChannel) {
        const userVoiceData = client.database.user(newState.member.id).voice;
        const guildVoiceData = client.database.guild(newState.guild.id).voice;

        if (newState.channel.id in guildVoiceData) {
          const channel = await newState.guild.channels.create({
            name      : formatVoiceName(getName(userVoiceData, guildVoiceData, newState.channel.id, newState.guild.id), newState.member),
            type      : ChannelType.GuildVoice,
            bitrate   : getBitrate(userVoiceData, guildVoiceData, newState.channel.id, newState.guild),
            userLimit : getLimit(userVoiceData, guildVoiceData, newState.channel.id),
            rtcRegion : getRegion(userVoiceData, guildVoiceData, newState.channel.id),
            parent    : guildVoiceData[newState.channel.id].category,
            reason    : "Temporary Voice Channel",
          });

          client.states.voice.set(channel.id, {
            categoryId     : guildVoiceData[newState.channel.id].category,
            creatorId      : newState.channel.id,
            ownerId        : newState.member.id,
            defaultOptions : {
              name    : channel.name,
              bitrate : channel.bitrate,
              limit   : channel.userLimit,
              region  : channel.rtcRegion,
            },
          });

          await newState.member.voice.setChannel(channel, "Temporary Voice Channel");
        }
      }
    } catch (error) {
      Logger.error(error);
    }
  });

module.exports = onVoiceCreate;