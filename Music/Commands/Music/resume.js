const { play } = require("./play");

module.exports.run = async (CommandEvent) => {
	try {
		if (!CommandEvent.client.music.get(CommandEvent.guild.id)?.connection)
			throw "ERR_NO_CONNECTION";
		if (!CommandEvent.client.music.get(CommandEvent.guild.id)?.player)
			throw "ERR_NO_PLAYER";

		if (CommandEvent.client.music.get(CommandEvent.guild.id).player.state.status == "idle")
			play(CommandEvent.client.music.get(CommandEvent.guild.id));

		CommandEvent.client.music.get(CommandEvent.guild.id).player.unpause();

		await CommandEvent.mi.editReply({ content: "▶️ 繼續播放", });
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
	name    : "resume",
	desc    : "繼續播放",
	options : [],
	slash   : true,
	exam    : [],
	guild   : true
};