const Discord = require("discord.js");
const functions = require("../../function/loader");

async function where(message, args, client) {
	try {
		functions.log.command(message, client, where.prop.name);
		/**
         * @type {Discord.VoiceState} voiceStatus
         */
		let voiceStatus;
		const voice = [];

		let user = message.mentions.users.first() || client.users.cache.get(args.length ? args[0].match(/\d+/) ? args[0].match(/\d+/)[0] : undefined : undefined) || message.author;
		if (user.id == client.user.id) {
			message.reply("嗯？找我嗎？", { allowedMentions: { repliedUser: false } });
			return;
		}
		client.guilds.cache.forEach(v => {
			const guildMember = v.members.cache.get(user.id);
			if (guildMember)
				if (guildMember.voice.channelID) {
					voiceStatus = guildMember.voice;
					user = guildMember;
				}
		});

		if (voiceStatus) {
			voice.push(`在 :loud_sound:\`${voiceStatus.channel.name}\``);
			voice.push(`ID: \`${voiceStatus.sessionID}\``);
			voice.push(`伺服器: \`${voiceStatus.guild}\``);
			voice.push(`頻道: ${voiceStatus.channel}`);
			voice.push(`語音拒聽: \`${voiceStatus.deaf ? "是" : "否"}\` ${voiceStatus.serverDeaf ? "(伺服器)" : ""}`);
			voice.push(`語音靜音: \`${voiceStatus.mute ? "是" : "否"}\` ${voiceStatus.serverMute ? "(伺服器)" : ""}`);
			voice.push(`正在直播: \`${voiceStatus.streaming ? "是" : "否"}\``);
		} else voice.push("未在語音頻道中 (或無法獲取資訊)");

		const sent = await message.reply(`${user.username ? user.username : user.user.username} 目前${voice.shift()}`, { allowedMentions: { repliedUser: false } });

		const embed = new Discord.MessageEmbed()
			.setDescription(voice.join("\n"))
			.setColor(user.displayHexColor)
			.setThumbnail(user.user ? user.user.displayAvatarURL({ dynamic: true }) : user.displayAvatarURL({ dynamic: true }));
		if (voiceStatus) embed.setAuthor(voiceStatus.guild.name, voiceStatus.guild.iconURL({ dynamic: true }));
		if (voice.length)
			await sent.edit(sent.content, { embed: embed });
	} catch (e) {
		await message.reply(`發生了預料外的錯誤 \`${e.toString()}\``);
		return console.error(e);
	}
}
where.prop = {
	name : "where",
	desc : "查詢使用者語音活動",
	args : [
		{
			name   : "使用者",
			type   : "使用者ID|提及",
			desc   : "指定要查看的使用者",
			option : true
		}
	],
	exam  : [ "", "<@632589168438149120>" ],
	guild : false
};
module.exports = where;