const { MessageActionRow, MessageEmbed, MessageSelectMenu } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const cwb_Forecast = new (require("../../API/cwb_forecast"))(process.env.CWB_TOKEN);
function emoji(i, time) {
	try {
		const e = {
			"陰天"          : ["<:cwb_07:986836830899032086>", "<:cwb_07:986836830899032086>"],
			"多雲"          : ["<:cwb_04:987249051437260820>", "<:cwb_04n:986837281123999785>"],
			"多雲時晴"        : ["<:cwb_04:987249051437260820>", "<:cwb_04n:986837281123999785>"],
			"多雲時陰"        : [":cloud:", ":cloud:"],
			"陰時多雲"        : [":cloud:", ":cloud:"],
			"晴時多雲"        : ["<:cwb_02:987252769553539102>", "<:cwb_02n:987252771189301288>"],
			"多雲晴時"        : ["<:cwb_03:987252772892200970>", "<:cwb_03n:987252774473457706>"],
			"多雲時陰陣雨或雷雨"   : ["<:cwb_16:979383845256319047>", "<:cwb_16:979383845256319047>"],
			"陰時多雲陣雨或雷雨"   : ["<:cwb_17:978824219330768916>", "<:cwb_17:978824219330768916>"],
			"陰陣雨或雷雨"      : ["<:cwb_18:978823361427800135>", "<:cwb_18:978823361427800135>"],
			"陰短暫陣雨或雷雨"    : ["<:cwb_18:978823361427800135>", "<:cwb_18:978823361427800135>"],
			"陰時多雲短暫陣雨或雷雨" : ["<:cwb_18:978823361427800135>", "<:cwb_18:978823361427800135>"],
			"多雲午後短暫雷陣雨"   : ["<:cwb_22:991295064447914105>", "<:cwb_22n:991294935913480192>"],
		};

		return e[i][time.includes("晚") ? 1 : 0];
	} catch (error) {
		return undefined;
	}
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName("forecast")
		.setDescription("查詢氣象預報"),
	defer: true,
	/**
     * @param {import("discord.js").CommandInteraction} interaction
     */
	async execute(interaction) {
		const embed = new MessageEmbed()
			.setDescription("請使用下方下拉式選單選取欲查詢天氣地區");
		let county = new MessageSelectMenu()
			.setCustomId("county")
			.setPlaceholder("請選擇縣市")
			.setOptions(
				Object.keys(cwb_Forecast.county_code2).map(k => ({
					label       : k,
					value       : k,
					description : cwb_Forecast.county_code2[k],
				})),
			);
		let town = new MessageSelectMenu()
			.setCustomId("town")
			.setPlaceholder("目前不支援鄉鎮天氣預報查詢")
			.setDisabled(true)
			.addOptions(
				[
					{
						"label" : "請選擇鄉鎮",
						"value" : "null",
					},
				],
			);
		const sent = await interaction.editReply(
			{
				embeds     : [embed],
				components : [
					new MessageActionRow({ components: [county] }),
					new MessageActionRow({ components: [town] }),
				],
			},
		);
		const filter = (i) => i.user.id === interaction.user.id;

		/**
         * @type {import("discord.js").InteractionCollector<SelectMenuInteraction>}
         */
		const collector = sent.createMessageComponentCollector({ filter, time: 5 * 60000 });

		let _county_data, _town_data, _hazards, _hazards_W33, _currentCounty, _currentTown;
		const loading = new MessageEmbed()
			.setDescription("<a:loading:849794359083270144> 正在獲取資料");

		collector.on("collect", async i => {
			switch (i.customId) {
				case "county": {
					_currentCounty = i.values[0];
					await i.deferUpdate();

					county = county.setOptions(
						Object.keys(cwb_Forecast.county_code2).map(k => ({
							label       : k,
							value       : k,
							description : cwb_Forecast.county_code2[k],
							default     : k == _currentCounty,
						})),
					).setDisabled(true);

					town = town
					/*
					.setOptions(
						cwb_Forecast.county_town[_currentCounty][0].map(v => ({
							label       : v,
							value       : v,
							description : _currentCounty,
							default     : v == _currentTown,
						})),
					)
					*/
						.setDisabled(true);

					if (!_county_data || !_hazards)
						await i.editReply(
							{
								embeds     : [loading],
								components : [
									new MessageActionRow({ components: [county] }),
									new MessageActionRow({ components: [town] }),
								],
							},
						);

					if (!_county_data)
						_county_data = (await cwb_Forecast.forecast())?.records;
					if (!_hazards)
						_hazards = (await cwb_Forecast.hazards())?.records;
					_hazards_W33 = await cwb_Forecast._hazards_W33();

					const embeds = [];

					if (_hazards.record.length > 0) {
						const hazard_list = _hazards.record.filter(h => h?.hazardConditions?.hazards?.hazard?.info?.affectedAreas?.location?.filter(e => e.locationName.includes(_currentCounty.slice(0, -1)))?.length > 0);
						if (hazard_list.length > 0)
							embeds.push(...hazard_list.map(e => new MessageEmbed()
								.setColor("RED")
								.setAuthor({
									name    : `${e?.hazardConditions?.hazards?.hazard?.info?.phenomena || e?.datasetInfo?.datasetDescription}${e?.hazardConditions?.hazards?.hazard?.info?.significance}`,
									iconURL : "https://upload.cc/i1/2022/05/26/VuPXhM.png",
								})
								.setDescription(e.contents.content.contentText)));
					}
					if (_hazards_W33.length > 0) {
						const hazards_W33_list = _hazards_W33.filter(e => e.WarnArea.filter(WarnArea => WarnArea.County.includes(_currentCounty.slice(0, -1))).length > 0);
						if (hazards_W33_list.length > 0)
							embeds.push(...hazards_W33_list.map(e => new MessageEmbed()
								.setColor("RED")
								.setAuthor({
									name    : "大雷雨即時訊息",
									iconURL : "https://upload.cc/i1/2022/05/26/VuPXhM.png",
								})
								.setTitle(e.Title)
								.setURL(`https://www.cwb.gov.tw/V8/C/P/Warning/W33_Cell.html?ID=${e.ID}`)
								.setDescription(e.Description + e.Instruction)
								.setImage(`https://www.cwb.gov.tw/Data/warning/w33/${e.ImgFile}`)));
					}

					const forecast_embed = new MessageEmbed()
						.setAuthor({
							name    : "中央氣象局",
							iconURL : "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/ROC_Central_Weather_Bureau.svg/1200px-ROC_Central_Weather_Bureau.svg.png",
							url     : "https://www.cwb.gov.tw/",
						})
						.setTitle(`${_currentCounty} ${_county_data.datasetDescription}`)
						.setURL(`https://www.cwb.gov.tw/V8/C/W/County/County.html?CID=${cwb_Forecast.cid[_currentCounty]}`)
						.setColor("BLUE")
						.setImage(await cwb_Forecast.ecard(_currentCounty))
						.setTimestamp();

					const location = _county_data.location.find(e => e.locationName == _currentCounty);
					location.weatherElement[0].time.forEach((time, index) => {
						const values = {};
						location.weatherElement.forEach(weatherElement => {
							values[weatherElement.elementName] = Object.values(weatherElement.time[index].parameter)[0];
						});

						forecast_embed.addField("▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬", `**${timeperiod(new Date(time.startTime))}** ${timestamp(time.startTime)}`);
						forecast_embed.addField(`${emoji(values.Wx, timeperiod(new Date(time.startTime)))} 天氣`, values.Wx, true);
						forecast_embed.addField(":droplet: 降雨機率", `${values.PoP}%`, true);
						forecast_embed.addField(":thermometer: 氣溫", `${values.MinT}℃ ～ ${values.MaxT}℃`, true);
						forecast_embed.addField(":smiley: 舒適度", values.CI, true);
					});
					embeds.push(forecast_embed);

					county = county.setDisabled(false);
					// town = town.setDisabled(false);

					await i.editReply(
						{
							embeds,
							components: [
								new MessageActionRow({ components: [county] }),
								new MessageActionRow({ components: [town] }),
							],
						},
					);
					break;
				}

				case "town":{
					_currentTown = i.values[0];

					await i.deferUpdate();

					county = county.setDisabled(true);
					town = town.setOptions(
						cwb_Forecast.county_town[_currentCounty][0].map(k => ({
							label       : k,
							value       : k,
							description : _currentCounty,
							default     : k == _currentTown,
						})),
					).setDisabled(true);

					if (!_town_data) {
						await i.editReply(
							{
								embeds     : [loading],
								components : [
									new MessageActionRow({ components: [county] }),
									new MessageActionRow({ components: [town] }),
								],
							},
						);
						_town_data = (await cwb_Forecast.forecast_county(_currentCounty))?.records;
					}

					const embeds = [];

					if (_hazards.record.length > 0) {
						const hazard_list = _hazards.record.filter(h => h.hazardConditions.hazards.hazard.info.affectedAreas.location.filter(e => e.locationName.includes(_currentCounty.slice(0, -1))).length > 0);
						if (hazard_list.length > 0)
							embeds.push(...hazard_list.map(e => new MessageEmbed()
								.setColor("RED")
								.setAuthor({
									name    : `${e.hazardConditions.hazards.hazard.info.phenomena}${e.hazardConditions.hazards.hazard.info.significance}`,
									iconURL : "https://upload.cc/i1/2022/05/26/VuPXhM.png",
								})
								.setDescription(e.contents.content.contentText)));
					}

					const forecast_embed = new MessageEmbed()
						.setAuthor({
							name    : "中央氣象局",
							iconURL : "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/ROC_Central_Weather_Bureau.svg/1200px-ROC_Central_Weather_Bureau.svg.png",
							url     : "https://www.cwb.gov.tw/",
						})
						.setTitle(`${_currentCounty} ${_currentTown} ${_county_data.datasetDescription}`)
						.setURL(`https://www.cwb.gov.tw/V8/C/W/County/County.html?CID=${cwb_Forecast.cid[_currentCounty]}`)
						.setColor("BLUE")
						.setImage(await cwb_Forecast.ecard(_currentCounty))
						.setTimestamp();
					const values = {};
					const location = _town_data.locations[0].location.find(e => e.locationName == _currentTown);
					location.weatherElement.forEach(weatherElement => {
						values[weatherElement.elementName] = weatherElement;
					});

					forecast_embed.addField(`:droplet: ${values.PoP6h.description}`, barChart(values.PoP6h.time, "🟦", "%"), true);
					forecast_embed.addField(`:thermometer: ${values.T.description}`, tempChart(values.T.time, "🟦", "℃", values.AT.time), true);

					embeds.push(forecast_embed);

					county = county.setDisabled(false);
					town = town.setDisabled(false);

					await i.editReply(
						{
							embeds,
							components: [
								new MessageActionRow({ components: [county] }),
								new MessageActionRow({ components: [town] }),
							],
						},
					);
					break;
				}
			}
		});
		return;
	},
};

