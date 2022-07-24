module.exports.run = async (CommandEvent) => {
	try {
		const volume = CommandEvent.command.options.getInteger("音量");

		if (!CommandEvent.client.music.get(CommandEvent.guild.id)?.connection)
			throw "ERR_NO_CONNECTION";
		if (!CommandEvent.client.music.get(CommandEvent.guild.id)?.player)
			throw "ERR_NO_PLAYER";

		if (volume < 0)
			throw "ERR_INVALID_PARAMETER@VOLUME";

		CommandEvent.client.music.get(CommandEvent.guild.id).player.state.resource.volume.setVolume((volume / 100) * 0.5);
		CommandEvent.client.music.get(CommandEvent.guild.id).volume = volume / 100;

		const embed = new Discord.MessageEmbed()
			.setColor(CommandEvent.client.colors.success)
			.setAuthor(CommandEvent.guild.name, CommandEvent.guild.iconURL({ dynamic: true }))
			.setTitle(CommandEvent.client.embedStat.success)
			.setDescription(`已將音量設為: **${volume}%**${volume > 1000 ? "  *破音啦～～～*" : ""}`)
			.setFooter(CommandEvent.user.displayName, CommandEvent.user.user.avatarURL({ dynamic: true }))
			.setTimestamp();

		await CommandEvent.mi.editReply({ embeds: [embed] });
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

		if (e == "ERR_INVALID_PARAMETER@VOLUME")
			embed = new Discord.MessageEmbed()
				.setColor(CommandEvent.client.colors.error)
				.setTitle(CommandEvent.client.embedStat.error)
				.setDescription("音量必須為正數")
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
	name    : "volume",
	desc    : "調整音量",
	options : [
		{
			name        : "音量",
			description : "要調整到的音量，單位：%",
			type        : "INTEGER",
			required    : true
		}
	],
	slash : true,
	exam  : [],
	guild : true
};