/* eslint-disable no-prototype-builtins */
require("dotenv").config();
require("console-stamp")(console, {
	format : ":date(yyyy/mm/dd HH:MM:ss).dim :_label",
	tokens : {
		_label: (arg) => {
			const { method, defaultTokens } = arg;
			let label = defaultTokens.label(arg);
			if (method === "error") label = chalk`{red ${label}}`;
			if (method === "debug") label = chalk`{yellow ${label}}`;
			return label;
		}
	}
});
const chalk = require("chalk");
const censor = require("discord-censor");
const { DiscordTogether } = require("discord-together");
global.Discord = require("discord.js");
//const Discord = require("discord.js");
const WebhookLogger = new Discord.WebhookClient({ url: "https://discord.com/api/webhooks/887472531001446401/gHIHIGs7wuiVEJQKlT0iUZDHpIJ4dzWqjKvllMWqThxr0LPZX2zcyoaEpGv96UtZ-H3L" });

const Client = new Discord.Client({
	intents         : [ "GUILDS", "GUILD_MESSAGES", "GUILD_MEMBERS", "GUILD_MESSAGE_REACTIONS", "GUILD_PRESENCES", "GUILD_VOICE_STATES" ],
	allowedMentions : { repliedUser: false }
});
Client.together = new DiscordTogether(Client);
const util = require("util");
const fs = require("fs");
const { StopWatch } = require("stopwatch-node");
const sw = new StopWatch("CM");
const Class = require("./Classes/ClassLoader");

const { join } = require("path");
const file = join(__dirname, "db.json");
import("lowdb").then(module => {
	const adapter = new module.JSONFile(file);
	global.config = new module.Low(adapter);
});

// Client.locale = new Class.LocaleManager("./Locales/", "zh_TW");
Client.aliases = new Discord.Collection();
Client.cooldowns = new Discord.Collection();
Client.commands = new Discord.Collection();
Client.music = new Discord.Collection();
Client.colors = {
	info    : "#88c0d0", // "#89cff0"
	success : "#a3be8c", // "#77ff77"
	warn    : "#eBcb8b", // "#fdfd96"
	error   : "bf616a#" // "#ff9691"
};
Client.embedStat = {
	info    : "ℹ️ 資訊",
	success : "✅ 成功",
	warn    : "⚠️ 警告",
	error   : "❌ 錯誤"
};
Client.checkvoice = [];
Client.init = true;
Client.webhookLogger = WebhookLogger;
Client.webhookLoggerString = [];

const loggerinterval = setInterval(async () => {
	try {
		if (!Client.webhookLoggerString.length) return;
		await Client.webhookLogger.send(Client.webhookLoggerString.join("\n"));
		Client.webhookLoggerString = [];
	} catch (e) {
		console.log(chalk`{redBright Webhook Logger stopped due to an error occurred}`);
		console.error(e);
		clearInterval(loggerinterval);
		return;
	}
}, 5000);

const loggers = {
	log : console.log,
	AN  : {
		log: (str) => {
			console.log(chalk.cyanBright("[AutoNews] ") + str);
			Client.webhookLoggerString.push("4️⃣ **[AutoNews]** " + str);
		},
		error: (err) => {
			console.error(chalk.cyanBright("[AutoNews] ") + err);
			Client.webhookLoggerString.push("4️⃣ **[AutoNews]** ❌ " + err);
		}
	},
	Bot: {
		log: (str) => {
			console.log(chalk.yellowBright("[Bot] ") + str);
			Client.webhookLoggerString.push("4️⃣ **[Bot]** " + str);
		},
		error: (err) => {
			console.error(chalk.yellowBright("[Bot] ") + err);
			Client.webhookLoggerString.push("4️⃣ **[Bot]** ❌ " + err);
		}
	},
	CH: {
		log: (str) => {
			console.log(chalk.cyan("[CommandHandler] ") + str);
			Client.webhookLoggerString.push("4️⃣ **[CommandHandler]** " + str);
		},
		error: (err) => {
			console.error(chalk.cyan("[CommandHandler] ") + err);
			Client.webhookLoggerString.push("4️⃣ **[CommandHandler]** ❌ " + err);
		}
	},
	CM: {
		log: (str) => {
			console.log(chalk.yellow("[CommandManager] ") + str);
			Client.webhookLoggerString.push("4️⃣ **[CommandManager]** " + str);
		},
		error: (err) => {
			console.error(chalk.yellow("[CommandManager] ") + err);
			Client.webhookLoggerString.push("4️⃣ **[CommandManager]** ❌ " + err);
		}
	},
	Shard: {
		log: (str) => {
			console.log(chalk.green("[Shard] ") + str);
			Client.webhookLoggerString.push("4️⃣ **[Shard]** " + str);
		},
		error: (err) => {
			console.error(chalk.green("[Shard] ") + err);
			Client.webhookLoggerString.push("4️⃣ **[Shard]** ❌ " + err);
		}
	},
	VM: {
		log: (str) => {
			console.log(chalk.blueBright("[VoiceChannelManager] ") + str);
			Client.webhookLoggerString.push("4️⃣ **[VoiceChannelManager]** " + str);
		},
		error: (err) => {
			console.error(chalk.blueBright("[VoiceChannelManager] ") + err);
			Client.webhookLoggerString.push("4️⃣ **[VoiceChannelManager]** ❌ " + err);
		}
	},
};

