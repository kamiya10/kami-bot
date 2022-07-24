module.exports.run = async (CommandEvent) => {
	try {
		let voiceStatus;
		const voice = [];

		let user = (CommandEvent.isInteraction ? CommandEvent.command.options.getMember("成員") : CommandEvent.mi.mentions.members.first()) || CommandEvent.user;
		if (user.id == CommandEvent.client.user.id)
			return await CommandEvent.mi.reply({ content: "嗯？找我嗎？" });

		CommandEvent.client.guilds.cache.forEach(v => {
			const guildMember = v.members.cache.get(user.id);
			if (guildMember)
				if (guildMember.voice.channelId) {
					voiceStatus = guildMember.voice;
					user = guildMember;
				}
		});

		let instr;
		if (voiceStatus) {
			instr = `在 :loud_sound:\`${voiceStatus.channel.name}\``;
			voice.push(`ID: \`${voiceStatus.sessionId}\``);
			voice.push(`伺服器: \`${voiceStatus.guild}\``);
			voice.push(`頻道: ${voiceStatus.channel}`);
			voice.push(`語音拒聽: ${voiceStatus.deaf ? `${voiceStatus.serverDeaf ? "<:SpeakerServerMuted:878373112499023922>" : "<:SpeakerMuted:878371443346386954>"} \`是` : "<:Speaker:878371473109176353> `否"}\` ${voiceStatus.serverDeaf ? "(伺服器)" : ""}`);
			voice.push(`語音靜音: ${voiceStatus.mute ? `${voiceStatus.serverMute ? "<:MicServerMuted:878373112519999498>" : "<:MicMuted:878371400577056778>"} \`是` : "<:Mic:878371501689143306> `否"}\` ${voiceStatus.serverMute ? "(伺服器)" : ""}`);
			voice.push(`正在直播: ${voiceStatus.streaming ? "<:GoLive:878373732601700392> `是" : "<:NotLive:878376888010145802> `否"}\``);
		} else instr = "未在語音頻道中 (或無法獲取資訊)";
		let sent;
		CommandEvent.isInteraction
			? await CommandEvent.mi.editReply({ content: `${user.username ? user.username : user.user.username} 目前${instr}` })
			: sent = await CommandEvent.mi.reply({ content: `${user.username ? user.username : user.user.username} 目前${instr}` });

		const embed = new Discord.MessageEmbed()
			.setDescription(voice.join("\n"))
			.setColor(user.displayHexColor)
			.setThumbnail(user.displayAvatarURL({ dynamic: true }));
		if (voiceStatus) embed.setAuthor(voiceStatus.guild.name, voiceStatus.guild.iconURL({ dynamic: true }));
		if (voice.length) CommandEvent.isInteraction
			? await CommandEvent.mi.editReply({ content: `${user.username ? user.username : user.user.username} 目前${instr}`, embeds: [embed] })
			: sent = await sent.edit({ content: `${user.username ? user.username : user.user.username} 目前${instr}`, embeds: [embed], allowedMentions: { repliedUser: false } });
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
	name    : "where",
	desc    : "查詢使用者語音活動",
	options : [
		{
			name        : "成員",
			description : "指定成員",
			type        : "USER",
			required    : false
		},
	],
	exam  : [ "", "<@632589168438149120>", "/`成員:`<@632589168438149120>" ],
	guild : false
};