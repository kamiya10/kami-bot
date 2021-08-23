const Discord = require("discord.js");
const functions = require("../../function/loader");

async function help(message, args, client, commands, prefix) {
	try {
		functions.log.command(message, client, help.prop.name);
		let commandmatching;
		const command = [];
		const embed = new Discord.MessageEmbed();

		if (args.length) {
			Object.keys(commands).forEach(key => {
				Object.keys(commands[key]).forEach(k => {
					if (!k.startsWith("_"))
						if (commands[key][k].prop.name == args[0].toLowerCase()) commandmatching = commands[key][k].prop;

				});
			});
			if (commandmatching) {
				command.push(commandmatching.desc);
				embed.addField("語法", `${prefix}${commandmatching.name} ${commandmatching.args.length ?commandmatching.args.map(v => `${v.option ?"[" :""}${v.name}${v.option ?"]" :""}`).join(" ") :""}`);
				if (commandmatching.args.length) embed.addField("參數", commandmatching.args.map(v => `> **${v.name}** ${v.type ?`\`${v.type}\`` :""} ${v.option ?"__*選擇性*__" :""}\n${v.desc}\n`));
				embed.addField("範例", commandmatching.exam.map(v => `${prefix}${commandmatching.name} ${v}`));
			} else
				command.push("未知的指令");

		} else
			Object.keys(commands).forEach(key => {
				const cmds = [];
				Object.keys(commands[key]).forEach(k => {
					if (!k.startsWith("_"))
						cmds.push(`${commands[key][k].prop.name}`);

				});
				embed.addField(commands[key]._prop.name, `\`\`\`\n${cmds.join("\n")}\n\`\`\``, true);
			});

		if (command.length) embed.setDescription(command.join("\n")); else embed.setTitle("所有的指令").setDescription(`查看每個指令的詳細功能請使用\`${prefix}help <指令>\``);
		if (commandmatching) embed.setTitle(`指令：${commandmatching.name}`);
		await message.reply({ embed: embed, allowedMentions: { repliedUser: false } });
	} catch (e) {
		await message.reply(`發生了預料外的錯誤 \`${e.toString()}\``);
		return console.error(e);
	}
}
help.prop = {
	name : "help",
	desc : "顯示指令列表",
	args : [
		{
			name   : "指令",
			type   : "字串",
			desc   : "指定要查看的指令幫助",
			option : true
		}
	],
	exam  : [ "", "ping" ],
	guild : false
};
module.exports = help;