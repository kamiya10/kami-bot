const Discord = require('discord.js');
const functions = require("../../function/loader");

/**
 * 
 * @param {Discord.Message} message 
 * @param {Array} args
 * @param {Discord.Client} client
 * @returns 
 */
async function botinfo(message, args, client) {
    try {
        functions.log.command(message, client, botinfo.prop.name)
        const embed = new Discord.MessageEmbed()
            .setColor("#ffa0b4")
            .addField("","discord.js `v13.0.0` (self compiled)")

        if (message.channel.type == 'dm') {
            await message.reply({ embed: embed, allowedMentions: { repliedUser: false } });
        } else {
            embed.addField("指令前綴");
            await message.reply({ embed: embed, allowedMentions: { repliedUser: false } });
        }
    } catch (e) {
        await message.reply(`發生了預料外的錯誤 \`${e.toString()}\``)
        return console.error(e)
    }
}
botinfo.prop = {
    name: "botinfo",
    desc: "顯示機器人資訊",
    args: [''],
    exam: [''],
    guild: false
};
module.exports = command;