/* eslint-disable no-irregular-whitespace */
module.exports.run = async (CommandEvent) => {
	try {
		if (!CommandEvent.client.music.get(CommandEvent.guild.id)?.connection)
			throw "ERR_NO_CONNECTION";
		if (!CommandEvent.client.music.get(CommandEvent.guild.id)?.player)
			throw "ERR_NO_PLAYER";

		const current = CommandEvent.client.music.get(CommandEvent.guild.id).queue[CommandEvent.client.music.get(CommandEvent.guild.id).nowIndex];

		CommandEvent.client.music.get(CommandEvent.guild.id).queue = shuffle(CommandEvent.client.music.get(CommandEvent.guild.id).queue);
		CommandEvent.client.music.get(CommandEvent.guild.id).nowIndex = CommandEvent.client.music.get(CommandEvent.guild.id).queue.indexOf(current);

		let title = CommandEvent.client.music.get(CommandEvent.guild.id).queue.map((q, i, a) => (((i == CommandEvent.client.music.get(CommandEvent.guild.id).nowIndex) && (CommandEvent.client.music.get(CommandEvent.guild.id).player.state.status != "idle")) ? (CommandEvent.client.music.get(CommandEvent.guild.id).player.state.status == "paused") ? "⏸️ **" : (CommandEvent.client.music.get(CommandEvent.guild.id).mode == 2) ? "🔂 **" : "▶️ **" : "▪️ ") + `\`${i < 9 && a.length >= 10 ? " " : ""}${i + 1}.\` ${q.user}${q.playlist ? `[${q.playlist.title}]**\n　　**` : ""} [${(q.title.length > 27) ? q.title.substr(0, 26).replace(/([[\]()])/g, "\\$1") + "…" : q.title.replace(/([[\]()])/g, "\\$1")}](${q.url})` + (((i == CommandEvent.client.music.get(CommandEvent.guild.id).nowIndex) && (CommandEvent.client.music.get(CommandEvent.guild.id).player.state.status != "idle")) ? "**" : ""));

		title = getSubset(title, title[CommandEvent.client.music.get(CommandEvent.guild.id).nowIndex], 10);

		const queue = new Discord.MessageEmbed()
			.setColor(CommandEvent.client.colors.info)
			.setAuthor(CommandEvent.guild.name, CommandEvent.guild.iconURL({ dynamic: true }))
			.setTitle(CommandEvent.client.embedStat.success)
			.setDescription("已成功隨機化目前播放清單")
			.addField("播放清單", title.join("\n"))
			.setTimestamp();

		await CommandEvent.mi.editReply({ embeds: [queue] });
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
	name    : "shuffle",
	desc    : "隨機化目前播放清單",
	options : [],
	slash   : true,
	exam    : [],
	guild   : true
};

function getSubset(array, value, size) {
	if (array.length <= size) return array;
	const index = array.indexOf(value) - (size - 1) / 2,
		max = Math.max(index, 0),
		min = Math.min(max, array.length - size);
	return array.slice(min, min + size);
}

function shuffle(array) {
	let currentIndex = array.length, randomIndex;

	// While there remain elements to shuffle...
	while (currentIndex != 0) {

		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;

		// And swap it with the current element.
		[ array[currentIndex], array[randomIndex] ] = [ array[randomIndex], array[currentIndex] ];
	}

	return array;
}