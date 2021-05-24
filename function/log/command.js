const Discord = require('discord.js');

/**
 * @param {Discord.Message} message 
 * @param {Discord.Client} client 
 */
module.exports = async function (message, client, command) {
    let attachments = [];
    const channel = client.channels.cache.get("832833488364896307");

    if (message.attachments) {
        message.attachments.forEach(v => {
            attachments.push(v.url);
        })
    };

    const embed = new Discord.MessageEmbed()
        .setAuthor("📝 指令")
        .setTitle(message.author.tag)
        .setDescription(`▶  ${message.guild ?message.guild.name :message.author.tag}\n#️⃣  ${message.channel.name} (${message.channel})\n💬  ${message.content}`)
        .addField("指令", `\`${command}\``)
        .setTimestamp()
        .setFooter(`使用者ID ${message.author.id}`, message.author.avatarURL({ dynamic: true }));
    if (attachments.length) embed.addField("附件", attachments.join("/n"));
    channel.send(embed);
}