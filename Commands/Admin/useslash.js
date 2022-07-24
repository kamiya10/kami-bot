module.exports.run = async (CommandEvent) => {
	try {
		const stats = CommandEvent.isInteraction ? CommandEvent.command.options.getBoolean("狀態") : (CommandEvent.command.options.length) ? CommandEvent.command?.options[0] == "on" ? true : CommandEvent.command?.options[0] == "off" ? false : "invaild" : undefined;

		const useslash = new Discord.MessageEmbed();
		if (typeof stats != "undefined") {
			if (!CommandEvent.user.permissions.has("ADMINISTRATOR") && !CommandEvent.user.isBotOwner)
				throw "ERR_USER_MISSING_PERMISSION";

			if (stats == "invaild")
				throw "ERR_INVAILD_PARAMETER@STATE";

			if (stats) {
				if (stats != config.data.guild[CommandEvent.guild.id].slashcommand) {

					const progress = new Discord.MessageEmbed()
						.setColor(CommandEvent.client.colors.warn)
						.setDescription("正在註冊斜線指令...");

					let progressmsg = CommandEvent.isInteraction
						? await CommandEvent.mi.editReply({ embeds: [progress], fetchReply: true })
						: await CommandEvent.mi.reply({ embeds: [progress] });
					if (!progressmsg) progressmsg = await CommandEvent.mi.fetchReply(true);
					const cp = [];
					(await CommandEvent.guild.commands.set(CommandEvent.client.sc)).forEach(c => {
						if (!c.defaultPermission) {
							const p = [];
							config.data.guild[CommandEvent.guild.id].adminRoles.forEach(rid => p.push({
								id         : rid,
								type       : "ROLE",
								permission : true,
							}));
							cp.push({ id: c.id, permissions: p });
						}
					});
					await CommandEvent.guild.commands.permissions.set({ fullPermissions: cp });
					config.data.guild[CommandEvent.guild.id].slashcommand = true;
					await config.write();

					const success = new Discord.MessageEmbed()
						.setColor(CommandEvent.client.colors.success)
						.setDescription("已成功註冊斜線指令");
					await progressmsg.edit({ embeds: [success] });
				}
			} else {
				await CommandEvent.guild.commands.set([]);
				config.data.guild[CommandEvent.guild.id].slashcommand = false;
				await config.write();
			}
			useslash
				.setColor(CommandEvent.client.colors.success)
				.setTitle(CommandEvent.client.embedStat.success)
				.setDescription(`**${stats ? "已啟用" : "已停用"}** 這個伺服器的斜線指令`);
		} else
			useslash
				.setColor(CommandEvent.client.colors.info)
				.setDescription(`這個伺服器的斜線指令**${config.data.guild[CommandEvent.guild.id]?.slashcommand ? "已啟用" : "已停用"}**`);

		CommandEvent.isInteraction
			? CommandEvent.mi.editReply({ embeds: [useslash] })
			: CommandEvent.mi.reply({ embeds: [useslash] });
		return;
	} catch (e) {
		let embed;
		if (e == "ERR_USER_MISSING_PERMISSION")
			embed = new Discord.MessageEmbed()
				.setColor(CommandEvent.client.colors.error)
				.setTitle(CommandEvent.client.embedStat.error)
				.setDescription("你沒有權限這樣做")
				.setFooter(e);

		if (e == "ERR_INVAILD_PARAMETER@STATE")
			embed = new Discord.MessageEmbed()
				.setColor(CommandEvent.client.colors.error)
				.setTitle(CommandEvent.client.embedStat.error)
				.setDescription("無效的狀態")
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
			? CommandEvent.mi.editReply({ embeds: [embed], allowedMentions: { repliedUser: true } })
			: CommandEvent.mi.reply({ embeds: [embed], allowedMentions: { repliedUser: true } });
		return;
	}
};
module.exports.help = {
	name    : "useslash",
	desc    : "斜線指令",
	options : [
		{
			name        : "狀態",
			description : "開啟或關閉斜線指令",
			type        : "BOOLEAN",
			required    : false
		}
	],
	defaultPermission : false,
	exam              : [ "", "on", "/`狀態:`False" ],
	guild             : true
};