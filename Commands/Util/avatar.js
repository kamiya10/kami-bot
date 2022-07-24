const { SlashCommandBooleanOption, SlashCommandBuilder, SlashCommandUserOption } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("avatar")
		.setDescription("顯示頭貼")
		.addUserOption(new SlashCommandUserOption()
			.setName("成員")
			.setDescription("要顯示誰的頭貼"))
		.addBooleanOption(new SlashCommandBooleanOption()
			.setName("伺服器")
			.setDescription("是否顯示伺服器頭貼")),
	defer: true,
	/**
     * @param {import("discord.js").CommandInteraction} interaction
     */
	async execute(interaction) {
		const member = interaction.options.getMember("成員");
		const displayGuild = interaction.options.getBoolean("伺服器");
		const avatarURLs = displayGuild == undefined
			? {
				png  : interaction.member.displayAvatarURL({ format: "png", size: 4096 }),
				jpeg : interaction.member.displayAvatarURL({ format: "jpeg", size: 4096 }),
				webp : interaction.member.displayAvatarURL({ format: "webp", size: 4096 }),
				gif  : interaction.member.displayAvatarURL({ format: "gif", dynamic: true, size: 4096 }),
			}
			: displayGuild
				? {
					png  : interaction.member.avatarURL({ format: "png", size: 4096 }),
					jpeg : interaction.member.avatarURL({ format: "jpeg", size: 4096 }),
					webp : interaction.member.avatarURL({ format: "webp", size: 4096 }),
					gif  : interaction.member.avatarURL({ format: "gif", dynamic: true, size: 4096 }),
				}
				: {
					png  : interaction.user.avatarURL({ format: "png", size: 4096 }),
					jpeg : interaction.user.avatarURL({ format: "jpeg", size: 4096 }),
					webp : interaction.user.avatarURL({ format: "webp", size: 4096 }),
					gif  : interaction.user.avatarURL({ format: "gif", dynamic: true, size: 4096 }),
				};
		const avatarURL = displayGuild == undefined
			? interaction.member.displayAvatarURL({ dynamic: true })
			: displayGuild
				? interaction.member.avatarURL({ dynamic: true })
				: interaction.user.avatarURL({ dynamic: true });

		const md = `[PNG](${avatarURLs.png}) | [JPEG](${avatarURLs.jpeg}) | [WEBP](${avatarURLs.webp}) | [GIF](${avatarURLs.gif})`;

		const error = avatarURL
			? displayGuild
				? "這個成員沒有伺服器頭貼"
				: "這個成員沒有頭貼"
			: undefined;

		const embed = new MessageEmbed()
			.setColor("BLUE")
			.setImage(avatarURL)
			.setTimestamp();

		if (error)
			embed
				.setTitle(`${member ? `${member.displayName} ` : "你"}的${displayGuild ? "伺服器" : ""}頭貼`)
				.setDescription(md);
		else
			embed
				.setDescription(error);

		await interaction.editReply({ embeds: [ embed ] });
		return;
	},
};