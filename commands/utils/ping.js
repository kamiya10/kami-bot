const { KamiCommand } = require("../../classes/command");
const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = (client) => new KamiCommand({
  dev      : true,
  filePath : __filename,
  builder  : new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Check if the bot is alive or not."),
  async execute(interaction) {
    await interaction.editReply("Pong!");
  },
});