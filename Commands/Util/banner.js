const { Colors, EmbedBuilder, SlashCommandBooleanOption, SlashCommandBuilder, SlashCommandUserOption } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("banner")
    .setNameLocalization("zh-TW", "橫幅")
    .setDescription("顯示個人檔案橫幅")
    .setDescriptionLocalization("zh-TW", "Display profile banner.")
    .addUserOption(new SlashCommandUserOption()
      .setName("member")
      .setNameLocalization("zh-TW", "成員")
      .setDescription("要顯示誰的個人檔案橫幅")
      .setDescriptionLocalization("zh-TW", "The member's profile banner to display."))
    .addBooleanOption(new SlashCommandBooleanOption()
      .setName("guild")
      .setNameLocalization("zh-TW", "伺服器")
      .setDescription("Show their guild specific profile banner.")
      .setDescriptionLocalization("zh-TW", "是否顯示伺服器橫幅")),
  defer     : true,
  ephemeral : false,
  global    : true,

  /**
   * @param {import("discord.js").ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const member = interaction.options.getMember("member") || interaction.member;
    const displayGuild = interaction.options.getBoolean("guild");

    if (member.partial)
      await member.fetch({ force: true });

    const bannerURLs = {
      png  : interaction.user.bannerURL({ extension: "png", size: 4096, forceStatic: true }),
      jpeg : interaction.user.bannerURL({ extension: "jpeg", size: 4096, forceStatic: true }),
      webp : interaction.user.bannerURL({ extension: "webp", size: 4096, forceStatic: true }),
      gif  : interaction.user.bannerURL({ extension: "gif", size: 4096 }),
    };
    const bannerURL = interaction.user.bannerURL();
    const md = `[PNG](${bannerURLs.png}) | [JPEG](${bannerURLs.jpeg}) | [WEBP](${bannerURLs.webp}) | [GIF](${bannerURLs.gif})`;

    const error = bannerURL
      ? undefined
      : "這個成員沒有個人檔案橫幅";

    const embed = new EmbedBuilder()
      .setColor(Colors.Blue)
      .setImage(bannerURL)
      .setTimestamp();

    if (!error)
      embed
        .setTitle(`${member ? `${member.displayName} ` : "你"}的個人檔案橫幅`)
        .setDescription(md);
    else
      embed
        .setDescription(error);

    await interaction.editReply({ embeds: [ embed ] });
  },
};