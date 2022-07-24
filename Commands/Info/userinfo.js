const moment = require("moment");
moment.locale("zh-tw");

const Discord = require("discord.js");
module.exports.run = async (CommandEvent) => {
	try {
		/**
         * @type {Discord.GuildMember} guildMember
         */
		const guildMember = (CommandEvent.isInteraction ? CommandEvent.command.options.getMember("成員") : CommandEvent.mi.mentions.members.first()) || CommandEvent.user;
		const isDetailed = (CommandEvent.isInteraction ? CommandEvent.command.options.getBoolean("詳細") : CommandEvent.command.options.includes("-d")) || false;

		await guildMember.user.fetch(true);

		const nickname = [], presence = [], voice = [], roles = [], online = [];
		let boost;
		CommandEvent.client.guilds.cache.forEach(guild => {
			if (guild.members.cache.has(guildMember.id)) {
				const mem = guild.members.cache.get(guildMember.id);
				if (mem.nickname) nickname.push(mem.nickname);
			}
		});
		if (guildMember?.presence?.clientStatus) {
			const clientStatus = guildMember.presence.clientStatus;
			if (clientStatus.desktop) online.push(`桌面版: ${clientStatus.desktop == "online" ? "<:online:832272180544274432> 上線" : clientStatus.desktop == "idle" ? "<:idle:832272472375558184> 閒置" : clientStatus.desktop == "dnd" ? "<:dnd:832272180510982224> 請勿打擾" : ":grey_question: 未知狀態"}`);
			if (clientStatus.mobile) online.push(`手機版: ${clientStatus.mobile == "online" ? "<:mobile:832279180615876658> 上線" : clientStatus.mobile == "idle" ? "<:idle:832272472375558184> 閒置" : clientStatus.mobile == "dnd" ? "<:dnd:832272180510982224> 請勿打擾" : ":grey_question: 未知狀態"}`);
			if (clientStatus.web) online.push(`網頁版: ${clientStatus.web == "online" ? "<:online:832272180544274432> 上線" : clientStatus.web == "idle" ? "<:idle:832272472375558184> 閒置" : clientStatus.web == "dnd" ? "<:dnd:832272180510982224> 請勿打擾" : ":grey_question: 未知狀態"}`);
			if (!online.length) online.push("<:invisible:832272180078706708> 離線");
		} else online.push("<:invisible:832272180078706708> 離線");
		guildMember.roles.cache.forEach(v => roles.push(`${v}`));
		if (!online[0].includes("離線")) roles.push("@here");
		if (guildMember?.presence?.activities?.length)
			guildMember.presence.activities.forEach(v => {
				presence.push(`${v.type == "PLAYING" ? "​　正在玩" : v.type == "STREAMING" ? "正在直播" : v.type == "LISTENING" ? "​　正在聽" : v.type == "WATCHING" ? "​　正在看" : "自定狀態"} ┃ ${v.type == "CUSTOM_STATUS" ? v.emoji ? v.emoji : "" : ""} ${v.type == "CUSTOM_STATUS" ? v.state ? `**${v.state}**` : "" : `**${v.name}**`} ${v.type == "CUSTOM_STATUS" ? "" : v.assets ? v.assets.largeText ? `| ${v.assets.largeText}` : "" : ""}${v.type == "CUSTOM_STATUS" ? "" : v.details ? "\n　　　　 ┃ " + v.details : ""}${v.type == "CUSTOM_STATUS" ? "" : v.state ? "\n　　　　 ┃ " + v.state : ""}${v.type == "CUSTOM_STATUS" ? "" : v.timestamps ? "\n　　　　 ┃ " + (v.type == "CUSTOM_STATUS" ? "" : v.timestamps ? v.timestamps.end ? "" : "經過時間 " : "") + Math.round((new Date() - v.timestamps.start) / 1000).toString().toHHMMSS() : ""}${v.type == "CUSTOM_STATUS" ? "" : v.timestamps ? v.timestamps.end ? " / " + Math.round((v.timestamps.end - v.timestamps.start) / 1000).toString().toHHMMSS() : "" : ""}`);
			});
		else presence.push("`無狀態可顯示`");
		if (guildMember?.voice?.channelId) {
			const voiceStatus = guildMember.voice;
			voice.push(`ID: \`${voiceStatus.sessionId}\``);
			voice.push(`頻道: ${voiceStatus.channel}`);
			voice.push(`語音拒聽: ${voiceStatus.deaf ? `${voiceStatus.serverDeaf ? "<:MicServerMuted:878373112519999498>" : "<:SpeakerMuted:878371443346386954>"} \`是` : "<:Speaker:878371473109176353> `否"}\` ${voiceStatus.serverDeaf ? "(伺服器)" : ""}`);
			voice.push(`語音靜音: ${voiceStatus.mute ? `${voiceStatus.serverMute ? "<:SpeakerServerMuted:878373112499023922>" : "<:MicMuted:878371400577056778>"} \`是` : "<:Mic:878371501689143306> `否"}\` ${voiceStatus.serverMute ? "(伺服器)" : ""}`);
			voice.push(`正在直播: <:GoLive:878373732601700392> \`${voiceStatus.streaming ? "是" : "否"}\``);
		} else voice.push("`未在語音頻道中`");
		if (guildMember.premiumSinceTimestamp)
			boost = "自從 " + moment(guildMember.premiumSinceTimestamp).format("llll:ss");
		else boost = "`無`";

		const final = new Discord.MessageEmbed()
			.setColor(guildMember.displayHexColor) //#ffcdbf
			.setAuthor(CommandEvent.guild.name, CommandEvent.guild.iconURL())
			.setTitle(guildMember.user.tag)
		// .addField(`聊天等級 (${system})`, `**${level.level} 等** (排名 #${level.rank})\n**${level.xp.userXp}** / ${level.xp.levelXp} (還差 ${level.xp.levelXp - level.xp.userXp})\n**${level.messageCount}** 訊息`, true)
			.setThumbnail(guildMember.displayAvatarURL({ dynamic: true, size: 4096 }));

		if (nickname.length)
			final.setDescription(`又稱為: ${nickname.join(", ")}`);

		if (isDetailed)
			final
				.setTitle(guildMember.user.tag + " 的詳細資料")
				.addField("上線狀態", online.join("\n"), true)
				.addField("伺服器加成", boost, true)
				.addField("使用者ID", `\`${guildMember.id}\``)
				.addField("語音狀態", voice.join("\n"))
				.addField("遊戲狀態", presence.join("\n"))
				.addField("身分組", roles.join(", "));

		final
			.addField(`加入 ${guildMember.guild.name}`, `${moment(guildMember.joinedTimestamp).format("llll:ss")}\n${moment(guildMember.joinedTimestamp).fromNow()}`)
			.addField("加入 Discord", `${moment(guildMember.user.createdTimestamp).format("llll:ss")}\n${moment(guildMember.user.createdTimestamp).fromNow()}`)
			.setImage(guildMember.user.bannerURL({ dynamic: true, size: 4096 }));

		CommandEvent.isInteraction
			? await CommandEvent.mi.editReply({ embeds: [final] })
			: await CommandEvent.mi.reply({ embeds: [final] });
		return;
	} catch (e) {
		let embed;
		if (!embed) {
			embed = new Discord.MessageEmbed()
				.setColor(CommandEvent.client.colors.error)
				.setTitle(CommandEvent.client.embedStat.error)
				.setDescription(`發生了預料之外的錯誤：\`${e.toString()}\``)
				.setFooter("ERR_UNCAUGHT_EXCEPTION");
			console.error(e);
		}

		CommandEvent.isInteraction
			? await CommandEvent.mi.editReply({ embeds: [embed], allowedMentions: { repliedUser: true } }).catch(() => {})
			: await CommandEvent.mi.reply({ embeds: [embed], allowedMentions: { repliedUser: true } }).catch(() => {});
		return;
	}
};

module.exports.help = {
	name    : "userinfo",
	desc    : "顯示成員資訊",
	aliases : [ "ui", "info" ],
	options : [
		{
			name        : "成員",
			description : "指定成員",
			type        : "USER",
			required    : false
		},
		{
			name        : "詳細",
			description : "詳細顯示",
			type        : "BOOLEAN",
			required    : false
		}
	],
	exam: [ "", "<@707186246207930398>", "-d", "/`成員:`<@707186246207930398> `詳細:`True" ]
};

String.prototype.toHHMMSS = function () {
	const sec_num = parseInt(this, 10);
	let hours = Math.floor(sec_num / 3600);
	let minutes = Math.floor((sec_num - (hours * 3600)) / 60);
	let seconds = sec_num - (hours * 3600) - (minutes * 60);
	if (hours < 10 && hours != 0) hours = "0" + hours + "："; else hours = "";
	if (minutes < 10) minutes = "0" + minutes;
	if (seconds < 10) seconds = "0" + seconds;
	return hours + minutes + "：" + seconds;
};