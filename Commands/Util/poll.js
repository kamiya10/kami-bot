const { Colors, EmbedBuilder, SlashCommandBuilder, SlashCommandStringOption } = require("discord.js");
const logger = require("../../Core/logger");

const e = [
	"1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣",
	"6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟",
	"🇦", "🇧", "🇨", "🇩", "🇪", "🇫", "🇬",
	"🇭", "🇮", "🇯", "🇰", "🇱", "🇲", "🇳",
	"🇴", "🇵", "🇶", "🇷", "🇸", "🇹", "🇺",
	"🇻", "🇼", "🇽", "🇾", "🇿",
];

module.exports = {
	data: new SlashCommandBuilder()
		.setName("poll")
		.setDescription("發起投票")
		.addStringOption(new SlashCommandStringOption()
			.setName("問題")
			.setDescription("要提問的問題")
			.setRequired(true))
		.addStringOption(new SlashCommandStringOption()
			.setName("選項")
			.setDescription("要提問的問題，使用半形逗號分隔")
			.setRequired(true)),
	defer: true,
	/**
     * @param {import("discord.js").CommandInteraction} interaction
     */
	async execute(interaction) {
		const question = interaction.options.getString("問題");
		const option = interaction.options.getString("選項").split(",");

		const embed = new EmbedBuilder()
			.setColor(Colors.Blue)
			.setAuthor({ name: interaction.member.displayName, iconURL: interaction.member.displayAvatarURL({ dynamic: true }) })
			.setTitle(question)
			.setDescription(option.map((v, i) => `${e[i]} ${v}`).join("\n"))
			.setTimestamp();

		const sent = await interaction.editReply({ embeds: [ embed ] });
		try {
			option.forEach(async (v, i) => await sent.react(e[i]));
		} catch (error) {
			logger.error(`${error}`);
		}
		return;
	},
};