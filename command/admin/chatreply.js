const Discord = require('discord.js');
const { Document } = require('mongoose');
const functions = require("../../function/loader");

/**
 * 
 * @param {Discord.Message} message 
 * @param {Array} args
 * @param {Discord.Client} client
 * @param {Document} settings
 * @returns 
 */
async function chatreply(message, args, client, settings) {
    try {
        functions.log.command(message, client, chatreply.prop.name);
        if (!message.member.permissions.has("MANAGE_MESSAGES"))
            return await message.reply(`你沒有權限這麼做！`);

        if (!args.length) {
            const embed = new Discord.MessageEmbed()
                .setColor(client.colors.info)
                .setDescription(`聊天回應目前 **${settings.chatreply ? "已啟用" : "已停用"}**`)
            await message.reply({ embed: embed, allowedMentions: { repliedUser: false } })
        }

        if (args[0] == "on" || args[0] == "off") {

            settings.chatreply = args[0] == "on" ? true : false;
            await settings.save().catch(() => { });
            const embed = new Discord.MessageEmbed()
                .setColor(client.colors.success)
                .setDescription(`**${settings.chatreply ? "已啟用" : "已停用"}** 聊天回應`);
            await message.reply({ embed: embed, allowedMentions: { repliedUser: false } });
        }

    } catch (e) {
        await message.reply(`發生了預料外的錯誤 \`${e.toString()}\``);
        functions.log.error(message, client, chatreply.prop.name, e);
        return console.error(e)
    }
}
chatreply.prop = {
    name: "chatreply",
    desc: "聊天回應設定",
    args: [{
        name: "on|off",
        type: "字串",
        desc: "啟用/停用聊天回應",
        option: true
    },],
    exam: [''],
    guild: true
};
module.exports = chatreply;

/*
{
    name: "歌曲名稱|Spotify ID",
    type: "字串",
    desc: "指定歌曲",
    option: true
},
 */