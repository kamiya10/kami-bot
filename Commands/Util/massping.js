// const CommandEvent = require("../../Classes/CommandEvent.js").CommandEvent;
/**
 *
 * @param {CommandEvent} CommandEvent
 * @returns
 */
module.exports.run = async (CommandEvent) => {
	try {
		const pingtype = CommandEvent.command.options.getString("標記");
		const content = [];
		const mention = [];

		if (pingtype == "samevc")
			if (CommandEvent.user?.voice?.channelId) {
				content.push(`正在標記在 <#${CommandEvent.user.voice.channel.id}> 裡的成員\n`);
				CommandEvent.user.voice.channel.members.map(v => content.push(`<@${v.id}>`));
				CommandEvent.user.voice.channel.members.map(v => mention.push(v.id));
			} else
				throw "ERR_USER_NOT_IN_VOICE";

		await CommandEvent.mi.reply({ content: content.join(""), allowedMentions: { users: mention } });
	} catch (e) {
		let embed;
		if (e == "ERR_USER_NOT_IN_VOICE")
			embed = new Discord.MessageEmbed()
				.setColor(CommandEvent.client.colors.error)
				.setTitle(CommandEvent.client.embedStat.error)
				.setDescription("你必須在語音頻道內才能使用這個指令")
				.setFooter(e);

		if (!embed) {
			embed = new Discord.MessageEmbed()
				.setColor(CommandEvent.client.colors.error)
				.setTitle(CommandEvent.client.embedStat.error)
				.setDescription(`發生了預料之外的錯誤：\`${e.toString()}\``)
				.setFooter("ERR_UNCAUGHT_EXCEPTION");
			console.error(e);
		}

		await CommandEvent.mi.editReply({ embeds: [embed], allowedMentions: { repliedUser: true } });
		return;
	}
};

module.exports.help = {
	name    : "massping",
	desc    : "大量標記成員",
	options : [
		{
			name        : "標記",
			description : "要標記的種類",
			type        : "STRING",
			required    : true,
			choices     : [
				{
					name  : "同一語音頻道",
					value : "samevc"
				}
			]
		}
	],
	slash : true,
	exam  : ["`標記:`同一語音頻道"]
};