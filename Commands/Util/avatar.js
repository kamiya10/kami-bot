const { Colors, EmbedBuilder, ImageFormat, SlashCommandBooleanOption, SlashCommandBuilder, SlashCommandUserOption } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("顯示頭貼")
    .addUserOption(new SlashCommandUserOption()
      .setName("成員")
      .setDescription("要顯示誰的頭貼"))
    .addBooleanOption(new SlashCommandBooleanOption()
      .setName("伺服器")
      .setDescription("是否顯示伺服器頭貼")),
  defer     : true,
  ephemeral : false,

  /**
   * @param {import("discord.js").ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const member = interaction.options.getMember("成員") || interaction.member;
    const displayGuild = interaction.options.getBoolean("伺服器");

    const avatarURLs = displayGuild == null
      ? {
        png  : member.displayAvatarURL({ extension: ImageFormat.PNG, forceStatic: true, size: 4096 }),
        jpeg : member.displayAvatarURL({ extension: ImageFormat.JPEG, forceStatic: true, size: 4096 }),
        webp : member.displayAvatarURL({ extension: ImageFormat.WebP, forceStatic: true, size: 4096 }),
        gif  : member.displayAvatarURL({ extension: ImageFormat.GIF, size: 4096 }),
      }
      : displayGuild
        ? {
          png  : member.avatarURL({ extension: ImageFormat.PNG, forceStatic: true, size: 4096 }),
          jpeg : member.avatarURL({ extension: ImageFormat.JPEG, forceStatic: true, size: 4096 }),
          webp : member.avatarURL({ extension: ImageFormat.WebP, forceStatic: true, size: 4096 }),
          gif  : member.avatarURL({ extension: ImageFormat.GIF, size: 4096 }),
        }
        : {
          png  : member.user.avatarURL({ extension: ImageFormat.PNG, forceStatic: true, size: 4096 }),
          jpeg : member.user.avatarURL({ extension: ImageFormat.JPEG, forceStatic: true, size: 4096 }),
          webp : member.user.avatarURL({ extension: ImageFormat.WebP, forceStatic: true, size: 4096 }),
          gif  : member.user.avatarURL({ extension: ImageFormat.GIF, size: 4096 }),
        };

    const avatarURL = displayGuild == null
      ? member.displayAvatarURL({ size: 256 })
      : displayGuild
        ? member.avatarURL({ size: 256 })
        : member.user.avatarURL({ size: 256 });

    const md = `[PNG](${avatarURLs.png}) | [JPEG](${avatarURLs.jpeg}) | [WEBP](${avatarURLs.webp}) | [GIF](${avatarURLs.gif})`;

    const error = avatarURL
      ? null
      : displayGuild
        ? "這個成員沒有伺服器頭貼"
        : "這個成員沒有頭貼";

    const embed = new EmbedBuilder()
      .setColor(Colors.Blue)
      .setImage(avatarURL)
      .setTimestamp();

    if (!error)
      embed
        .setTitle(`${member ? `${member.displayName} ` : "你"}的${displayGuild ? "伺服器" : ""}頭貼`)
        .setDescription(md);
    else
      embed
        .setDescription(error);

    await interaction.editReply({ embeds: [ embed ] });
  },
};