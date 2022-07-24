/* eslint-disable no-irregular-whitespace */
module.exports.run = async (CommandEvent) => {
	try {
		const placeholder = {
			"{user.displayName}" : CommandEvent.user.displayName,
			"{user.name}"        : CommandEvent.user.user.username,
			"{user.tag}"         : CommandEvent.user.user.tag
		};

		const voice = new Discord.MessageEmbed();

		if (CommandEvent.command.options.getSubcommandGroup(false) == "伺服器設定") {
			if (!CommandEvent.user.permissions.has("ADMINISTRATOR") && !CommandEvent.user.isBotOwner)
				throw "ERR_USER_MISSING_PERMISSION";

			if (CommandEvent.command.options.getSubcommand() == "資訊") {
				const pages = [];
				let index = 0, control = false;

				config.data.guild[CommandEvent.guild.id].voice ||= [];
				await config.write();

				if (config.data.guild[CommandEvent.guild.id].voice.length) {
					config.data.guild[CommandEvent.guild.id].voice.forEach(async (v, i, a) => {
						if (!CommandEvent.guild.channels.cache.has(v.creator)) {
							config.data.guild[CommandEvent.guild.id].voice.splice(i, 1);
							await config.write();
							return;
						}

						const noPermission = [];

						if (v.category) {
							const categoryPerms = CommandEvent.guild.me.permissionsIn(v.category);
							if (!categoryPerms.has("MANAGE_CHANNELS")) noPermission.push("管理頻道");
							if (!categoryPerms.has("MANAGE_ROLES")) noPermission.push("管理身分組");
							if (!categoryPerms.has("MOVE_MEMBERS")) noPermission.push("移動成員");
							if (!categoryPerms.has("MUTE_MEMBERS")) noPermission.push("禁音成員");

						} else {
							const perms = CommandEvent.guild.me.permissions;
							if (!perms.has("MANAGE_CHANNELS")) noPermission.push("管理頻道 (global)");
							if (!perms.has("MANAGE_ROLES")) noPermission.push("管理身分組 (global)");
							if (!perms.has("MOVE_MEMBERS")) noPermission.push("移動成員 (global)");
							if (!perms.has("MUTE_MEMBERS")) noPermission.push("禁音成員 (global)");
						}

						const embed = new Discord.MessageEmbed()
							.setColor(CommandEvent.client.colors.info)
							.setAuthor(CommandEvent.guild.name, CommandEvent.guild.iconURL({ dynamic: true }))
							.setTitle(`自動語音頻道設定 (第 ${i + 1} 頁 / 共 ${config.data.guild[CommandEvent.guild.id].voice.length} 頁)`)
							.addField("建立語音頻道", `\`${v.creator}\` ${CommandEvent.client.channels.cache.get(v.creator) || "#deleted-channel"}`)
							.addField("語音頻道類別", v.category ? `\`${v.category}\` ${CommandEvent.client.channels.cache.get(v.category)?.name || "#deleted-channel"}` : "`未設定語音頻道類別`")
							.addField("頻道設定", `頻道名稱: ${v.channelSettings.name ? `**${v.channelSettings.name}**\n　　預覽: ${v.channelSettings.name.replace(/{.+}/g, all => placeholder[all] || all)}` : `*\`未設定\`*\n　　預設: {user.displayName} 的房間\n　　預覽: ${"{user.displayName} 的房間".replace(/{.+}/g, all => placeholder[all] || all)}`}\n　位元率: **${v.channelSettings.bitrate}** kbps\n人數上限: ${v.channelSettings.limit ? `**${v.channelSettings.limit}**` : "*`無限制`*"}`)
							.setTimestamp();
						if (noPermission.length) embed.setDescription(`** :warning: 這個類別缺少以下權限 ${noPermission.join(", ")}**`);
						pages.push(embed);
					});
					if (pages.length > 1) control = true;
				} else {
					const embed = new Discord.MessageEmbed()
						.setColor(CommandEvent.user.displayHexColor)
						.setAuthor(CommandEvent.guild.name, CommandEvent.guild.iconURL({ dynamic: true }))
						.setTitle("自動語音頻道設定")
						.setDescription("這個伺服器尚未設定自動語音頻道")
						.setTimestamp();
					pages.push(embed);
				}
				const sent = await CommandEvent.mi.editReply({ embeds: [pages[index]], fetchReply: true });
				if (control) {
					await sent.react("◀️");
					await sent.react("▶️");
					paginator();
				}
				// eslint-disable-next-line no-inner-declarations
				function paginator() {
					const filter = (reaction, user) => (reaction.emoji.name === "◀️" || reaction.emoji.name === "▶️") && user.id == CommandEvent.user.id;
					const collector = sent.createReactionCollector(filter, { max: 1, time: 60000 });
					collector.on("collect", async (r, u) => {
						r.users.remove(u);
						if (r.emoji.name == "◀️")
							if (index > 0) index -= 1;
						if (r.emoji.name == "▶️")
							if (index < pages.length - 1) index += 1;
						await CommandEvent.mi.editReply({ embeds: [pages[index]] });
						paginator();
					});
					collector.on("end", (__, reason) => {
						if (reason == "time") sent.reactions.removeAll();
					});
				}
			}

			if (CommandEvent.command.options.getSubcommand() == "新增") {
				const vch = CommandEvent.command.options.getChannel("頻道");
				const cch = CommandEvent.command.options.getChannel("類別");

				if (vch && vch.type != "GUILD_VOICE")
					throw "ERR_INVAILD_PARAMETER@CHANNEL";
				if (cch && cch.type != "GUILD_CATEGORY")
					throw "ERR_INVAILD_PARAMETER@CHANNEL";

				config.data.guild[CommandEvent.guild.id].voice ||= [];
				config.data.guild[CommandEvent.guild.id].voice.push({
					creator         : vch.id,
					category        : cch?.id || "",
					channelSettings : {
						name    : "",
						bitrate : 64,
						limit   : 0,
						text    : {
							name     : "",
							category : cch?.id || "",
							reactmsg : ""
						}
					}
				});
				await config.write();

				voice
					.setColor(CommandEvent.client.colors.success)
					.setTitle(CommandEvent.client.embedStat.success)
					.setDescription(`已將 ${vch} 新增到自動語音頻道列表`);
				await CommandEvent.mi.editReply({ embeds: [voice] });
				return;
			}

			if (CommandEvent.command.options.getSubcommand() == "自動新增") {
				const progress = new Discord.MessageEmbed()
					.setColor(CommandEvent.client.colors.warn)
					.setAuthor(CommandEvent.guild.name, CommandEvent.guild.iconURL({ dynamic: true }))
					.setDescription("正在設定自動語音頻道中...");
				await CommandEvent.mi.editReply({ embeds: [progress] });

				const category = await CommandEvent.guild.channels.create("自動語音頻道", { type: "GUILD_CATEGORY", permissionOverwrites: [{ id: CommandEvent.client.user.id, allow: [ "MANAGE_CHANNELS", "MANAGE_ROLES", "MOVE_MEMBERS", "MUTE_MEMBERS" ] }], reason: "自動設定自動語音頻道" });
				const creator = await CommandEvent.guild.channels.create("建立語音頻道", { type: "GUILD_VOICE", parent: category, reason: "自動設定自動語音頻道" });

				config.data.guild[CommandEvent.guild.id].voice ||= [];
				config.data.guild[CommandEvent.guild.id].voice.push({
					creator         : creator.id,
					category        : category.id,
					channelSettings : {
						name    : "",
						bitrate : 64,
						limit   : 0,
						text    : {
							name     : "",
							category : category.id,
							reactmsg : ""
						}
					}
				});
				await config.write();

				const fin = new Discord.MessageEmbed()
					.setColor(CommandEvent.client.colors.success)
					.setAuthor(CommandEvent.guild.name, CommandEvent.guild.iconURL({ dynamic: true }))
					.setTitle(CommandEvent.client.embedStat.success)
					.setDescription("已完成設定，你現在可以更改頻道或類別的設定了");
				await CommandEvent.mi.editReply({ embeds: [fin] });
				return;
			}

			if (CommandEvent.command.options.getSubcommand() == "刪除") {
				const vch = CommandEvent.command.options.getChannel("頻道");

				if (vch && vch.type != "GUILD_VOICE")
					throw "ERR_INVAILD_PARAMETER@CHANNEL";

				const settingindex = config.data.guild[CommandEvent.guild.id]?.voice?.map(e => e.creator)?.indexOf(vch.id) || -1;
				if (settingindex == -1)
					throw "ERR_CONFIGURATION_NOT_FOUND";

				config.data.guild[CommandEvent.guild.id].voice.splice(settingindex, 1);
				await config.write();
				const embed = new Discord.MessageEmbed()
					.setColor(CommandEvent.client.colors.success)
					.setTitle(CommandEvent.client.embedStat.success)
					.setDescription(`已將 ${vch} 從自動語音頻道列表中刪除`);
				await CommandEvent.mi.editReply({ embeds: [embed] });
				return;
			}

			if (CommandEvent.command.options.getSubcommand() == "設定") {
				const vch = CommandEvent.command.options.getChannel("頻道");
				const cch = CommandEvent.command.options.getChannel("類別");
				const name = CommandEvent.command.options.getString("名稱");
				const limit = CommandEvent.command.options.getInteger("人數上限");
				const bitrate = CommandEvent.command.options.getInteger("位元率") || 64;
				const override = CommandEvent.command.options.getBoolean("覆蓋設定");

				if (vch && vch.type != "GUILD_VOICE")
					throw "ERR_INVAILD_PARAMETER@CHANNEL";
				if (cch && cch.type != "GUILD_CATEGORY")
					throw "ERR_INVAILD_PARAMETER@CHANNEL";
				if (typeof limit != "number" && (limit < 0 || limit > 99))
					throw "ERR_INVAILD_PARAMETER@LIMIT";
				if (typeof bitrate == "number")
					switch (CommandEvent.guild.premiumTier) {
						case "NONE":
							if (bitrate < 8 || bitrate > 96) throw "ERR_INVAILD_PARAMETER@BITRATE0";
							break;
						case "TIER_1":
							if (bitrate < 8 || bitrate > 128) throw "ERR_INVAILD_PARAMETER@BITRATE1";
							break;
						case "TIER_2":
							if (bitrate < 8 || bitrate > 256) throw "ERR_INVAILD_PARAMETER@BITRATE2";
							break;
						case "TIER_3":
							if (bitrate < 8 || bitrate > 384) throw "ERR_INVAILD_PARAMETER@BITRATE3";
							break;
					}
				config.data.guild[CommandEvent.guild.id].voice ||= [];
				const settingindex = config.data.guild[CommandEvent.guild.id].voice.map(e => e.creator).indexOf(vch.id);
				if (settingindex == -1)
					throw "ERR_CONFIGURATION_NOT_FOUND";

				if (cch || override) {
					config.data.guild[CommandEvent.guild.id].voice[settingindex].category = cch?.id || "";
					config.data.guild[CommandEvent.guild.id].voice[settingindex].channelSettings.text.category = cch?.id || "";
				}
				if (name || override)
					config.data.guild[CommandEvent.guild.id].voice[settingindex].channelSettings.name = name;
				if (bitrate || override)
					config.data.guild[CommandEvent.guild.id].voice[settingindex].channelSettings.bitrate = bitrate;
				if (typeof limit == "number" || override)
					config.data.guild[CommandEvent.guild.id].voice[settingindex].channelSettings.limit = limit;
				await config.write();

				const desc = [ `已${override ? "覆蓋" : "變更"}設定`, "" ];
				if (cch || override) desc.push(`頻道類別：${cch ? `**${cch.name}**` : "*`未設定`*"}`);
				if (name || override) desc.push(`頻道名稱：${name ? `**${name}**\n　　預覽：${name.replace(/{.+}/g, all => placeholder[all] || all)}` : `*\`未設定\`*\n　　預設：{user.displayName} 的房間\n　　預覽：${"{user.displayName} 的房間".replace(/{.+}/g, all => placeholder[all] || all)}`}`);
				if (typeof limit == "number" || override) desc.push(`人數上限：${limit ? `**${limit}** 人` : "*`無限制`*"}`);
				if (bitrate || override) desc.push(`　位元率：**${bitrate}** kbps`);

				voice
					.setColor(CommandEvent.client.colors.success)
					.setTitle(CommandEvent.client.embedStat.success)
					.setDescription(desc.join("\n"));

				await CommandEvent.mi.editReply({ embeds: [voice] });
			}
			return;
		} else {
			const vc = CommandEvent.user.voice?.channel;
			if (!vc)
				throw "ERR_USER_NOT_IN_VOICE";
			if (!CommandEvent.user.permissionsIn(vc.id).has("MANAGE_CHANNELS"))
				throw "ERR_USER_MISSING_PERMISSION";

			if (CommandEvent.command.options.getSubcommand() == "名稱") {
				const name = CommandEvent.command.options.getString("名稱");
				const defa = CommandEvent.command.options.getBoolean("預設");

				if (name != "serverDefault")
					await vc.setName(name.replace(/{.+}/g, all => placeholder[all] || all));

				voice
					.setColor(CommandEvent.client.colors.success)
					.setTitle(CommandEvent.client.embedStat.success)
					.setDescription(`已將 ${vc} 的名稱設為 **${name.replace(/{.+}/g, all => placeholder[all] || all)}**`);

				if (defa || name == "serverDefault") {
					config.data.user[CommandEvent.user.id] ||= {};
					config.data.user[CommandEvent.user.id].voice ||= {};
					config.data.user[CommandEvent.user.id].voice.name = name == "serverDefault" ? undefined : name;
					await config.write();
					voice
						.setDescription(`已將 ${vc} 的名稱設為 **${name.replace(/{.+}/g, all => placeholder[all] || all)}**\n已將頻道名稱設定設為 **${name.replace(/{.+}/g, all => placeholder[all] || all)}**`);
					if (name == "serverDefault")
						voice
							.setDescription("已將頻道名稱設定設為 **使用伺服器預設**");
				}
			}

			if (CommandEvent.command.options.getSubcommand() == "人數上限") {
				const limit = CommandEvent.command.options.getInteger("人數上限");
				const defa = CommandEvent.command.options.getBoolean("預設");
				if (limit != -1 && (limit < 0 || limit > 99))
					throw "ERR_INVAILD_PARAMETER@LIMIT";

				if (limit != -1)
					await vc.setUserLimit(limit);

				voice
					.setColor(CommandEvent.client.colors.success)
					.setTitle(CommandEvent.client.embedStat.success)
					.setDescription(`已將 ${vc} 的人數上限設為 **${limit}** 人`);

				if (defa || limit == -1) {
					config.data.user[CommandEvent.user.id] ||= {};
					config.data.user[CommandEvent.user.id].voice ||= {};
					config.data.user[CommandEvent.user.id].voice.limit = limit == -1 ? undefined : limit;
					await config.write();
					voice
						.setDescription(`已將 ${vc} 的人數上限設為 **${limit}** 人\n已將人數上限設定設為 **${limit}** 人`);
					if (limit == -1)
						voice
							.setDescription("已將人數上限設定設為 **使用伺服器預設**");
				}
			}

			if (CommandEvent.command.options.getSubcommand() == "位元率") {
				const bitrate = CommandEvent.command.options.getInteger("位元率");
				const defa = CommandEvent.command.options.getBoolean("預設");
				switch (CommandEvent.guild.premiumTier) {
					case "NONE":
						if (bitrate != -1 && (bitrate < 8 || bitrate > 96)) throw "ERR_INVAILD_PARAMETER@BITRATE0";
						break;
					case "TIER_1":
						if (bitrate != -1 && (bitrate < 8 || bitrate > 128)) throw "ERR_INVAILD_PARAMETER@BITRATE1";
						break;
					case "TIER_2":
						if (bitrate != -1 && (bitrate < 8 || bitrate > 256)) throw "ERR_INVAILD_PARAMETER@BITRATE2";
						break;
					case "TIER_3":
						if (bitrate != -1 && (bitrate < 8 || bitrate > 384)) throw "ERR_INVAILD_PARAMETER@BITRATE3";
						break;
				}

				if (bitrate != -1)
					await vc.setBitrate(bitrate * 1000);

				voice
					.setColor(CommandEvent.client.colors.success)
					.setTitle(CommandEvent.client.embedStat.success)
					.setDescription(`已將 ${vc} 的位元率設為 **${bitrate}** kbps`);

				if (defa || bitrate == -1) {
					config.data.user[CommandEvent.user.id] ||= {};
					config.data.user[CommandEvent.user.id].voice ||= {};
					config.data.user[CommandEvent.user.id].voice.bitrate = bitrate == -1 ? undefined : bitrate > 96 ? 96 : bitrate;
					await config.write();
					voice
						.setDescription(`已將 ${vc} 的位元率設為 **${bitrate}** kbps\n已將位元率設定設為 **${bitrate > 96 ? 96 : bitrate}** kbps${bitrate > 96 ? " *（由於 Discord 限制，預設位元率最高只能設為 **96** kbps）*" : ""}`);
					if (bitrate == -1)
						voice
							.setDescription("已將位元率設定設為 **使用伺服器預設**");
				}
			}
		}
		await CommandEvent.mi.editReply({ embeds: [voice] });
		return;
	} catch (e) {
		let embed;
		if (e.toString().includes("DiscordAPIError: Missing Permissions"))
			embed = new Discord.MessageEmbed()
				.setColor(CommandEvent.client.colors.error)
				.setTitle(CommandEvent.client.embedStat.error)
				.setDescription("我沒有權限執行這項動作")
				.setFooter("ERR_MISSING_PERMISSION");

		if (e == "ERR_USER_MISSING_PERMISSION")
			embed = new Discord.MessageEmbed()
				.setColor(CommandEvent.client.colors.error)
				.setTitle(CommandEvent.client.embedStat.error)
				.setDescription("你沒有權限這樣做")
				.setFooter(e);

		if (e == "ERR_USER_NOT_IN_VOICE")
			embed = new Discord.MessageEmbed()
				.setColor(CommandEvent.client.colors.error)
				.setTitle(CommandEvent.client.embedStat.error)
				.setDescription("你必須在語音頻道內才能這樣做")
				.setFooter(e);

		if (e == "ERR_CONFIGURATION_NOT_FOUND")
			embed = new Discord.MessageEmbed()
				.setColor(CommandEvent.client.colors.error)
				.setTitle(CommandEvent.client.embedStat.error)
				.setDescription("這個頻道未設定為自動語音頻道")
				.setFooter(e);

		if (e == "ERR_INVAILD_PARAMETER@CHANNEL")
			embed = new Discord.MessageEmbed()
				.setColor(CommandEvent.client.colors.error)
				.setTitle(CommandEvent.client.embedStat.error)
				.setDescription("頻道類別不相符")
				.setFooter(e);

		if (e == "ERR_INVAILD_PARAMETER@LIMIT")
			embed = new Discord.MessageEmbed()
				.setColor(CommandEvent.client.colors.error)
				.setTitle(CommandEvent.client.embedStat.error)
				.setDescription("人數上限必須介於 0 ~ 99 或 -1")
				.setFooter(e);

		if (e == "ERR_INVAILD_PARAMETER@BITRATE0")
			embed = new Discord.MessageEmbed()
				.setColor(CommandEvent.client.colors.error)
				.setTitle(CommandEvent.client.embedStat.error)
				.setDescription("位元率必須介於 8 ~ 96 或 -1")
				.setFooter(e);
		if (e == "ERR_INVAILD_PARAMETER@BITRATE1")
			embed = new Discord.MessageEmbed()
				.setColor(CommandEvent.client.colors.error)
				.setTitle(CommandEvent.client.embedStat.error)
				.setDescription("位元率必須介於 8 ~ 128 或 -1")
				.setFooter(e);
		if (e == "ERR_INVAILD_PARAMETER@BITRATE2")
			embed = new Discord.MessageEmbed()
				.setColor(CommandEvent.client.colors.error)
				.setTitle(CommandEvent.client.embedStat.error)
				.setDescription("位元率必須介於 8 ~ 256 或 -1")
				.setFooter(e);
		if (e == "ERR_INVAILD_PARAMETER@BITRATE3")
			embed = new Discord.MessageEmbed()
				.setColor(CommandEvent.client.colors.error)
				.setTitle(CommandEvent.client.embedStat.error)
				.setDescription("位元率必須介於 8 ~ 384 或 -1")
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
	name    : "voice",
	desc    : "設定自動語音頻道",
	options : [
		{
			name        : "名稱",
			description : "設定頻道名稱",
			type        : "SUB_COMMAND",
			options     : [
				{
					name        : "名稱",
					description : "要設定的名稱，輸入 serverDefault 來使用伺服器預設。{user.displayName} 顯示名稱，{user.name} 使用者名稱，{user.tag} 使用者標籤",
					type        : "STRING",
					required    : true
				},
				{
					name        : "預設",
					description : "設為預設",
					type        : "BOOLEAN",
					required    : false
				}
			]
		},
		{
			name        : "人數上限",
			description : "設定頻道人數上限",
			type        : "SUB_COMMAND",
			options     : [
				{
					name        : "人數上限",
					description : "要設定的人數上限，輸入 -1 來使用伺服器預設（0：無限制）",
					type        : "INTEGER",
					required    : true
				},
				{
					name        : "預設",
					description : "設為預設",
					type        : "BOOLEAN",
					required    : false
				}
			]
		},
		{
			name        : "位元率",
			description : "設定頻道位元率",
			type        : "SUB_COMMAND",
			options     : [
				{
					name        : "位元率",
					description : "要設定的位元率，輸入 -1 來使用伺服器預設（單位：kbps）",
					type        : "INTEGER",
					required    : true
				},
				{
					name        : "預設",
					description : "設為預設",
					type        : "BOOLEAN",
					required    : false
				}
			]
		},
		{
			name        : "伺服器設定",
			description : "（管理員）相關伺服器設定",
			type        : "SUB_COMMAND_GROUP",
			options     : [
				{
					name        : "資訊",
					description : "顯示所有已設定自動語音頻道設定",
					type        : "SUB_COMMAND"
				},
				{
					name        : "新增",
					description : "將頻道新增到自動語音頻道列表",
					type        : "SUB_COMMAND",
					options     : [
						{
							name        : "頻道",
							description : "要新增到自動語音頻道列表的語音頻道",
							type        : "CHANNEL",
							required    : true
						},
						{
							name        : "類別",
							description : "語音頻道要創在的類別",
							type        : "CHANNEL",
							required    : false
						}
					]
				},
				{
					name        : "自動新增",
					description : "讓機器人幫你創建一個自動語音頻道",
					type        : "SUB_COMMAND"
				},
				{
					name        : "刪除",
					description : "將頻道從自動語音頻道列表中刪除",
					type        : "SUB_COMMAND",
					options     : [
						{
							name        : "頻道",
							description : "要刪除的自動語音頻道（頻道本身不會被刪除）",
							type        : "CHANNEL",
							required    : true
						}
					]
				},
				{
					name        : "設定",
					description : "顯示所有已設定自動語音頻道設定",
					type        : "SUB_COMMAND",
					options     : [
						{
							name        : "頻道",
							description : "要設定的自動語音頻道",
							type        : "CHANNEL",
							required    : true
						},
						{
							name        : "類別",
							description : "設定自動語音頻道創頻道要創在哪一個類別下",
							type        : "CHANNEL",
							required    : false
						},
						{
							name        : "名稱",
							description : "設定伺服器自動語音頻道名稱。{user.displayName} 顯示名稱，{user.name} 使用者名稱，{user.tag} 使用者標籤",
							type        : "STRING",
							required    : false
						},
						{
							name        : "人數上限",
							description : "設定伺服器自動語音頻道人數上限（0：無上限）",
							type        : "INTEGER",
							required    : false
						},
						{
							name        : "位元率",
							description : "設定伺服器自動語音頻道位元率（單位：kbps）",
							type        : "INTEGER",
							required    : false
						},
						{
							name        : "覆蓋設定",
							description : "覆蓋現有設定",
							type        : "BOOLEAN",
							required    : false
						}
					]
				}
			]
		}
	],
	defaultPermission : true,
	slash             : true,
	exam              : [ "", "名稱 `名稱:`{user.displayName}家 `預設:`True" ],
	guild             : true
};