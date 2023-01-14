const { ChannelType, Colors, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("autonews")
    .setNameLocalization("zh-TW", "自動公告發佈頻道")
    .setDescription("Display a list of configured AutoNews channels.")
    .setDescriptionLocalization("zh-TW", "查看已設定的自動公告發佈頻道列表。")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  defer: true,

  /**
   *
   * @param {import("discord.js").ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setAuthor({ name: `自動公告發佈頻道 | ${interaction.guild.name}`, iconURL: interaction.guild.iconURL({ dynamic: true }) })
      .setColor(Colors.Blue)
      .setFooter({ text: "在頻道的主題加上 [AutoNews] 就可以把頻道設為自動公告發佈頻道" })
      .setTimestamp();

    const autonews = interaction.guild.channels.cache.filter(channel => channel?.topic?.includes("[AutoNews]"))
      .map(channel => {
        const permissions = [];

        if (channel.type != ChannelType.GuildAnnouncement)
          return `~~\`${channel.id}\` ${channel}~~　❌ __**非 [公告頻道](https://support.discord.com/hc/zh-tw/articles/360032008192)**__`;

        if (!channel.permissionsFor(interaction.guild.members.me).has(PermissionFlagsBits.ViewChannel))
          permissions.push("**讀取訊息**");

        if (!channel.permissionsFor(interaction.guild.members.me).has(PermissionFlagsBits.ManageMessages))
          permissions.push("**管理訊息**");

        if (!channel.permissionsFor(interaction.guild.members.me).has(PermissionFlagsBits.AddReactions))
          permissions.push("**新增反應**");

        return `${permissions.length ? "~~" : ""}\`${channel.id}\` ${channel}${permissions.length ? `~~　⚠️ __缺少 ${permissions.join("、")} 權限__` : "　✅ 已啟用"}`;
      });

    if (autonews.length)
      embed.setDescription(autonews.join("\n"));
    else
      embed
        .setDescription("*`這個伺服器尚未設定自動公告發佈頻道`*");

    await interaction.editReply({ embeds: [embed] });
  },
};