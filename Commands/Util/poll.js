/**
 *
 * @param {CommandEvent} CommandEvent
 * @returns
 */
module.exports.run = async (CommandEvent) => {
	try {
		const question = CommandEvent.isInteraction ? CommandEvent.command.options.getString("問題") : CommandEvent.command.options[0];
		const time = CommandEvent.command.options.getInteger("截止時間");
		if (time && time < 1)
			throw "ERR_INVAILD_PARAMETER@TIME";

		const description = CommandEvent.isInteraction ? CommandEvent.command.options.getString("說明") : undefined;
		const noquestion = new Discord.MessageEmbed()
			.setColor("#ff0000")
			.setTitle(":x: 無法執行動作")
			.setDescription("你沒有提供問題")
			.setTimestamp()
			.setFooter(CommandEvent.client.user.tag);
		if (!question) return await CommandEvent.mi.editReply({ embeds: [noquestion], allowedMentions: { repliedUser: true } });

		const choice = CommandEvent.command.options.getString("選項").split(",").map(Function.prototype.call, String.prototype.trim);
		const emoji = [ "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟" ];
		for (let i = 0; i < choice.length; i++)
			choice[i] = emoji[i] + " " + choice[i];

		const poll = new Discord.MessageEmbed()
			.setColor(CommandEvent.user.displayHexColor)
			.setTitle(`Q: ${question}`)
			.setDescription(choice.join("\n"))
			.setFooter(`${CommandEvent.user.user.tag}`, CommandEvent.user.displayAvatarURL({ dynamic: true }))
			.setTimestamp();

		if (description)
			poll.addField("說明", description);

		await CommandEvent.mi.editReply({ embeds: [poll], fetchReply: true });
		const sent = await CommandEvent.mi.fetchReply();
		choice.forEach(async (_v, i) => await sent.react(emoji[i]));
		if (time)
			setTimeout(async () => {
				try {
					poll.addField("結算", sent.reactions.cache.map(v => `${v.emoji} ${v.me ? v.count - 1 : v.count}`).join("\n"));
					await sent.edit({ embeds: [poll] });
					await sent.reactions.removeAll();
				} catch(e) {
					console.error(e);
				}
			}, time * 1000 * 60);

		return;
	} catch (e) {
		let embed;
		if (e == "ERR_INVAILD_PARAMETER@TIME")
			embed = new Discord.MessageEmbed()
				.setColor(CommandEvent.client.colors.error)
				.setTitle(CommandEvent.client.embedStat.error)
				.setDescription("截止時間必須大於 0")
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
	name : "poll",
	desc : "發起投票",
	args : [
		{
			name   : "問題",
			type   : "字串",
			desc   : "要問的問題",
			option : false
		},
		{
			name   : "選項1",
			type   : "字串",
			desc   : "第 1 個選項",
			option : false
		},
		{
			name   : "選項2",
			type   : "字串",
			desc   : "第 2 個選項",
			option : false
		},
		{
			name   : "選項3~10",
			type   : "字串",
			desc   : "第 3 ~ 10 個選項",
			option : true
		}
	],
	options: [
		{
			name        : "問題",
			description : "要問的問題",
			type        : "STRING",
			required    : true
		},
		{
			name        : "選項",
			description : "使用半形逗號「,」分隔每個選項，選項最多 10 個",
			type        : "STRING",
			required    : true
		},
		{
			name        : "說明",
			description : "為投票加入說明",
			type        : "STRING",
			required    : false
		},
		{
			name        : "截止時間",
			description : "為投票加入截止時間，單位：分鐘",
			type        : "INTEGER",
			required    : false
		}
	],
	slash : true,
	exam  : ["`問題:`我晚餐該吃什麼 `選項:`麵,飯,土"],
	guild : true
};