const { ApplicationCommandType } = require("discord-api-types/v10");
const { ContextMenuCommandBuilder } = require("@discordjs/builders");
const { Colors, EmbedBuilder } = require("discord.js");

module.exports = {
	data: new ContextMenuCommandBuilder()
		.setName("Make It A Quote")
		.setNameLocalization("zh-TW", "讓他變名言")
		.setType(ApplicationCommandType.Message)
		.setDMPermission(false),
	defer: true,
	/**
     * @param {import("discord.js").MessageContextMenuCommandInteraction} interaction
     */
	async execute(interaction) {
		const embed = new EmbedBuilder();
		const content = interaction.targetMessage.content;
		if (!content.length) {
			embed
				.setColor(Colors.Red)
				.setDescription("沒有可以變成名言的東西");

			await interaction.editReply({ embeds: [embed] });
			return;
		}

		const quote = "***❝  " + content.split("\n").join("***\n***　") + " ❞***" + `\n　　　　　　　　—— ${interaction.targetMessage.member.displayName} (${new Date(Date.now()).getFullYear()})`;
		embed
			.setColor(interaction.targetMessage.member.displayHexColor)
			.setDescription(quote)
			.setFields({ name: "樣式碼", value: "```md\n" + quote + "\n```" });
		await interaction.editReply({ embeds: [embed] });
		return;
	},
};