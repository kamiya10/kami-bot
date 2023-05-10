/* eslint-disable array-bracket-newline */
/* eslint-disable array-element-newline */
const { ActionRowBuilder, Colors, ComponentType, EmbedBuilder, SlashCommandBuilder, StringSelectMenuBuilder } = require("discord.js");
const AQI = require("../../API/aqi");
const aqi = new AQI();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("aqi")
    .setDescription("查詢空氣品質"),
  defer     : true,
  ephemeral : false,

  /**
   * @param {import("discord.js").ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setDescription("請使用下方下拉式選單選取欲查詢空氣品質地區");

    let county = new StringSelectMenuBuilder()
      .setCustomId("county")
      .setPlaceholder("請選擇縣市")
      .setOptions(
        Object.keys(aqi.countyNames).map(k => ({
          label       : k,
          value       : k,
          description : aqi.countyNames[k],
        })),
      );
    let site = new StringSelectMenuBuilder()
      .setCustomId("site")
      .setPlaceholder("請選擇測站")
      .setDisabled(true)
      .addOptions(
        [
          {
            label : "請選擇鄉鎮",
            value : "null",
          },
        ],
      );
    const sent = await interaction.editReply({
      embeds     : [embed],
      components : [new ActionRowBuilder({ components: [county] }), new ActionRowBuilder({ components: [site] })],
    });
    const filter = (i) => i.user.id === interaction.user.id;

    const collector = sent.createMessageComponentCollector({ filter, time: 5 * 60000, componentType: ComponentType.StringSelect });

    let _currentCounty, _currentSite;

    const loading = new EmbedBuilder()
      .setDescription("<a:loading:849794359083270144> 正在獲取資料");

    collector.on("collect", async i => {
      switch (i.customId) {
        case "county": {
          _currentCounty = i.values[0];
          console.log("🚀 ~ file: aqi.js:94 ~ execute ~ i.values:", i.values);
          await i.deferUpdate();

          county = county.setOptions(
            Object.keys(aqi.countyNames).map(k => ({
              label       : k,
              value       : k,
              description : aqi.countyNames[k],
              default     : k == _currentCounty,
            })),
          ).setDisabled(true);

          await i.editReply({
            embeds     : [loading],
            components : [new ActionRowBuilder({ components: [county] }), new ActionRowBuilder({ components: [site] })],
          });

          console.log("🚀 ~ file: aqi.js:111 ~ execute ~ aqi.countyNames[_currentCounty]:", aqi.countyNames[_currentCounty]);
          const sites = aqi.sites[aqi.countyNames[_currentCounty]] ?? await aqi.getSiteIds(aqi.countyNames[_currentCounty]);

          site = site
            .setOptions(
              Object.keys(sites).map(k => ({
                label       : k,
                value       : k,
                description : sites[k],
              })),
            ).setDisabled(true);

          const embeds = [
            new EmbedBuilder()
              .setDescription("請使用下方下拉式選單選取欲查詢空氣品質測站"),
          ];

          county = county.setDisabled(false);
          site = site.setDisabled(false);

          await i.editReply({
            embeds,
            components: [new ActionRowBuilder({ components: [county] }), new ActionRowBuilder({ components: [site] })],
          });
          break;
        }

        case "site": {
          _currentSite = i.values[0];

          await i.deferUpdate();

          county = county.setDisabled(true);

          const sites = aqi.sites[aqi.countyNames[_currentCounty]] ?? await aqi.getSiteIds(aqi.countyNames[_currentCounty]);

          site = site.setOptions(
            Object.keys(sites).map(k => ({
              label       : k,
              value       : k,
              description : sites[k],
              default     : k == _currentSite,
            })),
          ).setDisabled(true);

          await i.editReply({
            embeds     : [loading],
            components : [new ActionRowBuilder({ components: [county] }), new ActionRowBuilder({ components: [site] })],
          });

          const data = await aqi.getSiteData(aqi.sites[aqi.countyNames[_currentCounty]][_currentSite]);

          const embeds = [];

          const forecast_embed = new EmbedBuilder()
            .setAuthor({
              name    : "環境保護署",
              iconURL : "https://www.epa.gov.tw/Template/epa/images/epa.png",
              url     : "https://www.epa.gov.tw/",
            })
            .setTitle(`${_currentCounty} ${_currentSite} ${data.date} 空氣品質`)
            .setURL("https://airtw.epa.gov.tw/")
            .setColor([Colors.Green, Colors.Yellow, Colors.Orange, Colors.Red, Colors.Purple, Colors.DarkRed, Colors.DarkButNotBlack, Colors.DarkButNotBlack][AQI.getAQILevel(+data.AQI)])
            .setThumbnail(aqi.getAQIMapImageURL())
            .addFields({
              name  : "**AQI 空氣品質指標**",
              value : `**${["🟢 良好", "🟡 普通", "🟠 對敏感族群不健康", "🔴 對所有族群不健康", "🟣 非常不健康", "🟤 危害", "🟤 危害"][AQI.getAQILevel(data.AQI)]}** ${data.AQI}`,
            }, {
              name  : "PM₂.₅ 細懸浮微粒 (μg/m³)",
              value : `移動平均 **${data.AVPM25}**\n小時濃度 **${data.PM25_FIX}**`,
            }, {
              name  : "PM₁₀ 懸浮微粒 (μg/m³)",
              value : `移動平均 **${data.AVPM10}**\n小時濃度 **${data.PM10_FIX}**`,
            }, {
              name  : "O₃ 臭氧 (ppb)",
              value : `8小時移動平均 **${data.AVO3}**\n小時濃度 **${data.O3_FIX}**`,
            }, {
              name  : "CO 一氧化碳 (ppm)",
              value : `8小時移動平均 **${data.AVCO}**\n小時濃度 **${data.CO_FIX}**`,
            }, {
              name  : "SO₂ 二氧化硫 (ppb)",
              value : `小時濃度 **${data.SO2_FIX}**`,
            }, {
              name  : "NO₂ 二氧化氮 (ppb)",
              value : `小時濃度 **${data.NO2_FIX}**`,
            })
            .setTimestamp();

          embeds.push(forecast_embed);
          county = county.setDisabled(false);
          site = site.setDisabled(false);

          await i.editReply({
            embeds,
            components: [new ActionRowBuilder({ components: [county] }), new ActionRowBuilder({ components: [site] })],
          });
          break;
        }
      }
    });

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
  } else {
    str += "明日";
  }

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