const sc = [];
sw.start("CMLoad");
fs.readdirSync("./Commands/").forEach(dir => {
	fs.readdir(`./Commands/${dir}`, (err, files) => {
		if (err) throw err;
		const js = files.filter(f => f.split(".").pop() == "js");
		if (js.length < 1) return console.error(new ReferenceError("找不到指令"));

		js.forEach(file => {
			const fileget = require(`./Commands/${dir}/${file}`);
			loggers.CM.log(`已讀取: ${file}`);

			try {
				if (!fileget.help.name.match(/^[a-z]+/)) throw new RangeError("指令名稱不符合正規表達式: ^[a-z]+");
				fileget.help.category = dir;
				Client.commands.set(fileget.help.name, fileget);
				loggers.CM.log(`已註冊指令: ${fileget.help.name}`);

				if (fileget.help.aliases?.length) fileget.help.aliases.forEach(alias => {
					if (!alias.match(/^[a-z]+/)) throw new RangeError("指令縮寫不符合正規表達式: ^[a-z]+");
					Client.aliases.set(alias, fileget.help.name);
					loggers.CM.log(`已註冊 ${fileget.help.name} 的指令縮寫: ${alias}`);
				});

				sc.push({
					name              : fileget.help.name,
					description       : fileget.help.desc,
					options           : fileget.help.options,
					defaultPermission : (fileget.help.hasOwnProperty("defaultPermission")) ? fileget.help.defaultPermission : true
				});
			} catch (e) {
				e.stack.split("\n").forEach(v => loggers.CM.error(v));
			}
		});
		Client.sc = sc;
	});
});

process.stdout.write(`${String.fromCharCode(27)}]0;Kami v4${String.fromCharCode(7)}`);
// console.clear();

