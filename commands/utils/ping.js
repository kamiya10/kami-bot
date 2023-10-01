const { EmbedBuilder, SlashCommandBuilder, TimestampStyles, codeBlock, time } = require("@discordjs/builders");
const { Colors } = require("discord.js");
const { KamiCommand } = require("../../classes/command");

/**
 * The /ping command.
 * @param {import("../../classes/client").KamiClient} client
 * @returns {KamiCommand}
 */
const ping = (client) => new KamiCommand({
  dev      : true,
  filePath : __filename,
  builder  : new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Check if the bot is alive or not."),
  async execute(interaction) {
    try {
      const start = Date.now();
      const sent = await interaction.editReply("Pong!");
      const end = Date.now();
      const latency = end - start;

      const embed = new EmbedBuilder()
        .setAuthor({
          name    : `Ping | ${interaction.member.displayName}`,
          iconURL : interaction.member.displayAvatarURL(),
        })
        .setColor(latency >= 1000 ? Colors.Red : latency >= 500 ? Colors.Yellow : Colors.Green)
        .addFields(...[{
          name  : "Clock",
          value : `💬 **Message Time**: ${time(~~(sent.createdTimestamp / 1000), TimestampStyles.LongDate)}${time(~~(sent.createdTimestamp / 1000), TimestampStyles.LongTime)}.${`${new Date(~~(sent.createdTimestamp / 1000)).getMilliseconds()}`.padStart(3, "0")}\n🤖 **Bot Time**: ${time(~~(end / 1000), TimestampStyles.LongDate)}${time(~~(end / 1000), TimestampStyles.LongTime)}.${`${new Date(~~(end / 1000)).getMilliseconds()}`.padStart(3, "0")}`,
        }, {
          name  : "Latency",
          value : `⌛ **Ping**: ${latency}ms\n💓 **Heartbeat**: ${client.ws.ping}ms`,
        }])
        .setTimestamp();

      await interaction.editReply({ content: "Pong!", embeds: [embed] });
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
module.exports = ping;
