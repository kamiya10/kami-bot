module.exports.run = async (CommandEvent) => {
	try {
		const guildMember = (CommandEvent.isInteraction ? CommandEvent.command.options.getMember("成員") : CommandEvent.mi.mentions.members.first()) || CommandEvent.user;

		await guildMember.user.fetch(true);

		const banner = new Discord.MessageEmbed()
			.setColor(guildMember.user.hexAccentColor); //#ffcdbf

		if (guildMember.user.banner)
			banner
				.setDescription(`[WEBP](${guildMember.user.bannerURL({ size: 4096 })}) | [PNG](${guildMember.user.bannerURL({ format: "png", size: 4096 })}) | [JPG](${guildMember.user.bannerURL({ format: "jpeg", size: 4096 })}) | [GIF](${guildMember.user.bannerURL({ dynamic: true, size: 4096 })})`)
				.setImage(guildMember.user.bannerURL({ dynamic: true, size: 4096 }));
		else
			banner.setDescription("沒有橫幅可以顯示");

		if (guildMember.id == CommandEvent.user.id)
			banner.setTitle("你的橫幅");
		else
			banner.setTitle(guildMember.user.username + "的橫幅", guildMember.user.username);

		CommandEvent.isInteraction
			? await CommandEvent.mi.editReply({ embeds: [banner] })
			: await CommandEvent.mi.reply({ embeds: [banner] });
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
	name    : "banner",
	desc    : "查看使用者橫幅",
	aliases : [],
	options : [
		{
			name        : "成員",
			description : "指定成員",
			type        : "USER",
			required    : false
		}
	],
	exam  : [ "", "<@632589168438149120>", "/`成員:`<@632589168438149120>" ],
	guild : true
};