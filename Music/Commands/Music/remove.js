module.exports.run = async (CommandEvent) => {
	try {
		const removeIndex = CommandEvent.command.options.getInteger("編號") - 1;

		if (!CommandEvent.client.music.get(CommandEvent.guild.id)?.connection)
			throw "ERR_NO_CONNECTION";
		if (!CommandEvent.client.music.get(CommandEvent.guild.id)?.player)
			throw "ERR_NO_PLAYER";

		if ((removeIndex + 1) < 1 || (removeIndex + 1) > CommandEvent.client.music.get(CommandEvent.guild.id).length)
			throw "ERR_INVALID_PARAMETER@INDEX";

		if (CommandEvent.client.music.get(CommandEvent.guild.id).nowIndex > removeIndex) {
			if (CommandEvent.client.music.get(CommandEvent.guild.id).nowIndex != 0)
				CommandEvent.client.music.get(CommandEvent.guild.id).nowIndex -= 1;
		} else if (CommandEvent.client.music.get(CommandEvent.guild.id).nowIndex == removeIndex) {
			if (CommandEvent.client.music.get(CommandEvent.guild.id).mode != 2)
				CommandEvent.client.music.get(CommandEvent.guild.id).nowIndex -= 1;
			CommandEvent.client.music.get(CommandEvent.guild.id).player.stop();
		}

		const deleted = (CommandEvent.client.music.get(CommandEvent.guild.id).queue.splice(removeIndex, 1))[0];

		const remove = new Discord.MessageEmbed()
			.setColor(CommandEvent.client.colors.success)
			.setAuthor(CommandEvent.guild.name, CommandEvent.guild.iconURL({ dynamic: true }))
			.setTitle(CommandEvent.client.embedStat.success)
			.setThumbnail(deleted.thumbnail)
			.setDescription(`已成功從播放清單中刪除 \`#${removeIndex + 1}\` [${deleted.title}](${deleted.url})`)
			.setFooter(CommandEvent.user.displayName, CommandEvent.user.user.avatarURL({ dynamic: true }))
			.setTimestamp();

		await CommandEvent.mi.editReply({ embeds: [remove] });
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
	name    : "remove",
	desc    : "刪除指定歌曲",
	options : [
		{
			name        : "編號",
			description : "要刪除的的編號",
			type        : "INTEGER",
			required    : true
		}
	],
	slash : true,
	exam  : [],
	guild : true
};