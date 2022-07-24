module.exports.run = async (CommandEvent) => {
	try {
		if (CommandEvent.isInteraction) return;

		const embed = new Discord.MessageEmbed()
			.setColor(CommandEvent.client.colors.info);

		if (CommandEvent.command.options.length) {
			const commands = CommandEvent.client.commands.map(v => v.help.name);

			if (commands.includes(CommandEvent.command.options[0])) {
				const command = CommandEvent.client.commands.get(CommandEvent.command.options[0]).help;
				embed
					.setTitle(command.name)
					.setDescription(command.desc);
				embed.addField("語法", `${command.slash ? "/" : config.data.guild[CommandEvent.guild.id]?.prefix || "k4!"}${command.name} ${command.options.length ? command.options.map(v => `${v.required ? "" : "["}${v.name}${v.required ? "" : "]"}`).join(" ") : ""}`);
				if (command.options.length) embed.addField("參數", command.options.map(v => `> **${v.name}** ${v.type ? `\`${v.type}\`` : ""} ${v.required ? "" : "__*選擇性*__"}\n${v.description}\n`).join("\n"));
				if (command.exam.length) embed.addField("範例", command.exam.map(v => `${command.slash ? "/" : v.startsWith("/") ? "/" : config.data.guild[CommandEvent.guild.id]?.prefix || "k4!"}${command.name} ${v.startsWith("/") ? v.slice(1) : v}`).join("\n"));

				CommandEvent.mi.isInteraction
					? await CommandEvent.mi.editReply({ embeds: [embed] })
					: await CommandEvent.mi.reply({ embeds: [embed] });
			} else
				console.debug(commands, CommandEvent.command.options);

		} else {
			const commands = {};
			CommandEvent.client.commands.each(v => {
				commands[v.help.category] ||= {};
				commands[v.help.category][v.help.name] = v.help;
			});

			embed
				.setTitle("所有的指令")
				.setDescription(`查看每個指令的詳細功能請使用\`${config.data.guild[CommandEvent.guild.id]?.prefix || "k4!"}help <指令>\``);

			Object.keys(commands).forEach(k => {
				const arrstring = [];
				Object.keys(commands[k]).forEach(cmd => {
					cmd = commands[k][cmd];
					arrstring.push(`${cmd?.slash ? "/" : ""}${cmd.name}`);
				});
				embed.addField(k, `\`\`\`\n${arrstring.join("\n")}\n\`\`\``, true);
			});

			CommandEvent.mi.isInteraction
				? await CommandEvent.mi.editReply({ embeds: [embed] })
				: await CommandEvent.mi.reply({ embeds: [embed] });
		}
	} catch (e) {
		let embed;
		if (e == "ERR_USER_MISSING_PERMISSION")
			embed = new Discord.MessageEmbed()
				.setColor(CommandEvent.client.colors.error)
				.setTitle(CommandEvent.client.embedStat.error)
				.setDescription("你沒有權限這樣做")
				.setFooter(e);

		if (!embed) {
			embed = new Discord.MessageEmbed()
				.setColor(CommandEvent.client.colors.error)
				.setTitle(CommandEvent.client.embedStat.error)
				.setDescription(`發生了預料之外的錯誤：\`${e.toString()}\``)
				.setFooter("ERR_UNCAUGHT_EXCEPTION");
			console.error(e);
		}

		CommandEvent.isInteraction
			? await CommandEvent.mi.editReply({ embeds: [embed], allowedMentions: { repliedUser: true } }).catch(() => {})
			: await CommandEvent.mi.reply({ embeds: [embed], allowedMentions: { repliedUser: true } }).catch(() => {});
		return;
	}
};
module.exports.help = {
	name    : "help",
	desc    : "指令列表",
	options : [],
	args    : [
		{
			name   : "指令",
			type   : "字串",
			desc   : "指定要查看的指令幫助",
			option : true
		}
	],
	exam              : [ "", "ping" ],
	defaultPermission : false,
	slash             : false,
	guild             : true
};