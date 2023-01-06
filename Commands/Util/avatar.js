const { Colors, EmbedBuilder, SlashCommandBooleanOption, SlashCommandBuilder, SlashCommandUserOption } = require("discord.js");

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
  defer: true,

  /**
   * @param {import("discord.js").ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const member = interaction.options.getMember("成員") || interaction.member;
    const displayGuild = interaction.options.getBoolean("伺服器");
    const avatarURLs = displayGuild == undefined
      ? {
        png  : member.displayAvatarURL({ format: "png", size: 4096 }),
        jpeg : member.displayAvatarURL({ format: "jpeg", size: 4096 }),
        webp : member.displayAvatarURL({ format: "webp", size: 4096 }),
        gif  : member.displayAvatarURL({ format: "gif", dynamic: true, size: 4096 }),
      }
      : displayGuild
        ? {
          png  : member.avatarURL({ format: "png", size: 4096 }),
          jpeg : member.avatarURL({ format: "jpeg", size: 4096 }),
          webp : member.avatarURL({ format: "webp", size: 4096 }),
          gif  : member.avatarURL({ format: "gif", dynamic: true, size: 4096 }),
        }
        : {
          png  : member.user.avatarURL({ format: "png", size: 4096 }),
          jpeg : member.user.avatarURL({ format: "jpeg", size: 4096 }),
          webp : member.user.avatarURL({ format: "webp", size: 4096 }),
          gif  : member.user.avatarURL({ format: "gif", dynamic: true, size: 4096 }),
        };

    const avatarURL = displayGuild == undefined
      ? member.displayAvatarURL({ dynamic: true })
      : displayGuild
        ? member.avatarURL({ dynamic: true })
        : member.user.avatarURL({ dynamic: true });

    const md = `[PNG](${avatarURLs.png}) | [JPEG](${avatarURLs.jpeg}) | [WEBP](${avatarURLs.webp}) | [GIF](${avatarURLs.gif})`;

    const error = avatarURL
      ? displayGuild
        ? "這個成員沒有伺服器頭貼"
        : "這個成員沒有頭貼"
      : undefined;

    const embed = new EmbedBuilder()
      .setColor(Colors.Blue)
      .setImage(avatarURL)
      .setTimestamp();

    if (error)
      embed
        .setTitle(`${member ? `${member.displayName} ` : "你"}的${displayGuild ? "伺服器" : ""}頭貼`)
        .setDescription(md);
    else
      embed
        .setDescription(error);

    await interaction.editReply({ embeds: [ embed ] });
  },
};