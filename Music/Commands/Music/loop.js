module.exports.run = async (CommandEvent) => {
	try {
		const mode = CommandEvent.command.options.getInteger("模式");

		if (!CommandEvent.client.music.get(CommandEvent.guild.id)?.connection)
			throw "ERR_NO_CONNECTION";
		if (!CommandEvent.client.music.get(CommandEvent.guild.id)?.player)
			throw "ERR_NO_PLAYER";

		CommandEvent.client.music.get(CommandEvent.guild.id);

		const loop = new Discord.MessageEmbed();
		const modes = [ "▶️ 正常", "🔁 循環", "🔂 單曲循環", "🔀 隨機" ];

		switch(mode) {
			case 0:
			case 1:
			case 2:
			case 3: {
				CommandEvent.client.music.get(CommandEvent.guild.id).mode = mode;
				loop.setColor(CommandEvent.client.colors.success)
					.setAuthor(CommandEvent.guild.name, CommandEvent.guild.iconURL({ dynamic: true }))
					.setTitle(CommandEvent.client.embedStat.success)
					.setDescription(`已將播放模式設為 **${modes[CommandEvent.client.music.get(CommandEvent.guild.id).mode]}**`)
					.setFooter(CommandEvent.user.displayName, CommandEvent.user.user.avatarURL({ dynamic: true }))
					.setTimestamp();
				break;
			}
			default:
				loop.setColor(CommandEvent.client.colors.info)
					.setDescription(`目前播放模式: **${modes[CommandEvent.client.music.get(CommandEvent.guild.id).mode]}**`);
		}
		await CommandEvent.mi.editReply({ embeds: [loop] });
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
	name    : "loop",
	desc    : "播放模式",
	options : [
		{
			name        : "模式",
			description : "機器人播放音樂的模式",
			type        : "INTEGER",
			required    : false,
			choices     : [
				{
					"name"  : "正常",
					"value" : 0
				},
				{
					"name"  : "循環",
					"value" : 1
				},
				{
					"name"  : "單曲循環",
					"value" : 2
				},
				{
					"name"  : "隨機",
					"value" : 3
				}
			]
		}
	],
	slash : true,
	exam  : [],
	guild : true
};