const Discord = require("discord.js");
const functions = require("../../function/loader");

async function avatar(message, args, client) {

	try {
		functions.log.command(message, client, avatar.prop.name);
		if (message.channel.type == "dm") {
			const guildMember = message.author;
			const url = guildMember.displayAvatarURL();
			const avatar = new Discord.MessageEmbed()
				.setColor("#ffa0b4") //#ffcdbf
				.setDescription(`[WEBP](${url.replace(".webp", ".webp?size=4096")}) | [PNG](${url.replace(".webp", ".png?size=4096")}) | [JPG](${url.replace(".webp", ".jpg?size=4096")}) | [GIF](${url.replace(".webp", ".gif?size=4096")})`)
				.setImage(guildMember.displayAvatarURL({ dynamic: true, size: 256 }))
				.setTitle("你的頭貼");

			await message.reply(avatar, { embed: avatar, allowedMentions: { repliedUser: false } });
			return;
		} else {
			const guildMember = message.mentions.members.first() || message.guild.members.cache.get(args.find(v => /\d+/.test(v))) || message.member;
			const url = guildMember.user.displayAvatarURL();
			const avatar = new Discord.MessageEmbed()
				.setColor(guildMember.displayHexColor) //#ffcdbf
				.setDescription(`[WEBP](${url.replace(".webp", ".webp?size=4096")}) | [PNG](${url.replace(".webp", ".png?size=4096")}) | [JPG](${url.replace(".webp", ".jpg?size=4096")}) | [GIF](${url.replace(".webp", ".gif?size=4096")})`)
				.setImage(guildMember.user.displayAvatarURL({ dynamic: true, size: 256 }));

			if (guildMember.id == message.author.id)
				avatar.setTitle("你的頭貼");
			else
				avatar.setTitle(guildMember.user.username + "的頭貼", guildMember.user.username);

			await message.reply({ embed: avatar, allowedMentions: { repliedUser: false } });
			return;
		}
	} catch (e) {
		await message.reply(`發生了預料外的錯誤 \`${e.toString()}\``);
		return console.error(e);
	}
}
avatar.prop = {
	name : "avatar",
	desc : "查看使用者頭貼",
	args : [
		{
			name   : "使用者",
			type   : "使用者ID|提及",
			desc   : "指定要查看的使用者",
			option : true
		}
	],
	exam  : [ "", "<@632589168438149120>" ],
	guild : true
};
module.exports = avatar;