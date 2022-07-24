const { SlashCommandBuilder } = require("@discordjs/builders");
module.exports = {
	data: new SlashCommandBuilder()
		.setName("ping")
		.setDescription("Ping"),
	defer: true,
	/**
     *
     * @param {import("discord.js").CommandInteraction} interaction
     */
	async execute(interaction) {
		await interaction.editReply("Pong!");
		return;
	},
};