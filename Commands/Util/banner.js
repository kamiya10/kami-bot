const { SlashCommandBuilder, SlashCommandUserOption } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("banner")
		.setDescription("顯示個人檔案橫幅")
		.addUserOption(new SlashCommandUserOption()
			.setName("成員")
			.setDescription("要顯示誰的個人檔案橫幅")),
	defer: true,
	/**
     * @param {import("discord.js").CommandInteraction} interaction
     */
	async execute(interaction) {
		const member = interaction.options.getMember("成員");
		await member.fetch({ force: true });
		const bannerURLs = {
			png  : interaction.user.bannerURL({ format: "png", size: 4096 }),
			jpeg : interaction.user.bannerURL({ format: "jpeg", size: 4096 }),
			webp : interaction.user.bannerURL({ format: "webp", size: 4096 }),
			gif  : interaction.user.bannerURL({ format: "gif", dynamic: true, size: 4096 }),
		};
		const bannerURL = interaction.user.bannerURL({ dynamic: true });
		const md = `[PNG](${bannerURLs.png}) | [JPEG](${bannerURLs.jpeg}) | [WEBP](${bannerURLs.webp}) | [GIF](${bannerURLs.gif})`;

		const error = bannerURL
			? "這個成員沒有個人檔案橫幅"
			: undefined;

		const embed = new MessageEmbed()
			.setColor("BLUE")
			.setImage(bannerURL)
			.setTimestamp();

		if (!error)
			embed
				.setTitle(`${member ? `${member.displayName} ` : "你"}的個人檔案橫幅`)
				.setDescription(md);
		else
			embed
				.setDescription(error);

		await interaction.editReply({ embeds: [ embed ] });
		return;
	},
};