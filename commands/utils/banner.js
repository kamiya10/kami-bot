const { Colors, GuildMember, ImageFormat, SlashCommandBooleanOption, SlashCommandBuilder, SlashCommandUserOption } = require("discord.js");
const { EmbedBuilder, codeBlock, hyperlink } = require("@discordjs/builders");
const { KamiCommand } = require("../../classes/command");

/**
 * The /banner command.
 * @param {import("../../classes/client").KamiClient} client
 * @returns {KamiCommand}
 */
const banner = () => new KamiCommand({
  dev      : true,
  filePath : __filename,
  builder  : new SlashCommandBuilder()
    .setName("banner")
    .setDescription("Get the banner of a member.")
    .addUserOption(new SlashCommandUserOption()
      .setName("member")
      .setDescription("The member to get the banner of."))
    .addBooleanOption(new SlashCommandBooleanOption()
      .setName("server")
      .setDescription("Get the server specific banner.")),
  async execute(interaction) {
    try {
      const member = interaction.options.getMember("member") ?? interaction.member;

      const urls = {};
      const embed = new EmbedBuilder()
        .setAuthor({
          name    : `Banner | ${member.displayName}`,
          iconURL : member.displayAvatarURL(),
        });

      if (member instanceof GuildMember) {
        await member.fetch(true);

        if (member.user.banner) {
          embed.setImage(member.user.bannerURL({ size: 256 }));
          urls.jpeg = member.user.bannerURL({ extension: ImageFormat.JPEG, size: 4096, forceStatic: false });
          urls.png = member.user.bannerURL({ extension: ImageFormat.PNG, size: 4096, forceStatic: false });
          urls.webp = member.user.bannerURL({ extension: ImageFormat.WebP, size: 4096, forceStatic: false });
          urls.gif = member.user.bannerURL({ extension: ImageFormat.GIF, size: 4096 });

          embed
            .setColor(Colors.Blue)
            .setDescription(`**Image Formats:**\n${["JPEG", "PNG", "WebP", "GIF"].map(format => hyperlink(format, urls[ImageFormat[format]])).join("🔸")}`);
        } else {
          embed
            .setColor(Colors.Red)
            .setDescription("❌ This member has no banner.");
        }
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

module.exports = banner;