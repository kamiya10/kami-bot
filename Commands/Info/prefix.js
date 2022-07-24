module.exports.run = async (CommandEvent) => {
	try {
		const new_prefix = CommandEvent.isInteraction ? CommandEvent.command.options.getString("新前綴") : CommandEvent.command.options[0];

		const prefix = new Discord.MessageEmbed();

		if (new_prefix) {
			if (!CommandEvent.user.permissions.has("ADMINISTRATOR") && !CommandEvent.user.isBotOwner)
				throw "ERR_USER_MISSING_PERMISSION";

			config.data.guild[CommandEvent.guild.id].prefix = new_prefix;
			await config.write();
			prefix
				.setColor(CommandEvent.client.colors.success)
				.setDescription(`已將這個伺服器的指令前綴設為 \`${new_prefix}\``);
		} else
			prefix
				.setColor(CommandEvent.client.colors.info)
				.setDescription(`這個伺服器的指令前綴為 \`${config.data.guild[CommandEvent.guild.id]?.prefix || "k4!"}\``);

		CommandEvent.isInteraction
			? await CommandEvent.mi.editReply({ embeds: [prefix] })
			: await CommandEvent.mi.reply({ embeds: [prefix] });
		return;
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
	name : "prefix",
	desc : "查看這個伺服器的指令前綴",
	args : [
		{
			name   : "新前綴",
			type   : "字串",
			desc   : "設定指令前綴",
			option : true
		}
	],
	options: [
		{
			name        : "新前綴",
			description : "（管理員）設定指令前綴",
			type        : "STRING",
			required    : false
		}
	],
	defaultPermission : false,
	exam              : [ "", "/`新前綴:`k!" ],
	guild             : true
};