module.exports.run = async (CommandEvent) => {
	try {
		const guildMember = (CommandEvent.isInteraction ? CommandEvent.command.options.getMember("成員") : CommandEvent.mi.mentions.members.first()) || CommandEvent.user;
		const showServer = (CommandEvent.isInteraction ? CommandEvent.command.options.getBoolean("伺服器") : CommandEvent.command.options.includes("-s")) || false;

		const url = showServer ? guildMember.avatarURL() : guildMember.user.displayAvatarURL();
		const avatar = new Discord.MessageEmbed()
			.setColor(guildMember.displayHexColor); //#ffcdbf

		if (url)
			avatar
				.setDescription(`[WEBP](${url.replace(".webp", ".webp?size=4096")}) | [PNG](${url.replace(".webp", ".png?size=4096")}) | [JPG](${url.replace(".webp", ".jpg?size=4096")}) | [GIF](${url.replace(".webp", ".gif?size=4096")})`)
				.setImage(showServer ? guildMember.avatarURL({ dynamic: true, size: 256 }) : guildMember.user.displayAvatarURL({ dynamic: true, size: 256 }));
		else
			avatar.setDescription("沒有頭貼可以顯示");

		if (guildMember.id == CommandEvent.user.id)
			avatar.setTitle(`你的${showServer ? "伺服器" : ""}頭貼`);
		else
			avatar.setTitle(`${guildMember.user.username} 的${showServer ? "伺服器" : ""}頭貼`, guildMember.user.username);

		CommandEvent.isInteraction
			? await CommandEvent.mi.editReply({ embeds: [avatar] })
			: await CommandEvent.mi.reply({ embeds: [avatar] });
		return;
	} catch (e) {
		let embed;
		if (!embed) {
			embed = new Discord.MessageEmbed()
				.setColor(CommandEvent.client.colors.error)
				.setTitle(CommandEvent.client.embedStat.error)
				.setDescription(`發生了預料之外的錯誤：\`${e.toString()}\``)
				.setFooter("ERR_UNCAUGHT_EXCEPTION");
			console.error(e);
		}

		CommandEvent.isInteraction
			? await CommandEvent.mi.editReply({ embeds: [embed], allowedMentions: { repliedUser: true } }).catch(() => {})
			: await CommandEvent.mi.reply({ embeds: [embed], allowedMentions: { repliedUser: true } }).catch(() => {});
		return;
	}
};

module.exports.help = {
	name    : "avatar",
	desc    : "查看使用者頭貼",
	aliases : ["icon"],
	options : [
		{
			name        : "成員",
			description : "指定成員",
			type        : "USER",
			required    : false
		},
		{
			name        : "伺服器",
			description : "顯示伺服器頭貼",
			type        : "BOOLEAN",
			required    : false
		}
	],
	exam  : [ "", "<@632589168438149120>", "/`成員:`<@632589168438149120>" ],
	guild : true
};