const Discord = require('discord.js');
const functions = require("../../function/loader");

/**
 * 
 * @param {Discord.Message} message 
 * @param {Array} args
 * @param {Discord.Client} client
 * @returns 
 */
async function volume(message, args, client) {
    try {
        functions.log.command(message, client, volume.prop.name);
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            const embed = new Discord.MessageEmbed()
                .setColor(client.colors.error)
                .setTitle(client.embedStat.error)
                .setDescription('你要在語音頻道裡才能使用這個指令');
            await message.reply(embed);
            return;
        }

        if (typeof message.guild.musicData.songDispatcher == 'undefined' || message.guild.musicData.songDispatcher == null) {
            const embed = new Discord.MessageEmbed()
                .setColor(client.colors.error)
                .setTitle(client.embedStat.error)
                .setDescription('沒有歌曲可以跳過');
            await message.reply(embed);
            return;
        } else if (voiceChannel.id !== message.guild.me.voice.channel.id) {
            const embed = new Discord.MessageEmbed()
                .setColor(client.colors.error)
                .setTitle(client.embedStat.error)
                .setDescription('你要和我在同一個語音頻道才能使用這個指令');
            await message.reply(embed);
            return;
        }

        if (args.length) {
            if (+args[0] > 200) {
                const embed = new Discord.MessageEmbed()
                    .setColor(client.colors.error)
                    .setTitle(client.embedStat.error)
                    .setDescription('音量不能超過 `200%` (保護你的耳朵 :D');
                await message.reply(embed);
                return;
            }
            if (+args[0] < 0) {
                const embed = new Discord.MessageEmbed()
                    .setColor(client.colors.error)
                    .setTitle(client.embedStat.error)
                    .setDescription('音量不能小於 `0%`');
                await message.reply(embed);
                return;
            }
            const wantedVolume = +args[0];
            message.guild.musicData.volume = wantedVolume / 100;
            message.guild.musicData.songDispatcher.setVolume(message.guild.musicData.volume);
            const embed = new Discord.MessageEmbed()
                .setColor(client.colors.success)
                .setTitle(client.embedStat.success)
                .setDescription(`音量已設成 \`${wantedVolume}%\``);
            message.reply({ embed: embed, allowedMentions: { repliedUser: false } })
        } else {
            const embed = new Discord.MessageEmbed()
                .setColor(client.colors.info)
                .setDescription(`目前音量為 \`${message.guild.musicData.volume *100}%\``);

                message.reply({ embed: embed, allowedMentions: { repliedUser: false } })
        }
    } catch (e) {
        await message.reply(`發生了預料外的錯誤 \`${e.toString()}\``);
        functions.log.error(message, client, volume.prop.name, e);
        return console.error(e)
    }
}
volume.prop = {
    name: "volume",
    desc: "音量",
    args: [
        {
            name: "音量%",
            type: "數字",
            desc: "要設定的音量",
            option: true
        },
    ],
    exam: ['', '10'],
    guild: true
};
module.exports = volume;