module.exports.run = async (CommandEvent) => {
	try {
		if (!CommandEvent.user.permissions.has("ADMINISTRATOR") && !CommandEvent.user.isBotOwner)
			throw "ERR_USER_MISSING_PERMISSION";

		const autonews = new Discord.MessageEmbed();

		if (CommandEvent.mi.options.getSubcommand() == "資訊") {
			if (config.data.guild[CommandEvent.guild.id]?.autonews?.channels.length)
				autonews
					.setColor(CommandEvent.client.colors.info)
					.setAuthor(CommandEvent.guild.name, CommandEvent.guild.iconURL({ dynamic: true }))
					.setTitle("自動公告發佈頻道設定")
					.addField("自動公告發佈頻道列表", config.data.guild[CommandEvent.guild.id].autonews.channels.map(v => {
						const noperm = [];
						if (!CommandEvent.guild.me.permissionsIn(v).has("MANAGE_MESSAGES"))
							noperm.push("**管理訊息**");
						if (!CommandEvent.guild.me.permissionsIn(v).has("ADD_REACTIONS"))
							noperm.push("**新增反應**");
						return `${noperm.length ? "~~" : ""}\`${v}\` <#${v}>${noperm.length ? `~~  ⚠️ __缺少 ${noperm.join("、")} 權限__` : ""}`;
					}).join("\n"))
					.setTimestamp();
			else
				autonews
					.setColor(CommandEvent.client.colors.info)
					.setAuthor(CommandEvent.guild.name, CommandEvent.guild.iconURL({ dynamic: true }))
					.setTitle("自動公告發佈頻道設定")
					.setDescription("這個伺服器尚未設定自動公告發佈頻道")
					.setTimestamp();

			await CommandEvent.mi.editReply({ embeds: [autonews] });
			return;
		}

		if (CommandEvent.mi.options.getSubcommand() == "新增") {
			const ch = CommandEvent.mi.options.getChannel("頻道");
			if (ch.type != "GUILD_NEWS")
				throw "ERR_INVAILD_PARAMETER@CHANNEL";

			config.data.guild[CommandEvent.guild.id].autonews ||= {};
			config.data.guild[CommandEvent.guild.id].autonews.channels ||= [];
			config.data.guild[CommandEvent.guild.id].autonews.channels.push(ch.id);
			await config.write();

			autonews
				.setColor(CommandEvent.client.colors.success)
				.setTitle(CommandEvent.client.embedStat.success)
				.setDescription(`已將 ${ch} 新增到自動公告發佈頻道列表`);
			await CommandEvent.mi.editReply({ embeds: [autonews] });
			return;
		}

		if (CommandEvent.mi.options.getSubcommand() == "刪除") {
			const ch = CommandEvent.mi.options.getChannel("頻道");
			if (ch.type != "GUILD_NEWS")
				throw "ERR_INVAILD_PARAMETER@CHANNEL";

			const settingindex = config.data.guild[CommandEvent.guild.id]?.autonews?.channels?.indexOf(ch.id) || -1;
			if (settingindex == -1)
				throw "ERR_CONFIGURATION_NOT_FOUND";

			config.data.guild[CommandEvent.guild.id].autonews.channels.splice(settingindex, 1);

			autonews
				.setColor(CommandEvent.client.colors.success)
				.setTitle(CommandEvent.client.embedStat.success)
				.setDescription(`已將 ${ch} 從自動公告發佈頻道列表中刪除`);
			await CommandEvent.mi.editReply({ embeds: [autonews] });
			return;
		}

	} catch(e) {
		let embed;
		if (e == "ERR_USER_MISSING_PERMISSION")
			embed = new Discord.MessageEmbed()
				.setColor(CommandEvent.client.colors.error)
				.setTitle(CommandEvent.client.embedStat.error)
				.setDescription("你沒有權限這樣做")
				.setFooter(e);

		if (e == "ERR_CONFIGURATION_NOT_FOUND")
			embed = new Discord.MessageEmbed()
				.setColor(CommandEvent.client.colors.error)
				.setTitle(CommandEvent.client.embedStat.error)
				.setDescription("這個頻道未設定為自動公告發佈頻道")
				.setFooter(e);

		if (e == "ERR_INVAILD_PARAMETER@CHANNEL")
			embed = new Discord.MessageEmbed()
				.setColor(CommandEvent.client.colors.error)
				.setTitle(CommandEvent.client.embedStat.error)
				.setDescription("頻道類別不相符")
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
	name    : "autonews",
	desc    : "(WIP) 自動公告發佈頻道訊息",
	options : [
		{
			"name"        : "資訊",
			"description" : "顯示所有已設定自動公告發佈頻道設定",
			"type"        : "SUB_COMMAND"
		},
		{
			"name"        : "新增",
			"description" : "將頻道新增到自動公告發佈頻道列表",
			"type"        : "SUB_COMMAND",
			"options"     : [
				{
					"name"        : "頻道",
					"description" : "要新增到自動公告發佈頻道列表的公告頻道",
					"type"        : "CHANNEL",
					"required"    : true
				}
			]
		},
		{
			"name"        : "刪除",
			"description" : "將頻道從自動公告發佈頻道列表中刪除",
			"type"        : "SUB_COMMAND",
			"options"     : [
				{
					"name"        : "頻道",
					"description" : "要刪除的自動公告發佈頻道（頻道本身不會被刪除）",
					"type"        : "CHANNEL",
					"required"    : true
				}
			]
		}
	],
	defaultPermission : false,
	slash             : true,
	exam              : ["資訊"],
	guild             : true
};