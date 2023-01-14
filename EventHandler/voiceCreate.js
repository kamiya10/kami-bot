const { ChannelType, Collection, PermissionFlagsBits } = require("discord.js");
const censor = require("discord-censor");
const logger = require("../Core/logger");

module.exports = {
  name  : "voiceCreate",
  event : "voiceStateUpdate",
  once  : false,

  /**
   *
   * @param {import("discord.js").Client} client
   * @param {import("discord.js").VoiceState} oldState
   * @param {import("discord.js").VoiceState} newState
   */
  async execute(client, oldState, newState) {
    try {
      if (oldState.channelId == newState.channelId
			|| !newState.channelId
			|| newState.member.user.bot) return;

      if (!client.cooldowns.has("autovoice"))
        client.cooldowns.set("autovoice", new Collection());

      const now = Date.now();
      const timestamps = client.cooldowns.get("autovoice");
      const cooldownAmount = 10 * 1000;

      const GuildSettings = await client.database.GuildDatabase.get(newState.guild.id);
      const UserSettings = await client.database.UserDatabase.get(newState.member.id);

      if (!GuildSettings?.voice?.length) return;

      const channel = newState.channel;
      const setting = GuildSettings.voice.find(o => o.creator == channel?.id);
      const guildMember = newState.member;
      const placeholder = {
        "{user.displayName}" : guildMember.displayName,
        "{user.name}"        : guildMember.user.username,
        "{user.tag}"         : guildMember.user.tag,
      };

      if (setting) {
        let finalName = UserSettings?.voice?.name
          ? UserSettings.voice.name.replace(/{.+}/g, all => placeholder[all] || all)
          : setting.channelSettings.name
            ? setting.channelSettings.name.replace(/{.+}/g, all => placeholder[all] || all)
            : `${newState.member.displayName} 的房間`;

        if (censor.check(finalName)) finalName = censor.censor(finalName);

        const category = setting.category
          ? newState.guild.channels.cache.get(setting.category)
          : channel.parent;

        /**
				 * @type {import("discord.js").OverwriteResolvable[]}
				 */
        const perms = newState.guild.members.me.permissions.has(PermissionFlagsBits.Administrator)
          ? [
            { id: client.user.id, allow: [ PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ManageRoles ] },
            {
              id    : newState.member.id,
              allow : [
                PermissionFlagsBits.Connect,
                PermissionFlagsBits.Stream,
                PermissionFlagsBits.Speak,
                PermissionFlagsBits.MuteMembers,
                PermissionFlagsBits.ManageChannels,
                PermissionFlagsBits.ManageRoles,
                PermissionFlagsBits.UseVAD,
                PermissionFlagsBits.PrioritySpeaker,
                PermissionFlagsBits.MoveMembers,
              ],
            },
          ]
          : [
            { id: client.user.id, allow: [PermissionFlagsBits.ManageChannels] },
            {
              id    : newState.member.id,
              allow : [
                PermissionFlagsBits.Connect,
                PermissionFlagsBits.Stream,
                PermissionFlagsBits.Speak,
                PermissionFlagsBits.MuteMembers,
                PermissionFlagsBits.ManageChannels,
                PermissionFlagsBits.UseVAD,
                PermissionFlagsBits.PrioritySpeaker,
              ],
            },
          ];

        /**
				 * @type {import("discord.js").Role[]}
				 */
        const muterole = newState.guild.roles.cache.reduce((a, v) => {
          if (v.name == "Muted") a.push(v);
          return a;
        }, []);

        if (muterole.length > 0) perms.push({ id: muterole[0].id, deny: [ PermissionFlagsBits.Connect, PermissionFlagsBits.Speak ] });
        perms.concat(Array.from(channel.parent.permissionOverwrites.cache.values()));

        /**
				 * @type {import("discord.js").GuildChannelCreateOptions}
				 */
        const channelSetting = {
          name                 : finalName,
          type                 : ChannelType.GuildVoice,
          parent               : category,
          userLimit            : +(UserSettings?.voice?.limit ? UserSettings.voice.limit : setting.channelSettings.limit),
          bitrate              : +(UserSettings?.voice?.bitrate ? UserSettings.voice.bitrate : setting.channelSettings.bitrate),
          rtcRegion            : UserSettings?.voice?.region ? UserSettings.voice.region : setting.channelSettings.region ?? null,
          videoQualityMode     : +(UserSettings?.voice?.quality ? UserSettings.voice.quality : setting.channelSettings.quality ?? 1),
          permissionOverwrites : perms,
          reason               : "自動創建語音頻道 | Auto Voice Channel",
        };

        await newState.guild.channels.create(channelSetting)
          .then(async ch => {
            await newState.setChannel(ch);
            client.watchedChanels.set(ch.id, { master: newState.member.id, creator: setting.creator });
            timestamps.set(newState.member.id, now);
            setTimeout(() => timestamps.delete(newState.member.id), cooldownAmount);
          });
      }
    } catch (e) {
      logger.error(`${this.name} has encountered an error: ${e} in ${oldState.guild.name} (${oldState.guild.id})`);
      logger.error(e);
    }
  },
};