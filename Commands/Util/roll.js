const { SlashCommandBuilder, SlashCommandIntegerOption } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

const dice_emoji = [
	undefined,
	"<:dice_1:886444617803915295>",
	"<:dice_2:886444618072350720>",
	"<:dice_3:886444617690656849>",
	"<:dice_4:886444617954902036>",
	"<:dice_5:886444618055553034>",
	"<:dice_6:886444618139443252>",
];

module.exports = {
	data: new SlashCommandBuilder()
		.setName("roll")
		.setDescription("擲骰子")
		.addIntegerOption(new SlashCommandIntegerOption()
			.setName("面")
			.setDescription("要擲的骰子的面數")
			.setMinValue(1))
		.addIntegerOption(new SlashCommandIntegerOption()
			.setName("數量")
			.setDescription("要投擲的數量")
			.setMinValue(1)),
	defer: true,
	/**
     * @param {import("discord.js").CommandInteraction} interaction
     */
	async execute(interaction) {
		const dice = interaction.options.getInteger("面") ?? 6;
		const count = interaction.options.getInteger("數量") ?? 1;

		const result = [];
		for (let i = 0;i < count;i++)
			result.push(Math.round(Math.random() * dice));

		const desc = [];
		if (count > 10)
			desc.push(`總和 **${result.reduce((acc, v) => acc + v, 0)}**`);
		else {
			desc.push(`${result.map(v => `${dice_emoji[v] ?? "<:dice_question:886444618126868500>"} ${v}`).join("　")}`);
			desc.push(`總和 **${result.reduce((acc, v) => acc + v, 0)}**`);
		}

		const embed = new MessageEmbed()
			.setColor("BLUE")
			.setTitle("🎲 骰子")
			.setDescription(desc.join("\n"));

		await interaction.editReply({ embeds: [ embed ] });
		return;
	},
};