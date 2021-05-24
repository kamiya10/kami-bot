const Discord = require('discord.js');
const functions = require("../../function/loader");

/**
 * 
 * @param {Discord.Message} message 
 * @param {Array} args
 * @param {Discord.Client} client
 * @returns 
 */
async function command(message, args, client) {
    try {
        functions.log.command(message, client, command.prop.name);
        if (message.channel.type == 'dm') {
            const user = message.author;

        } else {
            const guildMember = message.mentions.members.first() || message.guild.members.cache.get(args.find(v => /\d+/.test(v))) || message.member;

        }
    } catch (e) {
        await message.reply(`發生了預料外的錯誤 \`${e.toString()}\``);
        functions.log.error(message, client, command.prop.name, e);
        return console.error(e)
    }
}
command.prop = {
    name: "",
    desc: "",
    args: [''],
    exam: [''],
    guild: true
};
module.exports = command;

/*
{
    name: "歌曲名稱|Spotify ID",
    type: "字串",
    desc: "指定歌曲",
    option: true
},
 */