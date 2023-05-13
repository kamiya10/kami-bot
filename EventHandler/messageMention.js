const { ChannelType, EmbedBuilder, time } = require("discord.js");

module.exports = {
  name  : "messageMention",
  event : "messageCreate",
  once  : false,

  /**
   * @param {import("discord.js").Client} client
   * @param {import("discord.js").Message} message
   */
  async execute(client, message) {
    // if (!client.database.GuildDatabase.get(message.guild.id).messageMention) return;

    if (message.author.bot) return;

    if ((client.database.UserDatabase.get(message.user.id).message_mention ?? true) != true) return;

    const match = message.content.match(/^https:\/\/discord\.com\/channels\/(\d+)\/(\d+)\/(\d+)$/);

    if (match == null) return;

    if (match[1] != message.guild.id) return;

    /**
     * @type {import("discord.js").Message<true>}
     */
    const mentioned = await message.guild.channels.cache.get(match[2]).messages.fetch({ message: match[3] }).catch(() => void 0);

    if (mentioned == null || mentioned.partial) return;

    if (mentioned.content.length) {

      if (mentioned.member == null)
        await mentioned.guild.members.fetch({ user: mentioned.author.id });

      const embed = new EmbedBuilder()
        .setColor(mentioned.member.displayHexColor)
        .setAuthor({ name: mentioned.member.displayName, iconURL: mentioned.member.displayAvatarURL() })
        .setDescription(mentioned.content)
        .setTimestamp(mentioned.createdAt);
      await message.reply({ content: `${mentioned.author} ${time(mentioned.createdAt, "F")}, 在 ${mentioned.channel}, 在 ${mentioned.guild}`, embeds: [embed, ...mentioned.embeds], allowedMentions: { parse: [] } });
    } else if (mentioned.embeds.length) {
      await message.reply({ content: `${mentioned.author} ${time(mentioned.createdAt, "F")}, 在 ${mentioned.channel}, 在 ${mentioned.guild}`, embeds: mentioned.embeds, allowedMentions: { parse: [] } });
    }
  },
};