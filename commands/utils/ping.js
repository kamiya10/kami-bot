// @ts-check

const { EmbedBuilder, SlashCommandBuilder, TimestampStyles, codeBlock, time } = require("@discordjs/builders");
const { $at } = require("../../classes/utils");
const { t: $t } = require("i18next");
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
    .setNameLocalizations($at("slash:ping.NAME"))
    .setDescription("Check if the bot is alive or not.")
    .setDescriptionLocalizations($at("slash:ping.DESC")),
  async execute(interaction) {
    try {
      const start = Date.now();
      const sent = await interaction.editReply("Pong!");
      const end = Date.now();
      const latency = end - start;

      const embed = new EmbedBuilder()
        .setAuthor({
          name    : $t("header:ping", { lng: interaction.locale, 0: client.user.displayName }),
          iconURL : client.user.displayAvatarURL(),
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
