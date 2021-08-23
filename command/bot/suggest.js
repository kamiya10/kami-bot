const Discord = require("discord.js");
const functions = require("../../function/loader");

async function suggest(message, args, client) {
	try {
		functions.log.command(message, client, suggest.prop.name);
		if (!args.length) return;
		const embed = new Discord.MessageEmbed()
			.setColor(message.member.displayHexColor)
			.setAuthor(`${message.author.username} (${message.author.id})`, message.author.displayAvatarURL())
			.setDescription(`頻道ID: ${message.channel.id}\n建議: ${args.join(" ")}`);
		await client.channels.cache.get("839354478746271805").send(embed);
		const reported = new Discord.MessageEmbed()
			.setColor(client.colors.success)
			.setTitle(client.embedStat.success)
			.setDescription("訊息已傳送")
			.addField("訊息", args.join(" "))
			.setTimestamp();
		await message.reply(reported);
		return;
	} catch (e) {
		await message.reply(`發生了預料外的錯誤 \`${e.toString()}\``);
		return console.error(e);
	}
}
suggest.prop = {
	name : "suggest",
	desc : "提供機器人建議",
	args : [
		{
			name   : "訊息",
			type   : "字串",
			desc   : "要建議的訊息",
			option : false
		}
	],
	exam  : [""],
	guild : true
};
module.exports = suggest;