const Discord = require('discord.js');
const mongoose = require('mongoose');
const functions = require("../../function/loader");

/**
 * 
 * @param {Discord.Message} message 
 * @param {Array} args
 * @param {Discord.Client} client
 * @param {mongoose.Document<any, {}} settings
 * @returns 
 */
async function prefix(message, args, client, settings) {
    try {
        functions.log.command(message, client, prefix.prop.name);

        if (!message.member.permissions.has("MANAGE_GUILD"))
            if (message.author.id != "437158166019702805")
                return await message.reply(`你沒有權限這麼做！`);

        if (!args.length) {
            const embed = new Discord.MessageEmbed()
                .setColor(client.colors.info)
                .setDescription(`這個伺服器的指令前綴是 \`${settings.prefix}\``);
            await message.reply({ embed: embed, allowedMentions: { repliedUser: false } });
            return;
        } else {
            settings.prefix = args[0];
            await settings.save().catch(() => { });
            const embed = new Discord.MessageEmbed()
                .setColor(client.colors.success)
                .setTitle(client.embedStat.success)
                .setDescription(`已將指令前綴設為 \`${settings.prefix}\``);
            await message.reply({ embed: embed, allowedMentions: { repliedUser: false } });
            return;
        }
    } catch (e) {
        await message.reply(`發生了預料外的錯誤 \`${e.toString()}\``)
        return console.error(e)
    }
}
prefix.prop = {
    name: "prefix",
    desc: "查看指令前綴",
    args: [
        {
            name: "前綴",
            type: "字串",
            desc: "新的指令前綴",
            option: true
        }
    ],
    exam: ['', '!'],
    guild: true
};
module.exports = prefix;