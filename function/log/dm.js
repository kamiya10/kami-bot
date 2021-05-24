const Discord = require('discord.js');

/**
 * @param {Discord.Message} message 
 * @param {Discord.Client} client 
 */
module.exports = async function (message, client) {
    let attachments = [];
    const channel = client.channels.cache.get("832833436490006569");

    if (message.attachments) {
        message.attachments.forEach(v => {
            attachments.push(v.url);
        })
    };

    const embed = new Discord.MessageEmbed()
        .setAuthor("💬 私訊")
        .setTitle(message.author.tag)
        .setDescription(message.content)
        .setTimestamp()
        .setFooter(`使用者ID ${message.author.id}`, message.author.avatarURL({ dynamic: true }));
    if (attachments.length) embed.addField("附件", attachments.join("/n"));
    channel.send(embed);
}