const Discord = require('discord.js');
const functions = require("../../function/loader");

/**
 * 
 * @param {Discord.Message} message 
 * @param {Array} args
 * @param {Discord.Client} client
 * @returns 
 */
async function bug(message, args, client) {
    try {
        functions.log.command(message, client, bug.prop.name);
        if (!args.length) return;
        const embed = new Discord.MessageEmbed()
            .setColor(message.member.displayHexColor)
            .setAuthor(`${message.author.username} (${message.author.id})`, message.author.displayAvatarURL())
            .setDescription(`頻道ID: ${message.channel.id}\nBug: ${args.join(" ")}`);
        await client.channels.cache.get("839354437700026379").send(embed);
        const reported = new Discord.MessageEmbed()
            .setColor(client.colors.success)
            .setTitle(client.embedStat.success)
            .setDescription("訊息已傳送")
            .addField("訊息", args.join(" "))
            .setTimestamp();
        await message.reply(reported);
        return;
    } catch (e) {
        await message.reply(`發生了預料外的錯誤 \`${e.toString()}\``)
        return console.error(e)
    }
}
bug.prop = {
    name: "bug",
    desc: "回報機器人bug",
    args: [
        {
            name: "訊息",
            type: "字串",
            desc: "要回報的bug訊息",
            option: false
        }
    ],
    exam: [''],
    guild: true
};
module.exports = bug;