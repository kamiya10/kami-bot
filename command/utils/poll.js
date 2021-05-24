const Discord = require('discord.js');
const functions = require("../../function/loader");

// properties

/**
 * 
 * @param {Discord.Message} message 
 * @param {Array} args
 * @returns 
 */
async function poll(message, args, client) {

    try {
        functions.log.command(message, client, poll.prop.name)
        if (args.length == 0) {
            const errne = new Discord.MessageEmbed()
                .setColor('#ff0000')
                .setTitle(':x: 無法執行動作')
                .setDescription('你沒有提供問題')
                .setTimestamp()
                .setFooter('NekoKamiya#0120');
            await message.channel.send(errne)
        } else if (args.length == 1) {
            const err = new Discord.MessageEmbed()
                .setColor('#ff0000')
                .setTitle(':x: 無法執行動作')
                .setDescription('你沒有提供選項')
                .setTimestamp()
                .setFooter('NekoKamiya#0120');
            await message.channel.send(err)
        } else if (args.length == 2) {
            const errne = new Discord.MessageEmbed()
                .setColor('#ff0000')
                .setTitle(':x: 無法執行動作')
                .setDescription('你提供太少選項了 *至少需要兩個選項*')
                .setTimestamp()
                .setFooter('NekoKamiya#0120');
            await message.channel.send(errne)
        } else {
            const options = [];
            const emoji = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟']
            options.push(`Q: **${args.shift()}**\n`);
            args.forEach((v,i) => options.push(`${emoji[i]} ${v}`))

            const poll = new Discord.MessageEmbed()
                .setColor(message.author.displayHexColor)
                .setDescription(options)
                .addField('發起人', message.author.tag)
                .setTimestamp()
                .setFooter('NekoKamiya#0120');
            const sent = await message.channel.send(poll);
            args.forEach(async (__, i) => await sent.react(emoji[i]))
            return;
        }
    } catch (e) {
        await message.reply(`發生了預料外的錯誤 \`${e.toString()}\``)
        return console.error(e)
    }
}
poll.prop = {
    name: "poll",
    desc: "發起投票",
    args: [
        {
            name: "問題",
            type: "字串",
            desc: "要問的問題",
            option: false
        },
        {
            name: "選項1",
            type: "字串",
            desc: "第 1 個選項",
            option: false
        },
        {
            name: "選項2",
            type: "字串",
            desc: "第 2 個選項",
            option: false
        },
        {
            name: "選項3~10",
            type: "字串",
            desc: "第 3 ~ 10 個選項",
            option: true
        }
    ],
    exam: ['我晚餐該吃什麼 麵 飯'],
    guild: true
};
module.exports = poll;