const Discord = require('discord.js');

/**
 * @param {Discord.Message} message 
 * @param {Discord.Client} client 
 * @param {Error} error
 */
module.exports = async function (message, client, command, error) {
    let attachments = [];
    const channel = client.channels.cache.get("841205815229939722");

    const embed = new Discord.MessageEmbed()
        .setColor(client.colors.error)
        .setAuthor("❌ 錯誤")
        .setTitle(message.author.tag)
        .setDescription(`▶  ${message.guild ?message.guild.name :message.author.tag}\n#️⃣  ${message.channel.name} (${message.channel})\n💬  ${message.content}`)
        .addField("指令", `\`${command}\``)
        .addField("錯誤", error.stack)
        .setTimestamp()
        .setFooter(`使用者ID ${message.author.id}`, message.author.avatarURL({ dynamic: true }));
    if (attachments.length) embed.addField("附件", attachments.join("/n"));
    channel.send(embed);
}