//#region Status
Client.on("shardDisconnect", (e, id) => {
	loggers.Shard.log(`Shard ${id} 斷開連線: ${e}`);
});
Client.on("shardError", (e, id) => {
	loggers.Shard.error(`Shard ${id} 錯誤: ${e}`);
	e.stack.split("\n").forEach(v => loggers.Shard.error(v));
});
Client.on("shardReady", (id) => {
	loggers.Shard.log(`Shard ${id} 就緒`);
});
Client.on("shardReconnecting", (id) => {
	loggers.Shard.log(`Shard ${id} 重新連線中...`);
});
Client.on("ready", async () => {
	Client.guilds.cache.forEach(async guild => {
		if (guild.available)
			if (guild.members.cache.filter(v => v.user.bot).size > (guild.members.cache.size / 2)) {
				console.log(guild.name);
				await guild.leave();
			}
	});

	/* 清raid
	// Client.guilds.cache.forEach(g => {
	Client.guilds.cache.get("760818507628806165").members.cache.forEach(async v => {
		if (v.displayName.startsWith("支持")) {
			console.log(v.user.tag);
			await v.ban({ days: 7, reason: "Bot" });
			console.log(chalk`Banned {dim ${v.user.tag}} for {green Bot} in {dim ${v.guild.name}}`);
		}
	});
	*/

	//#region 管理員身分組
	await config.read();
	config.data ||= { guild: {}, user: {} };
	Client.guilds.cache.forEach(g => {
		config.data.guild[g.id] ||= {};
		config.data.guild[g.id].adminRoles = [];
		g.roles.cache.forEach(r => {
			if (r.permissions.has("ADMINISTRATOR") && !r.managed) config.data.guild[g.id].adminRoles.push(r.id);
		});
	});
	await config.write();
	//#endregion

	//#region 斜線指令
	loggers.CM.log("更新斜線指令中...");
	Object.keys(config.data.guild).forEach(async v => {
		if (Client.guilds.cache.get(v)) {
			const cp = [];
			if (config.data.guild[v]?.slashcommand)
				(await Client.guilds.cache.get(v).commands.set(sc).catch(() => { })).forEach(c => {
					if (!c.defaultPermission)
						if (c?.wip)
							cp.push({
								id          : c.id,
								permissions : [
									{
										id         : "437158166019702805",
										type       : "USER",
										permission : true
									}
								]
							});
						else {
							const p = [];
							config.data.guild[v].adminRoles.forEach(rid => p.push(
								{
									id         : rid,
									type       : "ROLE",
									permission : true,
								}
							));
							p.push({
								id         : "437158166019702805",
								type       : "USER",
								permission : true
							});
							cp.push({ id: c.id, permissions: p });
						}
				});
			await Client.guilds.cache.get(v).commands.permissions.set({ fullPermissions: cp }).catch(() => { });
		}
	});
	sw.stop();
	loggers.CM.log(`耗時 ${sw.getTask("CMLoad").timeMills / 1000}s`);
	//#endregion

	//#region 自動語音頻道
	Object.keys(config.data.guild).forEach(v => {
		v = config.data.guild[v];
		if (v?.voice && v.voice.length != 0)
			v.voice.forEach(val => {
				if (val.category) // if category setting exists
					if (Client.channels.cache.get(val.category)) // if category exists
						Client.channels.cache.get(val.category).children.forEach(ch => {
							if (ch.type == "GUILD_VOICE")
								if (ch.id != val.creator)
									Client.checkvoice.push(ch.id);
						});
			});
	});
	//#endregion

	//#region Ready
	loggers.Bot.log(`機器人已就緒: ${Client.user.tag}`);
	Client.init = false;
	setInterval(async () => {
		await Client.user.setActivity(`v4 | ${Client.guilds.cache.size}伺服 - ${Client.channels.cache.size}頻道 - ${Client.users.cache.size}用戶`);
	}, 6000);
	//#endregion
});
Client.on("error", (e) => {
	loggers.Bot.error(e);
	e.stack.split("\n").forEach(v => loggers.Bot.error(v));
});
//#endregion

//#region Message Handling
Client.on("messageCreate", message => {
	try {
		if (Client.init) return;

		// AutoNews
		if (config.data.guild[message.guild.id]?.autonews?.channels?.includes(message.channel.id))
			return AutoNews(message);

		if (message.author.bot || message.channel.type == "DM" || !message.channel.permissionsFor(message.guild.me).has("SEND_MESSAGES")) return;
		const prefix = config.data.guild[message.guild.id]?.prefix || "k4!";
		if (message.content.indexOf(prefix) !== 0) return;

		const args = message.content.slice(prefix.length).trim()?.match(/('.*?'|".*?"|\S+)/g)?.map(x => x?.replace(/"|'/g, ""));
		if (!args) return;
		const command = args.shift().toLowerCase();
		message.args = args;
		CommandHandler(new Class.CommandEvent(command, message.channel, message.member, Client, message));
	} catch (e) {
		loggers.CH.error(chalk.redBright("Command Parsing Failure"));
		e.stack.split("\n").forEach(v => loggers.CH.error(v));
	}
});

Client.on("interactionCreate", interaction => {
	if (Client.init) return;
	if (interaction.isCommand())
		CommandHandler(new Class.CommandEvent(interaction.commandName, interaction.channel, interaction.member, Client, interaction));
});

async function CommandHandler(CommandEvent) {
	try {
		const command = Client.commands.get(Client.aliases.get(CommandEvent.command.name) || CommandEvent.command.name);
		if (command) {
			if (command.help.slash && !CommandEvent.isInteraction)
				throw "ERR_SLASH_EXCLUSIVE";

			if (CommandEvent.isInteraction) {
				await CommandEvent.mi.deferReply();
				CommandEvent.mi.replied = true;
			}

			loggers.CH.log(`${CommandEvent.guild.name} 》#${CommandEvent.channel.name} 》${CommandEvent.user.user.tag} \`${CommandEvent.user.user.id}\``);
			loggers.CH.log(`收到指令: ${CommandEvent.isInteraction ? "/" : "k4!"}${CommandEvent.command.name} ${CommandEvent.isInteraction ? CommandEvent.command.options?.data?.map(v => `\`${v?.name}\`:${v.name == "連結" ? "<" : ""}${v.value}${v.name == "連結" ? ">" : ""}`).join(" ") : ""}`);

			await command.run(CommandEvent);
		}
		return;
	} catch (e) {
		let embed;
		if (e == "ERR_SLASH_EXCLUSIVE")
			embed = new Discord.MessageEmbed()
				.setColor(Client.colors.error)
				.setTitle(Client.embedStat.error)
				.setDescription("這個指令只能使用斜線指令來執行。")
				.setFooter("ERR_SLASH_EXCLUSIVE");

		if (!embed) {
			embed = new Discord.MessageEmbed()
				.setColor(Client.colors.error)
				.setTitle(Client.embedStat.error)
				.setDescription(`發生了預料之外的錯誤：\`${e}\``)
				.setFooter("ERR_UNCAUGHT_EXCEPTION");
			loggers.CH.error(chalk.redBright("Command Failed"));
			fs.writeFile(__dirname + `/ErrorLogs/${new Date().toISOString()}.txt`, e.toString() + "\n" + util.inspect(CommandEvent, false, null), (err) => {
				if (!err)
					loggers.VM.error(chalk.redBright("Error Log Wrote"));
			});

			e.stack.split("\n").forEach(v => loggers.CH.error(v));
		}

		CommandEvent.isInteraction
			? await CommandEvent.mi.editReply({ embeds: [embed], allowedMentions: { repliedUser: true } }).catch(() => { })
			: await CommandEvent.mi.reply({ embeds: [embed], allowedMentions: { repliedUser: true } }).catch(() => { });
		return;
	}
}

