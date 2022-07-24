/* eslint-disable no-irregular-whitespace */
module.exports.run = async (CommandEvent) => {
	try {
		if (!CommandEvent.user.permissions.has("ADMINISTRATOR") && !CommandEvent.user.isBotOwner)
			throw "ERR_USER_MISSING_PERMISSION";

		const stats = CommandEvent.command.options.getBoolean("狀態");
		const action = CommandEvent.command.options.getString("動作");

		const scamdetect = new Discord.MessageEmbed();

		if (stats != null) {
			if (stats) {
				config.data.guild[CommandEvent.guild.id].scamdetect ||= {};
				config.data.guild[CommandEvent.guild.id].scamdetect.enabled = true;
				await config.write();
			} else {
				config.data.guild[CommandEvent.guild.id].scamdetect ||= {};
				config.data.guild[CommandEvent.guild.id].scamdetect.enabled = false;
				await config.write();
			}

			scamdetect
				.setColor(CommandEvent.client.colors.success)
				.setTitle(CommandEvent.client.embedStat.success)
				.setDescription(`**${stats ? "已啟用" : "已停用"}** 這個伺服器的詐騙訊息偵測`);

		} else if (typeof action == "string") {
			if (action == "kick" || action == "ban" || action == "delete") {
				config.data.guild[CommandEvent.guild.id].scamdetect ||= {};
				config.data.guild[CommandEvent.guild.id].scamdetect.action = action;
				await config.write();

				scamdetect
					.setColor(CommandEvent.client.colors.success)
					.setTitle(CommandEvent.client.embedStat.success)
					.setDescription(`已將這個伺服器的詐騙訊息偵測動作設為 **${action == "kick" ? "踢出刪除" : action == "ban" ? "停權刪除" : "僅刪除"}** `);
			}
		} else
			scamdetect
				.setColor(CommandEvent.client.colors.info)
				.setDescription(`這個伺服器的詐騙訊息偵測 **${config.data.guild[CommandEvent.guild.id]?.slashcommand ? "已啟用" : "已停用"}**\n　　　　　　詐騙訊息動作 **${action == "kick" ? "踢出刪除" : action == "ban" ? "停權刪除" : "僅刪除"}**`);

		await CommandEvent.mi.editReply({ embeds: [scamdetect] });
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

		await CommandEvent.mi.editReply({ embeds: [embed], allowedMentions: { repliedUser: true } });
		return;
	}
};
module.exports.help = {
	name    : "scamdetect",
	desc    : "詐騙訊息偵測",
	options : [
		{
			name        : "狀態",
			description : "開啟或關閉詐騙訊息偵測",
			type        : "BOOLEAN",
			required    : false
		},
		{
			name        : "動作",
			description : "偵測到詐騙訊息的處理方式",
			type        : "STRING",
			required    : false,
			choices     : [
				{
					name  : "僅刪除",
					value : "delete"
				},
				{
					name  : "踢出成員",
					value : "kick"
				},
				{
					name  : "停權成員",
					value : "ban"
				}
			]
		}
	],
	defaultPermission : false,
	slash             : true,
	exam              : [ "", "`狀態:`True `動作:`踢出成員", "`狀態:`False" ],
	guild             : true
};