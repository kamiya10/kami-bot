const Discord = require("discord.js");
const functions = require("../../function/loader");

async function loop(message, args, client) {
	try {
		functions.log.command(message, client, loop.prop.name);

		if (typeof message.guild.musicData.songDispatcher == "undefined" || message.guild.musicData.songDispatcher == null) {
			const embed = new Discord.MessageEmbed()
				.setColor(client.colors.error)
				.setTitle(client.embedStat.error)
				.setDescription("沒有歌曲可以跳過");
			await message.reply({ embed: embed, allowedMentions: { repliedUser: false } });
			return;
		} else if (message.member.voice.channel.id !== message.guild.me.voice.channel.id) {
			const embed = new Discord.MessageEmbed()
				.setColor(client.colors.error)
				.setTitle(client.embedStat.error)
				.setDescription("你要和我在同一個語音頻道才能使用這個指令");
			await message.reply({ embed: embed, allowedMentions: { repliedUser: false } });
			return;
		} else if (message.guild.musicData.queue.length == 0) {
			const embed = new Discord.MessageEmbed()
				.setColor(client.colors.error)
				.setDescription("目前沒有在放音樂");
			await message.reply({ embed: embed, allowedMentions: { repliedUser: false } });
			return;
		}

		const none = new Discord.MessageEmbed()
			.setColor(client.colors.info)
			.setDescription(":arrow_right: 重複模式: 已關閉");
		const repeat = new Discord.MessageEmbed()
			.setColor(client.colors.info)
			.setDescription(":repeat: 重複模式: 佇列重複");
		const repeatOne = new Discord.MessageEmbed()
			.setColor(client.colors.info)
			.setDescription(":repeat_one: 重複模式: 單首重複");

		if (!args[0]) { // looping between modes
			if (message.guild.musicData.loopingMode == "none") {
				message.guild.musicData.loopingMode = "repeat";
				return message.reply({ embed: repeat, allowedMentions: { repliedUser: false } });
			} else if (message.guild.musicData.loopingMode == "repeat") {
				message.guild.musicData.loopingMode = "repeatOne";
				return message.reply({ embed: repeatOne, allowedMentions: { repliedUser: false } });
			} else if (message.guild.musicData.loopingMode == "repeatOne") {
				message.guild.musicData.loopingMode = "none";
				return message.reply({ embed: none, allowedMentions: { repliedUser: false } });
			}
		} else // specify mode
		if (args[0] == "none") {
			message.guild.musicData.loopingMode = "none";
			return message.reply({ embed: none, allowedMentions: { repliedUser: false } });
		} else if (args[0] == "repeat") {
			message.guild.musicData.loopingMode = "repeat";
			return message.reply({ embed: repeat, allowedMentions: { repliedUser: false } });
		} else if (args[0] == "repeatOne") {
			message.guild.musicData.loopingMode = "repeatOne";
			return message.reply({ embed: repeatOne, allowedMentions: { repliedUser: false } });
		} else {
			const embed = new Discord.MessageEmbed()
				.setColor(client.colors.error)
				.setTitle(client.embedStat.error)
				.setDescription("無效的參數");
			await message.reply(embed);
		}

	} catch (e) {
		await message.reply(`發生了預料外的錯誤 \`${e.toString()}\``);
		functions.log.error(message, client, loop.prop.name, e);
		return console.error(e);
	}
}
loop.prop = {
	name  : "loop",
	desc  : "重複模式",
	args  : [],
	exam  : [""],
	guild : true
};
module.exports = loop;