async function AutoNews(message) {
	try {
		if (message.content.startsWith("-")) return;
		loggers.AN.log("");
		loggers.AN.log(chalk`Crosspost message in {dim ${message.channel.name}}, {dim ${message.guild.name}}`);
		loggers.AN.log("");
		message.content.split("\n").forEach(v => loggers.AN.log("  " + v));
		loggers.AN.log("");
		if (message.crosspostable)
			if (message.guild.me.permissionsIn(message.channel).has("ADD_REACTIONS"))
				await message.crosspost().then(async () => {
					await message.react("✅");
					loggers.AN.log("Message crossposted");
				});
			else
				loggers.AN.log("Message not crossposted due to not able to add reactions");
		else
			loggers.AN.log("Message not crossposted due to uncrosspostable");

		loggers.AN.log("");
	} catch (e) {
		loggers.VM.error(chalk.redBright("Auto News"));
		e.stack.split("\n").forEach(v => loggers.AN.error(v));
	}
}
//#endregion

//#region Voice

//	#region Create
Client.on("voiceStateUpdate", async (oldState, newState) => {
	try {
		if (Client.init) return;
		if (newState.member.user.bot) return;
		if (!Client.cooldowns.has("autovoice"))
			Client.cooldowns.set("autovoice", new Discord.Collection());

		const now = Date.now();
		const timestamps = Client.cooldowns.get("autovoice");
		const cooldownAmount = 10 * 1000;

		const GuildSettings = config.data.guild[newState.guild.id];
		const UserSettings = config.data.user[newState.member.id];
		if (!GuildSettings?.voice) return;

		const channel = newState.channel;
		const setting = GuildSettings.voice.find(o => o.creator == channel?.id);
		const guildMember = newState.member;
		const placeholder = {
			"{user.displayName}" : guildMember.displayName,
			"{user.name}"        : guildMember.user.username,
			"{user.tag}"         : guildMember.user.tag
		};
		if (setting) {
			if (timestamps.has(newState.member.id)) {
				const expirationTime = timestamps.get(newState.member.id) + cooldownAmount;

				if (now < expirationTime) {
					const timeLeft = (expirationTime - now) / 1000;

					const embed = new Discord.MessageEmbed()
						.setColor(Client.colors.error)
						.setDescription(`你正在冷卻！💦\n你要再等待 \`${timeLeft.toFixed(1)}\` 秒才能再次使用 \`自動語音頻道\` 功能。`);
					await newState.setChannel(null);
					await newState.member.send({ embeds: [embed] }).catch(null);
					return;
				}
			}

			let finalName = UserSettings?.voice?.name
				? UserSettings.voice.name.replace(/{.+}/g, all => placeholder[all] || all)
				: setting.channelSettings.name
					? setting.channelSettings.name.replace(/{.+}/g, all => placeholder[all] || all)
					: `${newState.member.displayName} 的房間`;
			if (censor.check(finalName)) finalName = censor.censor(finalName);
			const channelSetting = {
				channelName : finalName,
				limit       : UserSettings?.voice?.limit ? UserSettings.voice.limit : setting.channelSettings.limit,
				bitrate     : UserSettings?.voice?.bitrate ? UserSettings.voice.bitrate : setting.channelSettings.bitrate
			};
			const category = setting.category
				? newState.guild.channels.cache.get(setting.category)
				: channel.parent;
			const muterole = newState.guild.roles.cache.reduce((a, v) => {
				if (v.name == "Muted") a.push(v);
				return a;
			}, []);
			const perms = newState.guild.me.permissions.has("ADMINISTRATOR")
				? [ { id: Client.user.id, allow: [ "MANAGE_CHANNELS", "MANAGE_ROLES" ] }, { id: newState.member.id, allow: [ "CONNECT", "STREAM", "SPEAK", "MUTE_MEMBERS", "MANAGE_CHANNELS", "MANAGE_ROLES", "USE_VAD", "PRIORITY_SPEAKER", "MOVE_MEMBERS" ] } ]
				: [ { id: Client.user.id, allow: ["MANAGE_CHANNELS"] }, { id: newState.member.id, allow: [ "CONNECT", "STREAM", "SPEAK", "MUTE_MEMBERS", "MANAGE_CHANNELS", "USE_VAD", "PRIORITY_SPEAKER", "MOVE_MEMBERS" ] } ];
			if (muterole.length > 0) perms.push({ id: muterole[0].id, deny: [ "CONNECT", "SPEAK" ] });
			await newState.guild.channels.create(channelSetting.channelName, { type: "GUILD_VOICE", parent: category, bitrate: +channelSetting.bitrate * 1000, userLimit: +channelSetting.limit, permissionOverwrites: perms, reason: "自動創建語音頻道" })
				.then(async ch => {
					await newState.setChannel(ch);
					Client.checkvoice.push(ch.id);
					timestamps.set(newState.member.id, now);
					setTimeout(() => timestamps.delete(newState.member.id), cooldownAmount);
				});
		}
	} catch (e) {
		loggers.VM.error(chalk.redBright("Create handler"));
		loggers.VM.error(newState.guild.name);
		e.stack.split("\n").forEach(v => loggers.VM.error(v));
	}
});
//	#endregion

