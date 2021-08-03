const Discord = require('discord.js');
const functions = require("../../function/loader");

/**
 * 
 * @param {Discord.Message} msg 
 * @param {Array} args
 * @param {Discord.Client} client
 * @returns 
 */
async function message(msg, args, client) {
    try {
        functions.log.command(msg, client, message.prop.name);
        if (msg.mentions.members.size) {
            const member = msg.mentions.members.first();
            const embed = new Discord.MessageEmbed()
                .setColor(client.colors.info)
                .setAuthor(msg.author.tag, msg.author.displayAvatarURL({ dynamic: true }))
                .setTitle(`#${msg.channel.name}`)
                .setURL(`https://discord.com/channels/${msg.guild.id}/${msg.channel.id}`)
                .setDescription(args.slice(1).join(" "))
                .addField("動作", `[\`跳到訊息\`](https://discord.com/channels/${msg.guild.id}/${msg.channel.id}/${msg.id})`)
                .setFooter(`這是一則由 ${msg.member.displayName} 從 ${msg.guild.name} 發出的訊息`, msg.guild.iconURL({ dynamic: true }))
                .setTimestamp();

            await msg.delete();
            await member.send(embed)
                .catch(async e => {
                    const error = new Discord.MessageEmbed()
                        .setColor(client.colors.error)
                        .setDescription(`無法傳送訊息: ${e.toString()}`);
                    const sent = await msg.reply(error)
                        .then(async () => {
                            client.setTimeout(async () => {
                                await sent.delete();
                            }, 5000)
                        })
                })
            return;
        }
        return;
    } catch (e) {
        await msg.reply(`發生了預料外的錯誤 \`${e.toString()}\``);
        functions.log.error(msg, client, msg.prop.name, e);
        return console.error(e)
    }
}
message.prop = {
    name: "message",
    desc: "傳送私人訊息",
    args: [
        {
            name: "成員",
            type: "@提及",
            desc: "指定成員",
            option: false
        },
        {
            name: "訊息",
            type: "字串",
            desc: "訊息內容",
            option: false
        }],
    exam: [''],
    guild: true
};
module.exports = message;

/*
{
    name: "歌曲名稱|Spotify ID",
    type: "字串",
    desc: "指定歌曲",
    option: true
},
 */