const Discord = require('discord.js');
const functions = require("../../function/loader");

/**
 * 
 * @param {Discord.Message} message 
 * @param {Array} args
 * @param {Discord.Client} client
 * @returns 
 */
async function skip(message, args, client) {
    try {
        functions.log.command(message, client, skip.prop.name);

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

        if (!args.length) {
            await message.guild.musicData.songDispatcher.end();
            return;
        } else {
            if (args[0] == "-all") {
                message.guild.musicData.queue.length = 0;
                await message.guild.musicData.songDispatcher.end();
                console.log(message.guild.musicData)
                return;
            }
            return;
        }
    } catch (e) {
        await message.reply(`發生了預料外的錯誤 \`${e.toString()}\``);
        functions.log.error(message, client, skip.prop.name, e);
        return console.error(e)
    }
}
skip.prop = {
    name: "skip",
    desc: "跳過歌曲",
    args: [
        {
            name: "-all",
            type: "",
            desc: "所有歌曲",
            option: true
        }
    ],
    exam: ['', '-all'],
    guild: true
};
module.exports = skip;