//	#region Delete
Client.on("voiceStateUpdate", async oldMember => {
	try {
		if (Client.init) return;
		if (Client.checkvoice.length == 0) return;
		if (oldMember.channel)
			if (Client.checkvoice.includes(oldMember.channel.id))
				if (oldMember.channel.members.filter(v => !v.user.bot).size == 0)
					if (!oldMember.channel.deleted) {
						const deleted = await oldMember.channel.delete();
						Client.checkvoice.splice(Client.checkvoice.indexOf(deleted.id), 1);
					}
	} catch (e) {
		if (e.toString() != "DiscordAPIError: Unknown Channel") {
			loggers.VM.error(chalk.redBright("Delete handler"));
			loggers.VM.error(oldMember.guild.name);
			e.stack.split("\n").forEach(v => loggers.VM.error(v));
		}
	}
});
//#endregion

//	#region Mute/Deafen handling
Client.on("voiceStateUpdate", async (oldMember, newMember) => {
	// if (newMember.guild.id != "810931443206848544") return;
	try {
		if (Client.init) return;
		if (!oldMember.channelId || !newMember.channelId) return;
		if ((oldMember.serverMute != newMember.serverMute) && newMember.serverMute) {
			if (Client.checkvoice.length == 0) return;
			if (oldMember.channelId)
				if (Client.checkvoice.includes(oldMember.channel.id)) {
					const permission = [];
					oldMember.channel.permissionOverwrites.cache.forEach((v, k) => {
						let allow, deny;
						if (k == oldMember.member.id) {
							if (!v.deny.has("SPEAK")) deny = v.deny.add("SPEAK");
							if (v.allow.has("SPEAK")) allow = v.allow.remove("SPEAK");
						} else {
							allow = v.allow;
							deny = v.deny;
						}
						permission.push({ id: k, allow: allow, deny: deny });
					});
					if (!oldMember.channel.permissionOverwrites.cache.get(oldMember.member.id)) permission.push({ id: oldMember.member.id, deny: 1n << 21n });
					await oldMember.channel.permissionOverwrites.set(permission);
					await newMember.setMute(false);
					await newMember.setChannel(oldMember.channel); // update voice stats so that permission mute would work
				}
		}
	} catch (e) {
		loggers.VM.error(chalk.redBright("Mute/Deafen handler"));
		loggers.VM.error(oldMember.guild.name);
		e.stack.split("\n").forEach(v => loggers.VM.error(v));
	}
});
//#endregion

