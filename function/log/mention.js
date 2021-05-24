const Discord = require('discord.js');

/**
 * @param {Discord.Message} message 
 * @param {Discord.Client} client 
 */
module.exports = async function (message, client) {
    let attachments = [];
    const channel = client.channels.cache.get("832833459789365259");

    if (message.attachments) {
        message.attachments.forEach(v => {
            attachments.push(v.url);
        })
    };

    const embed = new Discord.MessageEmbed()
        .setAuthor("＠ 提及")
        .setTitle(message.guild ?message.guild.name :message.author.tag)
        .setDescription(`#️⃣ ${message.channel}\n${message.content}`)
        .setTimestamp()
        .setFooter(`${message.author.tag} (${message.author.id})`, message.author.avatarURL({ dynamic: true }));
    if (attachments.length) embed.addField("附件", attachments.join("/n"));
    channel.send(embed);
}