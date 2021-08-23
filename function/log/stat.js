const Discord = require("discord.js");

/**
 * @param {Discord.Client} client
 * @param {Number} status
 * @param {Number} id
 */
module.exports = async function (client, status, id = undefined) {
    const channel = client.channels.cache.get("832833566241062962");

    const embed = new Discord.MessageEmbed()
        .setAuthor("⚙️ 狀態")
        .setTimestamp();
    if (status == 0)
        embed.setColor(client.colors.success).setDescription("🟢 機器人已上線");
    if (status == 1)
        embed.setColor(client.colors.warn).setDescription("🟡 重新連線");
    if (status == 2)
        embed.setColor(client.colors.error).setDescription("🔴 機器人已斷線");
    if (status == 10)
        embed.setColor(client.colors.success).setDescription(`🟢 Shard #${id} 已上線`);
    if (status == 11)
        embed.setColor(client.colors.warn).setDescription(`🟡 Shard #${id} 重新連線`);
    if (status == 12)
        embed.setColor(client.colors.error).setDescription(`🔴 Shard #${id} 已斷線`);
    await channel.send(embed);
};