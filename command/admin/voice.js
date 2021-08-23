/* eslint-disable no-inner-declarations */
/* eslint-disable no-irregular-whitespace */
const Discord = require("discord.js");
const functions = require("../../function/loader");
const settingUser = "../../UserSetting.json";
const fs = require("fs");
const censor = require("discord-censor");
let userSetting;

async function voice(message, args, client, settings, uSetting) {
	userSetting = uSetting;
	try {
		if (message.channel.type == "dm") return;
		functions.log.command(message, client, voice.prop.name);

		const setting = settings.voice.find(o => o.creator == args[1]);
		const placeholder = {
			"{user.displayName}" : message.member.displayName,
			"{user.name}"        : message.member.user.username,
			"{user.tag}"         : message.member.user.tag
		};

		if (!args.length) {
			const embed = new Discord.MessageEmbed()
				.setColor(client.colors.info)
				.setTitle("指令：voice")
				.setDescription("在要設定的東西前面加上 `$` 號可以設為預設")
				.addField("頻道相關", "`name`\n`limit`\n`bitrate`", true)
				.addField("​", "變更頻道名稱\n變更頻道人數上限\n變更頻道位元率", true)
				.addField("​", "​", true);
			if (message.member.permissions.has("MANAGE_CHANNELS"))
				embed
					.addField("管理員指令", "`list`\n`setup`\n`add`\n`set`", true)
					.addField("​", "顯示所有已設定自動語音頻道設定\n設定語音頻道（互動式）\n新增一個頻道為自動語音頻道\n設定自動語音頻道設定", true)
					.addField("​", "​", true);

			await message.reply(embed);
			return;
		}

		if (args[0] == "name") {
			let name = censor.censor(args.slice(1).join(" ")), global = false;
			if (name.startsWith("$")) {
				name = name.slice(1);
				global = true;
			}

			if (message.member.voice.channel)
				if (message.member.permissionsIn(message.member.voice.channel.id).has("MANAGE_CHANNELS")) {
					const success = new Discord.MessageEmbed()
						.setColor(client.colors.success)
						.setDescription(`已將頻道名稱設為 ${name.replace(/{.+}/g, all => placeholder[all] || all)}`);
					if (global)
						await saveUser(message.author, "name", name);

					await message.member.voice.channel.setName(name.replace(/{.+}/g, all => placeholder[all] || all));
					await message.reply(success);
					return;
				} else {
					const error = new Discord.MessageEmbed()
						.setColor(client.colors.error)
						.setDescription(`${message.member}, 你沒有權限這樣做`);
					await message.reply(error);
					return;
				}

			else {
				const error = new Discord.MessageEmbed()
					.setColor(client.colors.error)
					.setDescription(`${message.member}, 你必須在語音頻道內才能這樣做`);
				await message.reply(error);
				return;
			}
		}

		if (args[0] == "limit") {
			let limit = args[1], global = false;
			if (limit.startsWith("$")) {
				limit = limit.slice(1);
				global = true;
			}
			limit = parseInt(limit);
			if (limit > 99 || limit < 0) {
				const error = new Discord.MessageEmbed()
					.setColor(client.colors.error)
					.setTitle(client.embedStat.error)
					.setDescription("人數上限必須介於 0 ~ 99");
				await message.reply(error);
				return;
			}

			if (message.member.voice.channel)
				if (message.member.permissionsIn(message.member.voice.channel.id).has("MANAGE_CHANNELS")) {
					const success = new Discord.MessageEmbed()
						.setColor(client.colors.success)
						.setDescription(`已將頻道人數上限設為 \`${limit ? `${limit}\` 人` : "無限制`"}`);

					if (global)
						await saveUser(message.author, "limit", limit);

					await message.member.voice.channel.setUserLimit(+limit);
					await message.reply(success);
					return;
				} else {
					const error = new Discord.MessageEmbed()
						.setColor(client.colors.error)
						.setDescription(`${message.member}, 你沒有權限這樣做`);
					await message.reply(error);
					return;
				}

			else {
				const error = new Discord.MessageEmbed()
					.setColor(client.colors.error)
					.setDescription(`${message.member}, 你必須在語音頻道內才能這樣做`);
				await message.reply(error);
				return;
			}
		}

		if (args[0] == "bitrate") {
			let bitrate = args[1], global = false;
			if (bitrate.startsWith("$")) {
				bitrate = bitrate.slice(1);
				global = true;
			}
			bitrate = parseInt(bitrate);
			let gbr = bitrate;
			if (message.member.voice.channel)
				if (message.member.permissionsIn(message.member.voice.channel.id).has("MANAGE_CHANNELS")) {
					let desc = `已將頻道位元率設為 \`${bitrate / 1000}\` kbps`;
					const success = new Discord.MessageEmbed()
						.setColor(client.colors.success);

					if (bitrate < 8000) {
						if (global) desc += "\nℹ️ 由於Discord限制，預設位元率將設為 `8` kbps";
						gbr = 8000;
						success.setColor(client.colors.warning);
					}
					if (bitrate > 96000) {
						if (global) desc += "\nℹ️ 由於Discord限制，預設位元率將設為 `96` kbps";
						gbr = 96000;
						success.setColor(client.colors.warning);
					}
					if (global)
						await saveUser(message.author, "bitrate", gbr);

					success.setDescription(desc);

					await message.member.voice.channel.setBitrate(bitrate).catch(async () => {
						await message.member.voice.channel.setBitrate(gbr);
						success.setDescription(desc.replace(bitrate / 1000, gbr / 1000));
					});
					await message.reply(success);
					return;
				} else {
					const error = new Discord.MessageEmbed()
						.setColor(client.colors.error)
						.setDescription(`${message.member}, 你沒有權限這樣做`);
					await message.reply(error);
					return;
				}

			else {
				const error = new Discord.MessageEmbed()
					.setColor(client.colors.error)
					.setDescription(`${message.member}, 你必須在語音頻道內才能這樣做`);
				await message.reply(error);
				return;
			}
		}

		if (args[0] == "list") {
			const pages = [];
			let index = 0, control = false;

			if (settings.voice.length) {
				settings.voice.forEach((v, i, a) => {
					const noPermission = [];
					const tip = [
						`使用 ${settings.prefix}voice setup 來快速設定自動語音頻道`,
						`使用 ${settings.prefix}voice set 來變更自動語音頻道設定`
					];
					if (v.category) {
						const categoryPerms = message.guild.me.permissionsIn(v.category);
						if (!categoryPerms.has("MANAGE_CHANNELS")) noPermission.push("管理頻道");
						if (!categoryPerms.has("MANAGE_ROLES")) noPermission.push("管理身分組");
						if (!categoryPerms.has("MOVE_MEMBERS")) noPermission.push("移動成員");
						if (!categoryPerms.has("MUTE_MEMBERS")) noPermission.push("禁音成員");
					} else {
						const perms = message.guild.me.permissions;
						if (!perms.has("MANAGE_CHANNELS")) noPermission.push("管理頻道 (global)");
						if (!perms.has("MANAGE_ROLES")) noPermission.push("管理身分組 (global)");
						if (!perms.has("MOVE_MEMBERS")) noPermission.push("移動成員 (global)");
						if (!perms.has("MUTE_MEMBERS")) noPermission.push("禁音成員 (global)");
					}

					const embed = new Discord.MessageEmbed()
						.setColor(client.colors.info)
						.setAuthor(message.guild.name, message.guild.iconURL({ dynamic: true }))
						.setTitle(`自動語音頻道設定 (第 ${i + 1} 頁 / 共 ${a.length} 頁)`)
						.addField("建立語音頻道", `\`${v.creator}\` ${client.channels.cache.get(v.creator)}`)
						.addField("語音頻道類別", v.category ? `\`${v.category}\` ${client.channels.cache.get(v.category).name}` : "`未設定語音頻道類別`")
						.addField("頻道設定", `頻道名稱: ${v.channelSettings.name ? `\`${v.channelSettings.name}\`\n　　預覽: ${v.channelSettings.name.replace(/{.+}/g, all => placeholder[all] || all)}` : `\`未設定\`\n　　預設: {user.displayName} 的房間\n　　預覽: ${"{user.displayName} 的房間".replace(/{.+}/g, all => placeholder[all] || all)}`}\n　位元率: \`${v.channelSettings.bitrate}\`bps\n人數限制: \`${v.channelSettings.limit ? v.channelSettings.limit : "無限制"}\``)
						.setFooter(tip[Math.floor(Math.random() * tip.length)])
						.setTimestamp();
					if (noPermission.length) embed.setDescription(`** :warning: 這個類別缺少以下權限 ${noPermission.join(", ")}**`);
					pages.push(embed);
				});
				if (pages.length > 1) control = true;
			} else {
				const embed = new Discord.MessageEmbed()
					.setColor(message.member.displayHexColor)
					.setAuthor(message.guild.name, message.guild.iconURL({ dynamic: true }))
					.setTitle("自動語音頻道設定")
					.setDescription("這個伺服器尚未設定自動語音頻道")
					.setFooter(`使用 ${settings.prefix}voice setup 來快速設定自動語音頻道`)
					.setTimestamp();
				pages.push(embed);
			}
			const sent = await message.channel.send(pages[index]);
			if (control) {
				await sent.react("◀️");
				await sent.react("▶️");
				paginator();
			}
			function paginator() {
				const filter = (reaction, user) => (reaction.emoji.name === "◀️" || reaction.emoji.name === "▶️") && user.id == message.author.id;
				const collector = sent.createReactionCollector(filter, { max: 1, time: 60000 });
				collector.on("collect", (r, u) => {
					r.users.remove(u);
					if (r.emoji.name == "◀️")
						if (index > 0) index -= 1;
					if (r.emoji.name == "▶️")
						if (index < pages.length - 1) index += 1;
					sent.edit(pages[index]);
					paginator();
				});
				collector.on("end", (__, reason) => {
					if (reason == "time") sent.reactions.removeAll();
				});
			}
		}

		if (args[0] == "setup") {
			if (!message.member.permissions.has("MANAGE_CHANNELS"))
				return await message.reply("你沒有權限這麼做！");

			const channel = message.channel;
			const phase1 = new Discord.MessageEmbed()
				.setColor(client.colors.info)
				.setAuthor(message.guild.name, message.guild.iconURL({ dynamic: true }))
				.setTitle("設定自動語音頻道 (步驟１)")
				.setDescription("接下來將開始設定自動語音頻道\n在設定之前有幾件事項需要您的注意\n\n**使用此功能:**\n1. 機器人需要全域\"管理頻道\"及\"管理身分組\"權限\n2. 這項功能還在開發測試階段，如有問題發生請聯絡 Kamiya#4047\n\n**功能預覽:**\n1. 成員可以創建自己的語音頻道\n2. 創頻者可以伺服器靜音自己頻道內的其他成員\n3. 設定多個自動語音頻道\n4. 自動刪除機器人創建的無人的語音頻道\n\n點擊✅反應來繼續設定\n點擊❌反應來取消")
				.setFooter(`只有 ${message.member.displayName} 可以回應`);
			const sent = await channel.send(phase1);
			await sent.react("✅");
			await sent.react("❌");
			const filter1 = (reaction, user) => (reaction.emoji.name === "✅" || reaction.emoji.name === "❌") && user.id == message.author.id;
			const collector1 = sent.createReactionCollector(filter1, { max: 1 });
			collector1.on("collect", async r => {
				await sent.reactions.removeAll();
				if (r.emoji.name == "✅")
					phase2();
				if (r.emoji.name == "❌") {
					const cancel = new Discord.MessageEmbed()
						.setColor(client.colors.error)
						.setDescription("已取消設定");
					await sent.edit(cancel);
					return;
				}
			});

			async function phase2() {
				const phase2 = new Discord.MessageEmbed()
					.setColor(client.colors.info)
					.setAuthor(message.guild.name, message.guild.iconURL({ dynamic: true }))
					.setTitle("設定自動語音頻道 (步驟２)")
					.setDescription("選擇設定方式\n\n1️⃣: **全自動**\n2️⃣: ~~手動~~ (未完成)\n❌: 取消")
					.setFooter(`只有 ${message.member.displayName} 可以回應`);
				await sent.edit(phase2);
				await sent.react("1️⃣");
				await sent.react("2️⃣");
				await sent.react("❌");
				const filter2 = (reaction, user) => (reaction.emoji.name === "1️⃣" || /*reaction.emoji.name === '2️⃣' ||*/ reaction.emoji.name === "❌") && user.id == message.author.id;
				const collector2 = sent.createReactionCollector(filter2, { max: 1 });
				collector2.on("collect", async r => {
					await sent.reactions.removeAll();
					if (r.emoji.name == "1️⃣")
						autoCreate();
					if (r.emoji.name == "2️⃣") {
						// phase3();
					}
					if (r.emoji.name == "❌") {
						const cancel = new Discord.MessageEmbed()
							.setColor(client.colors.error)
							.setDescription("已取消設定");
						await sent.edit(cancel);
						return;
					}
				});
			}
			/*
                        async function phase3() {
                            const phase3 = new Discord.MessageEmbed()
                                .setColor("#aaccff")
                                .setAuthor(message.guild.name, message.guild.iconURL({ dynamic: true }))
                                .setTitle("設定自動語音頻道 (步驟３)")
                                .setDescription("請輸入要設定為創建頻道的頻道 (頻道 ID 或提及)");
                            await sent.edit(phase3);
                            const filter3 = m => m.author.id == message.author.id;
                            async function getResponse() {
                                await awaitmsg(filter3, msg => {
                                    if (msg.content.match(/\d+/).length == 0) getResponse();
                                    client.channels.get(msg.content.match(/\d+/)[0])
                                });
                            }
                        };*/

			async function autoCreate() {
				try {
					const autoProgress = new Discord.MessageEmbed()
						.setColor(client.colors.warn)
						.setAuthor(message.guild.name, message.guild.iconURL({ dynamic: true }))
						.setTitle("設定自動語音頻道 (步驟３)")
						.setDescription("正在設定自動語音頻道中...");
					await sent.edit(autoProgress);
					const guild = message.guild;
					const category = await guild.channels.create("自動語音頻道", { type: "category", permissionOverwrites: [{ id: client.user.id, allow: [ "MANAGE_CHANNELS", "MANAGE_ROLES", "MOVE_MEMBERS", "MUTE_MEMBERS" ] }], reason: "自動設定自動語音頻道" });
					const creator = await guild.channels.create("建立語音頻道", { type: "voice", parent: category, reason: "自動設定自動語音頻道" });
					settings.voice.push({
						creator         : creator.id,
						category        : category.id,
						channelSettings : {
							name    : "",
							bitrate : 64000,
							limit   : 0,
							text    : {
								name     : "",
								category : category.id,
								reactmsg : ""
							}
						}
					});
					await settings.save().catch(() => { });
					autoEnd();
					return;
				} catch (e) {
					const autoError = new Discord.MessageEmbed()
						.setColor(client.colors.error)
						.setTitle(client.embedStat.error)
						.setDescription(`自動設定自動語音頻道時發生錯誤\n\`${e.toString()}\``);
					await sent.edit(autoError);
					console.error(e);
					return;
				}
			}

			async function autoEnd() {
				const autoEnd = new Discord.MessageEmbed()
					.setColor(client.colors.success)
					.setAuthor(message.guild.name, message.guild.iconURL({ dynamic: true }))
					.setTitle("設定自動語音頻道 (完成)")
					.setDescription("已完成設定，您現在可以更改頻道和類別名稱了");
				await sent.edit(autoEnd);
				return;
			}

		}

		if (args[0] == "add") {
			if (!message.member.permissions.has("MANAGE_CHANNELS"))
				return await message.reply("你沒有權限這麼做！");

			if (setting) {
				const embed = new Discord.MessageEmbed()
					.setColor(client.colors.error)
					.setTitle(client.embedStat.error)
					.setDescription(`\`${args[1]}\` 已經存在`);
				await message.channel.send(embed);
				return;
			} else {
				settings.voice.push({
					creator         : args[1],
					category        : "",
					channelSettings : {
						name    : "",
						bitrate : 64000,
						limit   : 0,
						text    : {
							name     : "",
							category : "",
							reactmsg : ""
						}
					}
				});
				await settings.save().catch(() => { });
				const embed = new Discord.MessageEmbed()
					.setColor(client.colors.success)
					.setTitle(client.embedStat.success)
					.setDescription(`已建立\`${args[1]}\``);
				await message.channel.send(embed);
				return;
			}
		}

		if (args[0] == "set") {
			if (!message.member.permissions.has("MANAGE_CHANNELS"))
				return await message.reply("你沒有權限這麼做！");

			if (setting) {
				if (args[2].toLowerCase() == "category") {
					const old = settings.voice[settings.voice.map(e => e.creator).indexOf(args[1])];
					settings.voice.splice(settings.voice.indexOf(setting), 1);
					await settings.save().catch(() => { });
					old.category = args[3];
					settings.voice.push(old);
					await settings.save().catch(() => { });
					const embed = new Discord.MessageEmbed()
						.setColor(client.colors.success)
						.setTitle(client.embedStat.success)
						.setDescription(`已變更\`category\`值為\`${args[3]}\``);
					await message.channel.send(embed);
					return;
				}
				if (args[2].toLowerCase() == "limit") {
					const limit = parseInt(args[3]);
					if (limit < 0 || limit > 99) {
						const embed = new Discord.MessageEmbed()
							.setColor(client.colors.error)
							.setTitle(client.embedStat.error)
							.setDescription("值必須介於 0 至 99");
						await message.channel.send(embed);
						return;
					}
					const old = settings.voice[settings.voice.map(e => e.creator).indexOf(args[1])];
					settings.voice.splice(settings.voice.indexOf(setting), 1);
					await settings.save().catch(() => { });
					old.channelSettings.limit = limit;
					settings.voice.push(old);
					await settings.save().catch(() => { });
					const embed = new Discord.MessageEmbed()
						.setColor(client.colors.success)
						.setTitle(client.embedStat.success)
						.setDescription(`已變更\`limit\`值為\`${args[3]}\``);
					await message.channel.send(embed);
					return;
				}
				if (args[2].toLowerCase() == "name") {
					const old = settings.voice[settings.voice.map(e => e.creator).indexOf(args[1])];
					settings.voice.splice(settings.voice.indexOf(setting), 1);
					await settings.save().catch(() => { });
					old.channelSettings.name = args[3];
					settings.voice.push(old);
					await settings.save().catch(() => { });
					const embed = new Discord.MessageEmbed()
						.setColor(client.colors.success)
						.setTitle(client.embedStat.success)
						.setDescription(`已變更\`name\`值為\`${args[3]}\``);
					await message.channel.send(embed);
					return;
				}
				if (args[2].toLowerCase() == "bitrate") {
					const bitrate = parseInt(args[3]);
					if (bitrate < 8000 || bitrate > 96000) {
						const embed = new Discord.MessageEmbed()
							.setColor(client.colors.error)
							.setTitle(client.embedStat.error)
							.setDescription("值必須介於 8000 至 96000");
						await message.channel.send(embed);
						return;
					}
					const old = settings.voice[settings.voice.map(e => e.creator).indexOf(args[1])];
					settings.voice.splice(settings.voice.indexOf(setting), 1);
					await settings.save().catch(() => { });
					old.channelSettings.bitrate = bitrate;
					settings.voice.push(old);
					await settings.save().catch(() => { });
					const embed = new Discord.MessageEmbed()
						.setColor(client.colors.success)
						.setTitle(client.embedStat.success)
						.setDescription(`已變更\`bitrate\`值為\`${args[3]}\``);
					await message.channel.send(embed);
					return;
				}
			} else {
				const embed = new Discord.MessageEmbed()
					.setColor(client.colors.error)
					.setTitle(client.embedStat.error)
					.setDescription(`\`${args[1]}\` 不存在`);
				await message.channel.send(embed);
				return;
			}
		}

		if (args[0] == "remove") {
			if (!message.member.permissions.has("MANAGE_CHANNELS"))
				return await message.reply("你沒有權限這麼做！");

			if (setting) {
				settings.voice.splice(settings.voice.indexOf(setting), 1);
				await settings.save().catch(() => { });
				const embed = new Discord.MessageEmbed()
					.setColor(client.colors.success)
					.setTitle(client.embedStat.success)
					.setDescription(`已刪除\`${args[1]}\``);
				await message.channel.send(embed);
				return;
			} else {
				const embed = new Discord.MessageEmbed()
					.setColor(client.colors.error)
					.setTitle(client.embedStat.error)
					.setDescription(`\`${args[1]}\` 不存在`);
				await message.channel.send(embed);
				return;
			}
		}

	} catch (e) {
		await message.reply(`發生了預料外的錯誤 \`${e.toString()}\``);
		return console.error(e);
	}
}
voice.prop = {
	name : "voice",
	desc : "顯示自動語音頻道設定",
	args : [
		{
			name   : "list|setup|add|set|remove",
			type   : "",
			desc   : "list: 顯示已設定頻道\nsetup: 開始快速設定\nadd: 將一個頻道新增為自動語音頻道\nset: 設定自動語音頻道設定\nremove: 將一個頻道從自動語音頻道中刪除",
			option : true
		}
	],
	exam  : [""],
	guild : true
};
module.exports = voice;

function saveUser(user = null, key = null, data = null) {
	return new Promise((resolve) => {
		if (user)
			if (!key)
				userSetting[user.id] = data;

			else {
				if (!Object.keys(userSetting).includes(user.id)) saveUser(user, null, { name: "", limit: 0, bitrate: 0 });
				userSetting[user.id][key] = data;
			}

		try {
			fs.writeFileSync(require.resolve(settingUser), JSON.stringify(userSetting));
		} catch (e) {
			console.error(e);
		}
		resolve(true);
	});
}