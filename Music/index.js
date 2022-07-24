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
global.Discord = require("discord.js");
global.DiscordVoice = require("@discordjs/voice");
const Youtube = require("simple-youtube-api");
global.Youtube = new Youtube(process.env.youtube_token);
//const Discord = require("discord.js");
const WebhookLogger = new Discord.WebhookClient({ url: "https://discord.com/api/webhooks/887472531001446401/gHIHIGs7wuiVEJQKlT0iUZDHpIJ4dzWqjKvllMWqThxr0LPZX2zcyoaEpGv96UtZ-H3L" });

const Client = new Discord.Client({
	intents         : [ "GUILDS", "GUILD_MESSAGES", "GUILD_MEMBERS", "GUILD_MESSAGE_REACTIONS", "GUILD_VOICE_STATES" ],
	allowedMentions : { repliedUser: false }
});

const util = require("util");
const fs = require("fs");
const { StopWatch } = require("stopwatch-node");
const sw = new StopWatch("CM");
const Class = require("../Classes/ClassLoader");

const { join } = require("path");
const file = join("../db.json");
import("lowdb").then(module => {
	const adapter = new module.JSONFile(file);
	global.config = new module.Low(adapter);

	global.configMusic = new module.Low(new module.JSONFile(join("./db.json")));
});

const { generateDependencyReport } = require("@discordjs/voice");

console.log(generateDependencyReport());

// Client.locale = new Class.LocaleManager("./Locales/", "zh_TW");
Client.aliases = new Discord.Collection();
Client.cooldowns = new Discord.Collection();
Client.commands = new Discord.Collection();
Client.music = new Discord.Collection();
Client.colors = {
	info    : "#89cff0",
	success : "#77ff77",
	warn    : "#fdfd96",
	error   : "#ff9691"
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
}, 4000);

const loggers = {
	log : console.log,
	Bot : {
		log: (str) => {
			console.log(chalk.yellowBright("[Bot] ") + str);
			Client.webhookLoggerString.push("🎵 **[Bot]** " + str);
		},
		error: (err) => {
			console.error(chalk.yellowBright("[Bot] ") + err);
			Client.webhookLoggerString.push("🎵 **[Bot]** ❌ " + err);
		}
	},
	CH: {
		log: (str) => {
			console.log(chalk.cyan("[CommandHandler] ") + str);
			Client.webhookLoggerString.push("🎵 **[CommandHandler]** " + str);
		},
		error: (err) => {
			console.error(chalk.cyan("[CommandHandler] ") + err);
			Client.webhookLoggerString.push("🎵 **[CommandHandler]** ❌ " + err);
		}
	},
	CM: {
		log: (str) => {
			console.log(chalk.yellow("[CommandManager] ") + str);
			Client.webhookLoggerString.push("🎵 **[CommandManager]** " + str);
		},
		error: (err) => {
			console.error(chalk.yellow("[CommandManager] ") + err);
			Client.webhookLoggerString.push("🎵 **[CommandManager]** ❌ " + err);
		}
	},
	Shard: {
		log: (str) => {
			console.log(chalk.green("[Shard] ") + str);
			Client.webhookLoggerString.push("🎵 **[Shard]** " + str);
		},
		error: (err) => {
			console.error(chalk.green("[Shard] ") + err);
			Client.webhookLoggerString.push("🎵 **[Shard]** ❌ " + err);
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
fs.readdirSync("./ContextCommands/").forEach(dir => {
	fs.readdir(`./ContextCommands/${dir}`, (err, files) => {
		if (err) throw err;
		const js = files.filter(f => f.split(".").pop() == "js");
		if (js.length < 1) return console.error(new ReferenceError("找不到指令"));

		js.forEach(file => {
			const fileget = require(`./ContextCommands/${dir}/${file}`);
			loggers.CM.log(`已讀取: ${file}`);

			try {
				// if (!fileget.help.name.match(/^[a-z]+/)) throw new RangeError("指令名稱不符合正規表達式: ^[a-z]+");
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
					type              : "MESSAGE",
					defaultPermission : (fileget.help.hasOwnProperty("defaultPermission")) ? fileget.help.defaultPermission : true
				});
			} catch (e) {
				e.stack.split("\n").forEach(v => loggers.CM.error(v));
			}
		});
		Client.sc = sc;
	});
});

process.stdout.write(`${String.fromCharCode(27)}]0;Kami v4 Music${String.fromCharCode(7)}`);
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
	//#region 管理員身分組
	await config.read();
	await configMusic.read();
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
			(await Client.guilds.cache.get(v).commands.set(sc)).forEach(c => {
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
			await Client.guilds.cache.get(v).commands.permissions.set({ fullPermissions: cp });
		}
	});
	sw.stop();
	loggers.CM.log(`耗時 ${sw.getTask("CMLoad").timeMills / 1000}s`);
	//#endregion

	//#region Ready
	loggers.Bot.log(`機器人已就緒: ${Client.user.tag}`);
	Client.init = false;
	//#endregion

	setInterval(async () => {
		await Client.user.setActivity(`🎵 | ${Client.guilds.cache.size}伺服 - ${Client.channels.cache.size}頻道 - ${Client.users.cache.size}用戶`);
	}, 6000);

});
Client.on("error", (e) => {
	loggers.Bot.error(e);
	e.stack.split("\n").forEach(v => loggers.Bot.error(v));
});
//#endregion

