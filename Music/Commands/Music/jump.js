module.exports.run = async (CommandEvent) => {
	try {
		const jumpto = CommandEvent.command.options.getInteger("編號");

		if (!CommandEvent.client.music.get(CommandEvent.guild.id)?.connection)
			throw "ERR_NO_CONNECTION";
		if (!CommandEvent.client.music.get(CommandEvent.guild.id)?.player)
			throw "ERR_NO_PLAYER";

		if (jumpto < 1 || jumpto > CommandEvent.client.music.get(CommandEvent.guild.id).length)
			throw "ERR_INVALID_PARAMETER@INDEX";
		if (CommandEvent.client.music.get(CommandEvent.guild.id).mode == 3)
			throw "ERR_NOT_SUPPORTED";

		CommandEvent.client.music.get(CommandEvent.guild.id).mode == 2
			? CommandEvent.client.music.get(CommandEvent.guild.id).nowIndex = jumpto - 1
			: CommandEvent.client.music.get(CommandEvent.guild.id).nowIndex = jumpto - 2;

		CommandEvent.client.music.get(CommandEvent.guild.id).player.stop();

		await CommandEvent.mi.editReply({ content: `⤵️ 跳到第 ${jumpto} 首` });
	} catch (e) {
		let embed;
		if (e == "ERR_NO_CONNECTION")
			embed = new Discord.MessageEmbed()
				.setColor(CommandEvent.client.colors.error)
				.setTitle(CommandEvent.client.embedStat.error)
				.setDescription("我沒有連接到語音頻道")
				.setFooter(e);

		if (e == "ERR_NO_PLAYER")
			embed = new Discord.MessageEmbed()
				.setColor(CommandEvent.client.colors.error)
				.setTitle(CommandEvent.client.embedStat.error)
				.setDescription("現在沒有在放音樂")
				.setFooter(e);

		if (e == "ERR_INVALID_PARAMETER@INDEX")
			embed = new Discord.MessageEmbed()
				.setColor(CommandEvent.client.colors.error)
				.setTitle(CommandEvent.client.embedStat.error)
				.setDescription("提供的編號不存在")
				.setFooter(e);

		if (e == "ERR_NOT_SUPPORTED@INDEX")
			embed = new Discord.MessageEmbed()
				.setColor(CommandEvent.client.colors.error)
				.setTitle(CommandEvent.client.embedStat.error)
				.setDescription("目前不支援隨機播放模式下跳轉歌曲")
				.setFooter(e);

		if (!embed) {
			embed = new Discord.MessageEmbed()
				.setColor(CommandEvent.client.colors.error)
				.setTitle(CommandEvent.client.embedStat.error)
				.setDescription(`發生了預料之外的錯誤：\`${e.toString()}\``)
				.setFooter("ERR_UNCAUGHT_EXCEPTION");
			console.error(e);
		}

		await CommandEvent.mi.editReply({ embeds: [embed], allowedMentions: { repliedUser: true }, ephemeral: true });
		return;
	}
};

module.exports.help = {
	name    : "jump",
	desc    : "跳到指定歌曲",
	options : [
		{
			name        : "編號",
			description : "要跳到的編號",
			type        : "INTEGER",
			required    : true
		}
	],
	slash : true,
	exam  : [],
	guild : true
};