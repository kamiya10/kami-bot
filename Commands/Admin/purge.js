/* eslint-disable no-irregular-whitespace */
module.exports.run = async (CommandEvent) => {
	try {
		if (!CommandEvent.user.permissions.has("ADMINISTRATOR") && !CommandEvent.user.isBotOwner)
			throw "ERR_USER_MISSING_PERMISSION";

		const count = CommandEvent.command.options.getInteger("數量");
		if (count && count < 1 || count > 100)
			throw "ERR_INVAILD_PARAMETER@COUNT";

		const filters = [];

		const pinned = CommandEvent.command.options.getBoolean("釘選");
		const bot = CommandEvent.command.options.getBoolean("機器人");
		const user = CommandEvent.command.options.getUser("從");
		const mention = CommandEvent.command.options.getUser("提及");
		const has = CommandEvent.command.options.getString("有");
		const before = CommandEvent.command.options.getString("之前");
		const during = CommandEvent.command.options.getString("期間");
		const after = CommandEvent.command.options.getString("之後");
		const inch = CommandEvent.command.options.getChannel("在");
		const role = CommandEvent.command.options.getRole("是");
		const startsWith = CommandEvent.command.options.getString("開頭");
		const includes = CommandEvent.command.options.getString("包含");
		const regex = CommandEvent.command.options.getString("正規表達式");

		if (typeof pinned == "boolean") filters.push(m => m.pinned == pinned);
		else filters.push(m => m.pinned == false);
		if (typeof bot == "boolean") filters.push(m => m.author.bot == bot);
		if (user && mention) filters.push(m => m.author.id == user.id || m.author.id == mention.id); else
		if (user) filters.push(m => m.author.id == user.id); else
		if (mention) filters.push(m => m.mentions.users.has(mention.id));
		if (has) filters.push(m => has == "link" ? m.content.includes("http") : has == "embed" ? m.embeds.length : has == "file" ? m.attachments.size : has == "video" || has == "audio" || has == "image" ? m.attachments.size ? m.attachments.filter(ma => ma.contentType.startsWith(has)).size : false : has == "sticker" ? m.stickers.size : false );
		if (before && verifyTime(before)) filters.push(m => m.author.id == user.id);
		if (during && verifyTime(during)) filters.push(m => m.author.id == user.id);
		if (after && verifyTime(after)) filters.push(m => m.author.id == user.id);
		if (inch) filters.push(m => m.channel.id == inch.id);
		if (role) filters.push(m => m.member.roles.cache.has(role));
		if (startsWith) filters.push(m => m.content.startsWith(startsWith));
		if (includes) filters.push(m => m.content.includes(includes));
		if (regex) filters.push(m => new RegExp(regex).test(m.content));

		await CommandEvent.channel.messages.fetch({ limit: count })
			.then(async messages => {
				filters.forEach(fn => messages = messages.filter(fn));
				if (messages.size == 0) {
					const embed = new Discord.MessageEmbed()
						.setColor(CommandEvent.client.colors.info)
						.setTitle("沒有訊息")
						.setDescription("沒有訊息可以刪除");
					await CommandEvent.mi.editReply({ embeds: [embed], ephemeral: true });
				} else if (messages.size > 10) {
					let m = messages.map(v => `**${v.author}**: ${v.content}`);
					if (m.length > 15) (m = m.slice(0, 15)).push(`　...還有 ${messages.size - 15} 則`);

					const embed = new Discord.MessageEmbed()
						.setColor(CommandEvent.client.colors.warn)
						.setTitle(`即將刪除 ${messages.size} 則訊息`)
						.setDescription(`即將刪除下列訊息，你確定要繼續嗎？\n\n${m.join("\n")}`);

					const row = new Discord.MessageActionRow()
						.addComponents(
							new Discord.MessageButton()
								.setCustomId("cancel")
								.setLabel("取消")
								.setStyle("SUCCESS")
						)
						.addComponents(
							new Discord.MessageButton()
								.setCustomId("confirm")
								.setLabel("確定刪除")
								.setStyle("DANGER")
						);

					await CommandEvent.mi.editReply({ embeds: [embed], components: [row], fetchReply: true });
					const sent = await CommandEvent.mi.fetchReply();
					const collector = sent.createMessageComponentCollector({ filter: i => i.isButton() && i.user.id == CommandEvent.user.id, time: 900000, max: 1 });

					collector.on("collect", async i => {
						if (i.customId == "confirm")
							await CommandEvent.channel.bulkDelete(messages, true).then(async deleted => {
								const embed = new Discord.MessageEmbed()
									.setColor(CommandEvent.client.colors.success)
									.setTitle(CommandEvent.client.embedStat.success)
									.setDescription(`已成功刪除 \`${deleted.size}\` 則訊息`);
								const sent2 = await i.update({ embeds: [embed], components: [], fetchReply: true });
								setTimeout(async () => await sent2.delete().catch(() => {}), 5000);
								return;
							});
						else {
							sent.delete();
							collector.stop();
						}
					});

					collector.on("end", async (_c, r) => {
						console.debug(r);
						if (r == "time")
							await sent.delete().catch(() => {});
					});
				} else
					await CommandEvent.channel.bulkDelete(messages, true).then(async deleted => {
						const embed = new Discord.MessageEmbed()
							.setColor(CommandEvent.client.colors.success)
							.setTitle(CommandEvent.client.embedStat.success)
							.setDescription(`已成功刪除 \`${deleted.size}\` 則訊息`);
						await CommandEvent.mi.editReply({ embeds: [embed], fetchReply: true });
						const sent2 = await CommandEvent.mi.fetchReply();
						setTimeout(async () => await sent2.delete().catch(() => {}), 5000);
						return;
					});

			})
			.catch(console.error);
	} catch(e) {
		let embed;
		if (e == "ERR_USER_MISSING_PERMISSION")
			embed = new Discord.MessageEmbed()
				.setColor(CommandEvent.client.colors.error)
				.setTitle(CommandEvent.client.embedStat.error)
				.setDescription("你沒有權限這樣做")
				.setFooter(e);

		if (e == "ERR_INVAILD_PARAMETER@COUNT")
			embed = new Discord.MessageEmbed()
				.setColor(CommandEvent.client.colors.error)
				.setTitle(CommandEvent.client.embedStat.error)
				.setDescription("數量必須介於 1 ~ 100")
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
	name    : "purge",
	desc    : "(WIP) 大量刪除訊息",
	options : [
		{
			"name"        : "數量",
			"description" : "要刪除的訊息數量",
			"type"        : "INTEGER",
			"required"    : false
		},
		{
			"name"        : "從",
			"description" : "使用者",
			"type"        : "USER",
			"required"    : false
		},
		{
			"name"        : "提及",
			"description" : "使用者",
			"type"        : "USER",
			"required"    : false
		},
		{
			"name"        : "有",
			"description" : "連結、嵌入內容或是檔案",
			"type"        : "STRING",
			"required"    : false,
			"choices"     : [
				{
					"name"  : "連結",
					"value" : "link"
				},
				{
					"name"  : "嵌入內容",
					"value" : "embed"
				},
				{
					"name"  : "檔案",
					"value" : "file"
				},
				{
					"name"  : "視訊通話",
					"value" : "video"
				},
				{
					"name"  : "圖片",
					"value" : "image"
				},
				{
					"name"  : "音效",
					"value" : "audio"
				},
				{
					"name"  : "貼圖",
					"value" : "sticker"
				}
			]
		},
		{
			"name"        : "之前",
			"description" : "特定日期",
			"type"        : "STRING",
			"required"    : false
		},
		{
			"name"        : "期間",
			"description" : "特定日期",
			"type"        : "STRING",
			"required"    : false
		},
		{
			"name"        : "之後",
			"description" : "特定日期",
			"type"        : "STRING",
			"required"    : false
		},
		{
			"name"        : "在",
			"description" : "頻道",
			"type"        : "CHANNEL",
			"required"    : false
		},
		{
			"name"        : "是",
			"description" : "身分組",
			"type"        : "ROLE",
			"required"    : false
		},
		{
			"name"        : "釘選",
			"description" : "釘選訊息",
			"type"        : "BOOLEAN",
			"required"    : false
		},
		{
			"name"        : "機器人",
			"description" : "機器人訊息",
			"type"        : "BOOLEAN",
			"required"    : false
		},
		{
			"name"        : "開頭",
			"description" : "以提供字串為開頭",
			"type"        : "STRING",
			"required"    : false
		},
		{
			"name"        : "包含",
			"description" : "包含提供字串",
			"type"        : "STRING",
			"required"    : false
		},
		{
			"name"        : "正規表達式",
			"description" : "包含正規表達式",
			"type"        : "STRING",
			"required"    : false
		}
	],
	defaultPermission : false,
	slash             : true,
	exam              : [ "", "`數量:`20", "`從:`<@707186246207930398> `包含:`abc", "`有:`圖片 `期間:`2020-09-27 `機器人:`true" ],
	guild             : true
};

function verifyTime(str) {
	if (str.match(/^\d{4}-\d{1,2}-\d{1,2}$/)) return true;
	return false;
}
function parseTime(str) {
	const match = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
	console.log(match);
}