//#region Message Handling
Client.on("messageCreate", message => {
	if (Client.init) return;

	if (message.author.bot || message.channel.type == "DM" || !message.channel.permissionsFor(message.guild.me).has("SEND_MESSAGES")) return;
	const prefix = config.data.guild[message.guild.id]?.prefix || "k4!";
	if (message.content.indexOf(prefix) !== 0) return;

	const args = message.content.slice(prefix.length).trim().match(/('.*?'|".*?"|\S+)/g).map(x => x.replace(/"|'/g, ""));
	const command = args.shift().toLowerCase();
	message.args = args;
	CommandHandler(new Class.CommandEvent(command, message.channel, message.member, Client, message));
});

Client.on("interactionCreate", async interaction => {
	if (Client.init) return;
	try {
		if (interaction.isCommand())
			CommandHandler(new Class.CommandEvent(interaction.commandName, interaction.channel, interaction.member, Client, interaction));
		else if (interaction.isContextMenu()) {
			switch (interaction.targetType) {
				case "MESSAGE":
					interaction.target = await interaction.channel.messages.fetch(interaction.targetId, { force: true });
					break;
				case "USER":
					interaction.target = await interaction.guild.members.fetch(interaction.targetId, { force: true });
					break;
			}
			CommandHandler(new Class.CommandEvent(interaction.commandName, interaction.channel, interaction.member, Client, interaction));
		}
	} catch (e) {
		let embed;
		if (e == "DiscordAPIError: Missing Access")
			embed = new Discord.MessageEmbed()
				.setColor(Client.colors.error)
				.setTitle(Client.embedStat.error)
				.setDescription("我沒有權限讀取這個頻道的歷史訊息")
				.setFooter("ERR_MISSING_ACCESS");

		if (!embed) {
			embed = new Discord.MessageEmbed()
				.setColor(Client.colors.error)
				.setTitle(Client.embedStat.error)
				.setDescription(`發生了預料之外的錯誤：\`${e}\``)
				.setFooter("ERR_UNCAUGHT_EXCEPTION");
			loggers.CH.error(chalk.redBright("Context Menu Failed"));
			util.inspect(interaction, false, 1, true).split("\n").forEach(v => loggers.CH.error(v));
			e.stack.split("\n").forEach(v => loggers.CH.error(v));
		}
		interaction.replied
			? await interaction.editReply({ embeds: [embed] })
			: await interaction.reply({ embeds: [embed], allowedMentions: { repliedUser: true }, ephemeral: true });

	}
});

async function CommandHandler(CommandEvent) {
	try {
		const command = Client.commands.get(Client.aliases.get(CommandEvent.command.name) || CommandEvent.command.name);
		if (command) {
			if (command.help.slash && !CommandEvent.isInteraction)
				throw "ERR_SLASH_EXCLUSIVE";

			await CommandEvent.mi.deferReply();
			CommandEvent.mi.replied = true;

			await command.run(CommandEvent);
			if (CommandEvent.mi.type == "CHAT_INPUT") {
				loggers.CH.log(`${CommandEvent.guild.name} 》#${CommandEvent.channel.name} 》${CommandEvent.user.user.tag} \`${CommandEvent.user.user.id}\``);
				loggers.CH.log(`收到指令: /${CommandEvent.command.name} ${CommandEvent.command.options.data.map(v => `\`${v.name}\`:${v.name == "連結" ? "<" : ""}${v.value}${v.name == "連結" ? ">" : ""}`).join(" ")}`);
			}
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
			util.inspect(CommandEvent, false, 1, true).split("\n").forEach(v => loggers.CH.error(v));
			e.stack.split("\n").forEach(v => loggers.CH.error(v));
		}
		await CommandEvent.mi.editReply({ embeds: [embed] }).catch(() => {});
		return;
	}
}
//#endregion

Client.login(process.env.music_bot_token);

Client.on("guildCreate", async guild => {
	loggers.Bot.log(chalk`{greenBright {bold +}} 加入伺服器: ${guild.name} {dim (${guild.id})}`);
	const cp = [];
	(await Client.guilds.cache.get(guild.id).commands.set(sc)).forEach(c => {
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
				config.data.guild[guild.id].adminRoles.forEach(rid => p.push(
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
	await Client.guilds.cache.get(guild.id).commands.permissions.set({ fullPermissions: cp });
});
Client.on("guildDelete", guild => {
	loggers.Bot.log(chalk`{bold {redBright -}} 離開伺服器: ${guild.name} {dim (${guild.id})}`);
});

Client.on("messageReactionAdd", async (messageReaction) => {
	if (messageReaction.message.author.id != Client.user.id || messageReaction.emoji.name != "🗑️") return;
	await messageReaction.message.delete();
});

process.on("beforeExit", code => {
	console.log(`Exit: ${code}`);
});