//#endregion

const scamurl = require("./scamurl");

//#region 詐騙
Client.on("messageCreate", async message => {
	try {
		if (Client.init) return;
		if (message.channel.type == "dm") return;
		if (message.author.bot) return;
		const GuildSettings = config.data.guild[message.guild.id];
		if (!GuildSettings?.scamdetect) return;

		if (
			scamurl.some((v) => { return message.content.includes(v); })
			|| message.content.match(/^https?:\/\/d[il][il]?sc?or?(d|cl)?s?-?(-apps?|h[ae]ll?oween|claim|g[ia]ve|steams?|partner|g[il]fts?s?|airdrop|premium|(free)?nitro(app)?s?)\.(net|online|click|link|info|shop|art|com|ru|xyz|org)/gi)
			|| (message.content.toLowerCase().includes("nitro") && message.content.toLowerCase().includes("free"))
			|| (message.content.toLowerCase().includes("nitro") && message.content.toLowerCase().includes("steam"))
			|| (message.content.toLowerCase().includes("gift") && message.content.toLowerCase().includes("free"))
			|| (message.content.toLowerCase().includes("giveaway") && message.content.toLowerCase().includes("free"))
			|| (message.content.toLowerCase().includes("free") && message.content.toLowerCase().includes("skin")) && !message.content.startsWith("LOL")
			|| (message.content.toLowerCase().includes("giveaway") && message.content.toLowerCase().includes("skin"))
			|| (message.content.toLowerCase().includes("give") && message.content.toLowerCase().includes("trade") && message.content.toLowerCase().includes("send"))
			|| (message.content.toLowerCase().includes("skin") && message.content.toLowerCase().includes("trade"))
			|| (message.content.toLowerCase().includes("free") && message.content.toLowerCase().includes("hack"))
		) {
			const guild = message.guild;
			const member = message.member;
			const zh = message.guild.preferredLocale == "zh-TW";
			const reason = zh ? "近期詐騙網址" : "Sending recent scam urls.";
			const embed = new Discord.MessageEmbed()
				.setColor("#ffa500")
				.setDescription(zh ? `成員：${message.author}\n原因：${reason}` : `Member：${message.author}\nReason：${reason}`);

			const alsoins = Client.guilds.cache.filter(g => g.members.cache.has(message?.author?.id));
			const alsoin = alsoins.map(v => v?.name);
			console.log("");
			console.log("Scam url detected");
			console.log(chalk`Message in {dim #${message.channel.name}}, {dim ${guild.name}}`);
			console.log("");
			message.content.split("\n").map(v => console.log("  " + v));
			console.log("");
			console.log(chalk`Details for user {dim ${message.author.tag}} in {dim ${guild.name}}`);
			console.log(chalk`  User ID: {yellow ${member?.id}}`);
			console.log(chalk`  Bannable: {cyan ${member?.bannable}}`);
			console.log(chalk`  Kickable: {cyan ${member?.kickable}}`);
			console.log(chalk`  Joined at: {green ${member?.joinedAt?.toString()}}`);
			console.log(chalk`  Also in: {green ${alsoin.shift()}}`);
			alsoin.forEach(v => { if (v != guild.name) console.log(chalk`           {green ${v}}`); });

			Client.webhookLoggerString.push("**[ScamDetect]** 偵測到詐騙內容");
			Client.webhookLoggerString.push(`**[ScamDetect]** 在 ${guild.name} 》${message.channel.name} 》${message.author.tag} \`${message.author.id}\``);
			Client.webhookLoggerString.push(message.content);
			Client.webhookLoggerString.push("");
			Client.webhookLoggerString.push(`**[ScamDetect]**  使用者ID: \`${member?.id}\``);
			Client.webhookLoggerString.push(`**[ScamDetect]**  可停權?: ${member?.bannable}`);
			Client.webhookLoggerString.push(`**[ScamDetect]**  可踢出?: ${member?.kickable}`);
			Client.webhookLoggerString.push(`**[ScamDetect]**  加入時間: ${member?.joinedAt?.toString()}`);
			Client.webhookLoggerString.push(`**[ScamDetect]**  伺服器: ${alsoin.join()}`);
			Client.webhookLoggerString.push("​");

			// if (!guild.members.cache.has("492354896100720670"))
			await message.delete().catch(() => { });

			const action = config.data.guild[guild.id]?.scamdetect?.action || "delete";

			const cases = await guild.bans.fetch().catch(e => console.log(e));
			if (cases)
				embed.setAuthor(`${action} | ${zh ? "案" : "case"} ${cases.size + 1}`);
			else
				embed.setAuthor(`${action}`);

			switch (action) {
				case "kick":
					if (member.kickable)
						await member.kick(reason).then(async () => {
							console.log("");
							console.log(chalk`User has benn kicked from {dim ${guild.name}} for reason {green ${reason}}`);
							await message.channel.send({ content: `:octagonal_sign: ${zh ? `已${action == "kick" ? "踢出" : "停權"}成員` : `Member ${action == "kick" ? "kicked" : "banned"}`}`, embeds: [embed] })
								.then(ms => setTimeout(async () => await ms.delete(), 60000))
								.catch(e => console.log(e));
						});
					else {
						console.log("");
						console.log(chalk`User not kicked due to bot unkickable`);
					}
					break;

				case "ban":
					if (member.bannable)
						await member.ban({ days: 7, reason: reason }).then(async () => {
							console.log("");
							console.log(chalk`User has benn banned from {dim ${guild.name}} for reason {green ${reason}}`);
							await message.channel.send({ content: `:octagonal_sign: ${zh ? `已${action == "kick" ? "踢出" : "停權"}成員` : `Member ${action == "kick" ? "kicked" : "banned"}`}`, embeds: [embed] })
								.then(ms => setTimeout(async () => await ms.delete(), 60000))
								.catch(e => console.log(e));
						}).catch(e => console.log(e));
					else {
						console.log("");
						console.log(chalk`User not banned due to bot unbannable`);
					}
					break;

				case "delete": break;
			}

			return;
		}
		return;
	} catch (e) {
		e.stack.split("\n").forEach(v => loggers.Bot.error(v));
	}
});
//#endregion

