const Discord = require('discord.js');
const functions = require("../../function/loader");

/**
 * 
 * @param {Discord.Message} message 
 * @param {Array} args
 * @param {Discord.Client} client
 * @returns 
 */
async function delmsg(message, args, client) {
    try {
        functions.log.command(message, client, delmsg.prop.name);
        if (!message.member.permissions.has("MANAGE_MESSAGES"))
            return await message.reply(`你沒有權限這麼做！`);

        const error = new Discord.MessageEmbed()
            .setColor(client.colors.error)
            .setTitle(client.embedStat.error)

        if (!args.length) {
            error.setDescription("沒有提供數量");
            await message.reply(error);
            return;
        } else {
            if (!Number.isInteger(+args[0])) {
                error.setDescription('數量必須是整數');
                await message.reply(error);
                return;
            } else if (+args[0] > 100) {
                error.setDescription('數量不能大於 `100`');
                await message.reply(error);
                return;
            } else if (+args[0] < 1) {
                error.setDescription('數量不能小於 `0`');
                await message.reply(error);
                return;
            } else {
                await message.delete();
                await message.channel.messages.fetch({ limit: args[0] })
                    .then(async messages => {
                        const msgtodel = messages.filter(m => !m.bot).filter(m => !m.pinned);
                        const botcount = messages.filter(m => m.bot).size;
                        const pincount = messages.filter(m => m.pinned).size;
                        await message.channel.bulkDelete(msgtodel).then(async () => {
                            const embed = new Discord.MessageEmbed()
                                .setColor(client.colors.success)
                                .setTitle(client.embedStat.success)
                                .setDescription(`已成功刪除 \`${msgtodel.size}\` 則訊息 (機器人 \`${botcount}\` 則, 不包含釘選 \`${pincount}\` 則)`);
                            await message.channel.send(embed).then(async m => setTimeout(await m.delete(), 10000))
                            return;
                        });
                    })
                    .catch(console.error);
            }
        }
    } catch (e) {
        await message.reply(`發生了預料外的錯誤 \`${e.toString()}\``);
        functions.log.error(message, client, delmsg.prop.name, e);
        return console.error(e);
    }
}
delmsg.prop = {
    name: "delmsg",
    desc: "大量刪除訊息",
    args: [
        {
            name: "數量",
            type: "數字",
            desc: "要刪除的訊息數量",
            option: false
        }
    ],
    exam: [''],
    guild: true
};
module.exports = delmsg;