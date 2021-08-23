const Discord = require("discord.js");
const functions = require("../../function/loader");
const scale = require("scale-number-range");

async function volume(message, args, client) {
	try {
		functions.log.command(message, client, volume.prop.name);
		const voiceChannel = message.member.voice.channel;
		if (!voiceChannel) {
			const embed = new Discord.MessageEmbed()
				.setColor(client.colors.error)
				.setTitle(client.embedStat.error)
				.setDescription("你要在語音頻道裡才能使用這個指令");
			await message.reply(embed);
			return;
		}

		if (typeof message.guild.musicData.songDispatcher == "undefined" || message.guild.musicData.songDispatcher == null) {
			const embed = new Discord.MessageEmbed()
				.setColor(client.colors.error)
				.setTitle(client.embedStat.error)
				.setDescription("沒有歌曲可以跳過");
			await message.reply(embed);
			return;
		} else if (voiceChannel.id !== message.guild.me.voice.channel.id) {
			const embed = new Discord.MessageEmbed()
				.setColor(client.colors.error)
				.setTitle(client.embedStat.error)
				.setDescription("你要和我在同一個語音頻道才能使用這個指令");
			await message.reply(embed);
			return;
		}

		if (args.length) {
			if (+args[0] > 200) {
				const embed = new Discord.MessageEmbed()
					.setColor(client.colors.error)
					.setTitle(client.embedStat.error)
					.setDescription("音量不能超過 `200%` (保護你的耳朵 :D");
				await message.reply(embed);
				return;
			}
			if (+args[0] < 0) {
				const embed = new Discord.MessageEmbed()
					.setColor(client.colors.error)
					.setTitle(client.embedStat.error)
					.setDescription("音量不能小於 `0%`");
				await message.reply(embed);
				return;
			}

			const wantedVolume = +args[0];

			if (Math.abs(((wantedVolume / 100) - message.guild.musicData.volume) / 10) > 0.02) {
				let a = message.guild.musicData.volume; // 現在的音量 (會變動)
				const b = Math.ceil(Math.abs(((a * 100) - wantedVolume) / 5)); // 次數

				const times = Math.abs(Math.round(((1000 * scale(b, 0, 40, 0.1, 2) / b) + Number.EPSILON) * 1000) / 1000) * scale(b, 0, 40, 0.2, 2) / 1.5;

				for (let i = 1; i <= b; i++)
					if (i == b) {
						message.guild.musicData.volume = wantedVolume / 100;
						await message.guild.musicData.songDispatcher.setVolume(message.guild.musicData.volume);
						break;
					} else {
						if (message.guild.musicData.volume < (wantedVolume / 100))
							a += 0.05;
						else
							a -= 0.05;
						a = Math.round((a + Number.EPSILON) * 100) / 100;
						await message.guild.musicData.songDispatcher.setVolume(a);
						await delay(times);
					}

			} else {
				message.guild.musicData.volume = wantedVolume / 100;
				await message.guild.musicData.songDispatcher.setVolume(message.guild.musicData.volume);
			}

			const embed = new Discord.MessageEmbed()
				.setColor(client.colors.success)
				.setTitle(client.embedStat.success)
				.setDescription(`音量已設成 \`${wantedVolume}%\``);
			await message.reply({ embed: embed, allowedMentions: { repliedUser: false } });
		} else {
			const embed = new Discord.MessageEmbed()
				.setColor(client.colors.info)
				.setDescription(`目前音量為 \`${message.guild.musicData.volume * 100}%\``);

			await message.reply({ embed: embed, allowedMentions: { repliedUser: false } });
		}
	} catch (e) {
		await message.reply(`發生了預料外的錯誤 \`${e.toString()}\``);
		functions.log.error(message, client, volume.prop.name, e);
		return console.error(e);
	}
}
volume.prop = {
	name : "volume",
	desc : "音量",
	args : [
		{
			name   : "音量%",
			type   : "數字",
			desc   : "要設定的音量",
			option : true
		},
	],
	exam  : [ "", "10" ],
	guild : true
};
module.exports = volume;

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));