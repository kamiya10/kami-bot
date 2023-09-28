const { Colors, GuildMember, ImageFormat, SlashCommandBooleanOption, SlashCommandBuilder, SlashCommandUserOption } = require("discord.js");
const { EmbedBuilder, codeBlock, hyperlink } = require("@discordjs/builders");
const { KamiCommand } = require("../../classes/command");

/**
 * The /avatar command.
 * @param {import("../../classes/client").KamiClient} client
 * @returns {KamiCommand}
 */
const avatar = (client) => new KamiCommand({
  dev     : true,
  builder : new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("Get the avatar of a member.")
    .addUserOption(new SlashCommandUserOption()
      .setName("member")
      .setDescription("The member to get the avatar of."))
    .addBooleanOption(new SlashCommandBooleanOption()
      .setName("server")
      .setDescription("Get the server specific avatar.")),
  async execute(interaction) {
    try {
      const member = interaction.options.getMember("member") ?? interaction.member;
      const server = interaction.options.getBoolean("server");
      const urls = {};
      const embed = new EmbedBuilder()
        .setAuthor({
          name    : `Avatar | ${member.displayName}`,
          iconURL : member.displayAvatarURL(),
        });

      if (member instanceof GuildMember) {
        await member.fetch(true);

        if (typeof server == "boolean") {
          if (server) {
            if (member.avatar) {
              embed.setThumbnail(member.avatarURL({ size: 256 }));
              urls.jpeg = member.avatarURL({ extension: ImageFormat.JPEG, size: 4096, forceStatic: false });
              urls.png = member.avatarURL({ extension: ImageFormat.PNG, size: 4096, forceStatic: false });
              urls.webp = member.avatarURL({ extension: ImageFormat.WebP, size: 4096, forceStatic: false });
              urls.gif = member.avatarURL({ extension: ImageFormat.GIF, size: 4096 });
            } else {
              embed
                .setColor(Colors.Red)
                .setDescription("❌ This member has no server specific avatar.");
            }
          } else {
            embed.setThumbnail(member.user.displayAvatarURL({ size: 256 }));
            urls.jpeg = member.user.displayAvatarURL({ extension: ImageFormat.JPEG, size: 4096, forceStatic: false });
            urls.png = member.user.displayAvatarURL({ extension: ImageFormat.PNG, size: 4096, forceStatic: false });
            urls.webp = member.user.displayAvatarURL({ extension: ImageFormat.WebP, size: 4096, forceStatic: false });
            urls.gif = member.user.displayAvatarURL({ extension: ImageFormat.GIF, size: 4096 });
          }
        } else {
          embed.setThumbnail(member.displayAvatarURL({ size: 256 }));
          urls.jpeg = member.displayAvatarURL({ extension: ImageFormat.JPEG, size: 4096, forceStatic: false });
          urls.png = member.displayAvatarURL({ extension: ImageFormat.PNG, size: 4096, forceStatic: false });
          urls.webp = member.displayAvatarURL({ extension: ImageFormat.WebP, size: 4096, forceStatic: false });
          urls.gif = member.displayAvatarURL({ extension: ImageFormat.GIF, size: 4096 });
        }

        embed
          .setColor(Colors.Blue)
          .setDescription(`**Image Formats:**\n${["JPEG", "PNG", "WebP", "GIF"].map(format => hyperlink(format, urls[ImageFormat[format]])).join("🔸")}`);
      } else {
        embed
          .setColor(Colors.Red)
          .setDescription("❌ Member not found.");
      }

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      const embed = new EmbedBuilder()
        .setColor(Colors.Red)
        .setTitle("🛑 Uncaught Exception")
        .setDescription(`Error stack:\n${codeBlock("ansi", error.stack)}`);
      await interaction.editReply({ embeds: [embed] });
    }
  },
});

module.exports = avatar;