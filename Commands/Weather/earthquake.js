const { MessageActionRow, MessageEmbed, MessageSelectMenu } = require("discord.js");
const { SlashCommandBooleanOption, SlashCommandBuilder, SlashCommandChannelOption, SlashCommandIntegerOption, SlashCommandRoleOption, SlashCommandSubcommandBuilder } = require("@discordjs/builders");
const { ChannelType } = require("discord-api-types/v10");
const GuildDatabaseModel = require("../../Model/GuildDatabaseModel");
const formatEarthquake = require("../../Functions/formatEarthquake");
const styles = [
	"精簡",
	"標準",
	"標準（大報告圖）",
	"詳細",
	"詳細（多欄位）",
	"進階",
];

module.exports = {
	data: new SlashCommandBuilder()
		.setName("earthquake")
		.setDescription("查詢地震報告")
		.addSubcommand(new SlashCommandSubcommandBuilder()
			.setName("lookup")
			.setDescription("查看地震報告")
			.addIntegerOption(new SlashCommandIntegerOption()
				.setName("樣式")
				.setDescription("地震報告樣式")
				.addChoices(...[
					{
						name  : "精簡",
						value : 0,
					},
					{
						name  : "標準",
						value : 1,
					},
					{
						name  : "標準（大報告圖）",
						value : 2,
					},
					{
						name  : "詳細",
						value : 3,
					},
					{
						name  : "詳細（多欄位）",
						value : 4,
					},
					{
						name  : "進階",
						value : 5,
					},
				])))
		.addSubcommand(new SlashCommandSubcommandBuilder()
			.setName("report")
			.setDescription("地震報告推播設定")
			.addChannelOption(new SlashCommandChannelOption()
				.setName("頻道")
				.setDescription("要發送地震報告的頻道")
				.addChannelTypes(ChannelType.GuildText, ChannelType.GuildNews))
			.addIntegerOption(new SlashCommandIntegerOption()
				.setName("樣式")
				.setDescription("地震報告樣式")
				.addChoices(...[
					{
						name  : "精簡",
						value : 0,
					},
					{
						name  : "標準",
						value : 1,
					},
					{
						name  : "標準（大報告圖）",
						value : 2,
					},
					{
						name  : "詳細",
						value : 3,
					},
					{
						name  : "詳細（多欄位）",
						value : 4,
					},
					{
						name  : "進階",
						value : 5,
					},
				]))
			.addBooleanOption(new SlashCommandBooleanOption()
				.setName("無編號報告")
				.setDescription("是否推波無編號地震報告")))
		.addSubcommand(new SlashCommandSubcommandBuilder()
			.setName("eew")
			.setDescription("強震即時警報推播設定")
			.addChannelOption(new SlashCommandChannelOption()
				.setName("頻道")
				.setDescription("要發送強震即時警報的頻道"))
			.addRoleOption(new SlashCommandRoleOption()
				.setName("提及")
				.setDescription("發送強震即時警報時提及的身分組"))),

	defer: true,
	/**
     * @param {import("discord.js").CommandInteraction} interaction
     */
	async execute(interaction) {
		try {
			const GuildSetting = (await interaction.client.database.GuildDatabase.findOne({
				where: { id: interaction.guild.id },
			}).catch(() => void 0));

			if (!GuildSetting)
				await interaction.client.database.GuildDatabase.create(
					GuildDatabaseModel(interaction.guild.id),
				);

			const sc = interaction.options.getSubcommand(false) || undefined;
			switch (sc) {
				case "lookup": {
					const style = interaction.options.getInteger("樣式") ?? 5;

					if (!interaction.client.eq.quake_data || !interaction.client.eq.quake_data) {
						await interaction.editReply({ embeds: [new MessageEmbed()
							.setColor("BLUE")
							.setDescription("<a:loading:849794359083270144> 正在初始化資料，請稍後。（約需 `<一分鐘`）")] });
						while (true)
							if (interaction.client.eq.quake_data && interaction.client.eq.quake_data_s)
								break;
					}

					let messagedata = formatEarthquake(interaction.client.eq.quake_data_all[0], style);
					let reports = new MessageSelectMenu()
						.setCustomId("report")
						.setOptions(
							interaction.client.eq.quake_data_all.slice(0, 20).map((v, index) => ({
								label       : `${v.earthquakeNo == 111000 ? "小地區有感地震" : v.earthquakeNo}`,
								value       : `${index}`,
								description : v.reportContent,
								default     : index == 0,
							})),
						);
					messagedata.components.push(new MessageActionRow({ components: [reports] }));

					/**
					 * @type {import("discord.js").Message}
					 */
					const sent = await interaction.editReply(messagedata);
					const filter = (i) => i.user.id === interaction.user.id;

					/**
                 	* @type {import("discord.js").InteractionCollector<SelectMenuInteraction>}
                 	*/
					const collector = sent.createMessageComponentCollector({ filter, time: 5 * 60000 });
					collector.on("collect", async i => {
						reports = reports.setOptions(
							interaction.client.eq.quake_data_all.slice(0, 20).map((v, index) => ({
								label       : `${v.earthquakeNo == 111000 ? "小地區有感地震" : v.earthquakeNo}`,
								value       : `${index}`,
								description : v.reportContent,
								default     : index == i.values[0],
							})),
						);
						messagedata = formatEarthquake(interaction.client.eq.quake_data_all[i.values[0]], style);
						messagedata.components.push(new MessageActionRow({ components: [reports] }));
						await i.update(messagedata);
						return;
					});

					break;
				}

				case "report": {
					if (!interaction.memberPermissions.has("ADMINISTRATOR")) throw { message: "ERR_PERMISSION_DENIED" };
					const channel = interaction.options.getChannel("頻道");
					const style = interaction.options.getInteger("樣式");
					const small = interaction.options.getBoolean("無編號報告");

					let desc = "";
					if (channel) desc += `已將 **${channel}** 設為地震報告推播頻道`; else desc += "已關閉地震報告推播功能";
					if (channel && style != undefined) desc += `，報告樣式為 **${styles[style]}** `;
					if (channel) desc += `且 **${small ? "" : "不"}傳送** 無編號地震報告`;
					desc += "。";

					await interaction.client.database.GuildDatabase.upsert(
						{ id: interaction.guild.id, quake_channel: channel?.id || null, quake_style: style, quake_small: small },
						{ where: { id: interaction.guild.id } },
					);
					const embed = new MessageEmbed()
						.setColor("GREEN")
						.setDescription(desc)
						.setTitle("✅ 成功");

					await interaction.editReply({ embeds: [embed] });
					break;
				}

				case "eew": {
					if (!interaction.memberPermissions.has("ADMINISTRATOR")) throw { message: "ERR_PERMISSION_DENIED" };
					const channel = interaction.options.getChannel("頻道");
					const mention = interaction.options.getRole("提及");

					let desc = "";
					if (channel) desc += `已將 **${channel}** 設為強震即時警報頻道`; else desc += "已關閉強震即時警報功能";
					if (channel && mention != undefined) desc += `，並將在警報發佈時提及 **${mention}**`;
					desc += "。";

					await interaction.client.database.GuildDatabase.upsert(
						{ id: interaction.guild.id, eew_channel: channel?.id || null, eew_mention: mention?.id },
						{ where: { id: interaction.guild.id } },
					);

					const embed = new MessageEmbed()
						.setColor("GREEN")
						.setDescription(desc)
						.setTitle("✅ 成功");

					await interaction.editReply({ embeds: [embed] });
					break;
				}
			}
		} catch (e) {
			const errCase = {
				"ERR_PERMISSION_DENIED": "你沒有權限這麼做",
			}[e.message];

			const embed = new MessageEmbed()
				.setColor("RED")
				.setTitle("❌ 錯誤");

			if (!errCase) {
				embed.setDescription(`發生了預料之外的錯誤：\`${e.message}\``)
					.setFooter({ text: "ERR_UNCAUGHT_EXCEPTION" });
				console.error(e);
			} else
				embed.setDescription(errCase)
					.setFooter({ text: e.message });

			(this.defer)
				? await interaction.editReply({ embeds: [embed], allowedMentions: { repliedUser: true } })
				: await interaction.editReply({ embeds: [embed], allowedMentions: { repliedUser: true } });
			return;
		}
	},
};
