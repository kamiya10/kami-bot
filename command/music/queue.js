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

        if (message.guild.musicData.queue.length == 0) {
            const embed = new Discord.MessageEmbed()
                .setColor(client.colors.error)
                .setDescription('目前沒有在放音樂');
            await message.reply(embed);
            return;
        }

        const titleArray = [];
        
        message.guild.musicData.queue.slice(0, 10).forEach(obj => {
            titleArray.push(obj.title);
        });
        
        var desc = "";
        for (let i = 0; i < titleArray.length; i++) {
            desc += `${i + 1}. ` + `${titleArray[i]}\n`;
        }

        const queueEmbed = new Discord.MessageEmbed()
            .setColor('#ff7373')
            .setTitle(`播放佇列 - ${message.guild.musicData.queue.length} 首歌`)
            .setDescription(desc);
        await message.reply({ embed: queueEmbed, allowedMentions: { repliedUser: false } });
        return;
    } catch (e) {
        await message.reply(`發生了預料外的錯誤 \`${e.toString()}\``);
        functions.log.error(message, client, skip.prop.name, e);
        return console.error(e)
    }
}
skip.prop = {
    name: "queue",
    desc: "顯示播放佇列",
    args: [],
    exam: [''],
    guild: true
};
module.exports = skip;