function timeperiod(time) {
	const now = new Date(Date.now());
	let str = "";
	if (now.getDate() == time.getDate()) {
		str += "今";
		if (time.getHours() == 18)
			str += "晚";
		else str += "日";
	} else str += "明日";

	if (str != "今晚")
		if (time.getHours() == 6 || time.getHours() == 12)
			str += "白天";
		else
			str += "晚上";
	else
		str += "明晨";

	return str;
}

function timestamp(startTime, endTime) {
	let str = "";
	str += `<t:${~~(new Date(startTime).getTime() / 1000)}>`;
	if (endTime)
		str += ` ~ <t:${~~(new Date(endTime).getTime() / 1000)}>`;
	return str;
}

function barChart(data, symbol, measure = "") {
	let str = "```\n";
	for (const e of data) {
		const time = new Date(e.startTime);
		const value = e.elementValue[0].value;
		str += `${time.getMonth()}/${time.getDate()} ${time.getHours() < 10 ? "0" : ""}${time.getHours()}:${time.getMinutes() < 10 ? "0" : ""}${time.getMinutes()} ┃ ${symbol.repeat((value / 10) + (value % 10 > 5 ? 1 : 0))} ${value}${measure}\n`;
	}
	str += "```";
	return str;
}

function tempChart(data, symbol, measure, AT) {
	let str = "```\n";
	for (const e of data) {
		const time = new Date(e.startTime);
		const value = e.elementValue[0].value;
		str += `${time.getMonth()}/${time.getDate()} ${time.getHours() < 10 ? "0" : ""}${time.getHours()}:${time.getMinutes() < 10 ? "0" : ""}${time.getMinutes()} ┃ ${symbol.repeat((value / 4) + (value % 4 > 2 ? 1 : 0))} ${value}${measure} (${AT[data.indexOf(e)]}${measure})\n`;
	}
	str += "```";
	return str;
}