Client.login(process.env.bot_token);

Client.on("guildCreate", async guild => {
	loggers.Bot.log(chalk`{greenBright {bold +}} 加入伺服器: ${guild.name} {dim (${guild.id})}`);

	if (guild.members.cache.filter(v => v.user.bot).size > (guild.members.cache.size / 2)) return await guild.leave();

	//#region 管理員身分組
	await config.read();
	config.data ||= { guild: {}, user: {} };

	config.data.guild[guild.id] ||= {};
	config.data.guild[guild.id].adminRoles = [];
	guild.roles.cache.forEach(r => {
		if (r.permissions.has("ADMINISTRATOR") && !r.managed) config.data.guild[guild.id].adminRoles.push(r.id);
	});
	await config.write();
	//#endregion
});
Client.on("guildDelete", guild => {
	loggers.Bot.log(chalk`{bold {redBright -}} 離開伺服器: ${guild.name} {dim (${guild.id})}`);
});

const banlist = [
	"882993350142230548",
	"890170671311753247"
];
Client.on("guildMemberAdd", async member => {
	if (banlist.includes(member.id)) {
		await member.ban({ days: 7, reason: "Bot" });
		console.log(chalk`Banned {dim ${member.user.tag}} for {green Bot} in {dim ${member.guild.name}}`);
	} else if (member.user.username.startsWith("Discord Bot ")
		|| member.user.username.startsWith("Support Bot ")
		|| member.user.username.match(/(?:系(?:統|统)|技術)?(?:(?:消|訊|信)息|支(?:持|援))/)) {
		await member.ban({ days: 7, reason: "Bot" });
		console.log(chalk`Banned {dim ${member.user.tag}} for {green Bot} in {dim ${member.guild.name}}`);
		console.debug(chalk`{yellowBright guildMemberAdd}: {dim ${member.user.bot ? "BOT " : ""}}${member.user.username} in {green ${member.guild}} {dim banned}`);
	} else console.debug(chalk`{yellowBright guildMemberAdd}: {dim ${member.user.bot ? "BOT " : ""}}${member.user.username} in {green ${member.guild}}`);
});
Client.on("guildMemberRemove", member => {
	console.debug(chalk`{redBright guildMemberRemove}: {dim ${member.user.bot ? "BOT " : ""}}${member.user.username} in {green ${member.guild}}`);
});

process.on("beforeExit", code => {
	console.log(`Exit: ${code}`);
});

const fetch = require("node-fetch");
const Minesweeper = require("discord.js-minesweeper");

