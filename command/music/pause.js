const Discord = require('discord.js');
const functions = require("../../function/loader");

/**
 * 
 * @param {Discord.Message} message 
 * @param {Array} args
 * @param {Discord.Client} client
 * @returns 
 */
async function pause(message, args, client) {
    try {
        functions.log.command(message, client, pause.prop.name);

        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            const embed = new Discord.MessageEmbed()
                .setColor(client.colors.error)
                .setTitle(client.embedStat.error)
                .setDescription('你要在語音頻道裡才能使用這個指令');
            await message.reply(embed);
            return;
        }

        if (message.guild.musicData.queue.length == 0 || typeof message.guild.musicData.songDispatcher == 'undefined' || message.guild.musicData.songDispatcher == null) {
            const embed = new Discord.MessageEmbed()
                .setColor(client.colors.error)
                .setDescription('目前沒有在放音樂');
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

        message.guild.musicData.songDispatcher.pause();
        const embed = new Discord.MessageEmbed()
            .setColor(client.colors.success)
            .setDescription(':pause_button: 已暫停播放');
        await message.reply(embed);
        return;
    } catch (e) {
        await message.reply(`發生了預料外的錯誤 \`${e.toString()}\``);
        functions.log.error(message, client, pause.prop.name, e);
        return console.error(e)
    }
}
pause.prop = {
    name: "pause",
    desc: "暫停播放",
    args: [''],
    exam: [''],
    guild: true
};
module.exports = pause;