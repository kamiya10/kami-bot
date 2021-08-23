const Discord = require("discord.js");
const functions = require("../../function/loader");

async function leave(message, __args, client) {
	try {
		functions.log.command(message, client, leave.prop.name);
		const voiceChannel = message.member.voice.channel;
		if (!voiceChannel) {
			const embed = new Discord.MessageEmbed()
				.setColor(client.colors.error)
				.setTitle(client.embedStat.error)
				.setDescription("你要在語音頻道裡才能使用這個指令");
			await message.reply(embed);
			return;
		}

		if (voiceChannel.id !== message.guild.me.voice.channel.id) {
			const embed = new Discord.MessageEmbed()
				.setColor(client.colors.error)
				.setTitle(client.embedStat.error)
				.setDescription("你要和我在同一個語音頻道才能使用這個指令");
			await message.reply(embed);
			return;
		} else if (message.guild.musicData.songDispatcher != null)
			if (message.guild.musicData.songDispatcher.paused) {
				message.guild.musicData.songDispatcher.resume();
				setTimeout(() => {
					message.guild.musicData.songDispatcher.end();
				}, 100);
				message.guild.musicData.queue.length = 0;
				voiceChannel.leave();
				return;
			} else {
				message.guild.musicData.songDispatcher.end();
				message.guild.musicData.queue.length = 0;
				voiceChannel.leave();
				return;
			}
		else {
			message.guild.musicData.queue.length = 0;
			voiceChannel.leave();
			return;
		}
	} catch (e) {
		await message.reply(`發生了預料外的錯誤 \`${e.toString()}\``);
		functions.log.error(message, client, leave.prop.name, e);
		return console.error(e);
	}
}
leave.prop = {
	name  : "leave",
	desc  : "離開語音頻道",
	args  : [""],
	exam  : [""],
	guild : true
};
module.exports = leave;