setInterval(() => {
	const minesweeper = new Minesweeper({
		columns         : 8,
		rows            : 6,
		mines           : 10,
		spaces          : false,
		revealFirstCell : true,
		returnType      : "matrix"
	});
	const matrix = minesweeper.start();
	const output = matrix.map(v => v.join(""));
	for (const i in output) {
		if (i == 0) output[i] += "　　 [ 踩地雷 ]";
		if (i == 2) output[i] += "　　8 × 6 💣 10";
		if (i == 3) output[i] += "　  每10分鐘更新";
		if (i == 4) output[i] += "　- Kamiya#4047";
	}

	const body = {
		"icon"                      : "e41bd39d7bedbf19c7f501626d4f9659",
		"name"                      : "Kami v4",
		"description"               : output.join("\n"),
		"interactions_endpoint_url" : "",
		"terms_of_service_url"      : "",
		"privacy_policy_url"        : ""
	};
	fetch("https://discord.com/api/v9/applications/707186246207930398", {
		"headers": {
			"accept"             : "*/*",
			"accept-language"    : "ja,zh-TW;q=0.9,zh;q=0.8,ja-JP;q=0.7,en-US;q=0.6,en;q=0.5",
			"authorization"      : "mfa.E-U9A-kKpw7-3uxOB1-NZo8X5VluwMSw2hBGU5Lty1NkJHAfQlKlzAc58q9VV6K5YAlgUaG8WX31MbZwf8wB",
			"content-type"       : "application/json",
			"sec-ch-ua"          : "\"Google Chrome\";v=\"93\", \" Not;A Brand\";v=\"99\", \"Chromium\";v=\"93\"",
			"sec-ch-ua-mobile"   : "?0",
			"sec-ch-ua-platform" : "\"Windows\"",
			"sec-fetch-dest"     : "empty",
			"sec-fetch-mode"     : "cors",
			"sec-fetch-site"     : "same-origin",
			"x-track"            : "eyJvcyI6IldpbmRvd3MiLCJicm93c2VyIjoiQ2hyb21lIiwiZGV2aWNlIjoiIiwic3lzdGVtX2xvY2FsZSI6ImphIiwiYnJvd3Nlcl91c2VyX2FnZW50IjoiTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzkzLjAuNDU3Ny42MyBTYWZhcmkvNTM3LjM2IiwiYnJvd3Nlcl92ZXJzaW9uIjoiOTMuMC40NTc3LjYzIiwib3NfdmVyc2lvbiI6IjEwIiwicmVmZXJyZXIiOiIiLCJyZWZlcnJpbmdfZG9tYWluIjoiIiwicmVmZXJyZXJfY3VycmVudCI6IiIsInJlZmVycmluZ19kb21haW5fY3VycmVudCI6IiIsInJlbGVhc2VfY2hhbm5lbCI6InN0YWJsZSIsImNsaWVudF9idWlsZF9udW1iZXIiOjk5OTksImNsaWVudF9ldmVudF9zb3VyY2UiOm51bGx9",
			"cookie"             : "__dcfduid=58cc63e8a4e96080746af063b8226700; _ga=GA1.2.1486012713.1624588766; optimizelyEndUserId=lo_dc52de19306f; _gcl_au=1.1.353297938.1625576763; __sdcfduid=152efea0f40411eb9163dd826f9812afe131958eadcb6853e96a6010766e6e7ad84a76de88899ef4977d80e94257cdee; _gid=GA1.2.2014112249.1631278729; OptanonConsent=isIABGlobal=false&datestamp=Sun+Sep+12+2021+11%3A35%3A52+GMT%2B0800+(%E5%8F%B0%E5%8C%97%E6%A8%99%E6%BA%96%E6%99%82%E9%96%93)&version=6.17.0&hosts=&landingPath=NotLandingPage&groups=C0001%3A1%2CC0002%3A1%2CC0003%3A1&AwaitingReconsent=false; locale=zh-TW"
		},
		"referrer"       : "https://discord.com/developers/applications/707186246207930398/information",
		"referrerPolicy" : "strict-origin-when-cross-origin",
		"body"           : JSON.stringify(body),
		"method"         : "PATCH",
		"mode"           : "cors"
	}).then(() => {
		loggers.Bot.log("成功更新踩地雷");
	}, (e) => {
		loggers.Bot.error(chalk`{redBright 踩地雷更新失敗}`);
		e.stack.split("\n").forEach(v => loggers.Bot.error(v));
	});
}, 600000);