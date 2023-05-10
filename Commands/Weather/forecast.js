/* eslint-disable array-bracket-newline */
/* eslint-disable array-element-newline */
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, ComponentType, EmbedBuilder, SelectMenuBuilder, SlashCommandBuilder, StringSelectMenuBuilder } = require("discord.js");
const cwb_Forecast = new (require("../../API/cwb_forecast"))(process.env.CWB_TOKEN);
const { ChartJSNodeCanvas } = require("chartjs-node-canvas");

const width = 400;
const height = 400;
const backgroundColour = "transparent";
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, backgroundColour });

function emoji(i, time) {
  try {
    const e = {
      陰天          : ["<:cwb_07:986836830899032086>", "<:cwb_07:986836830899032086>"],
      多雲          : ["<:cwb_04:987249051437260820>", "<:cwb_04n:986837281123999785>"],
      多雲時晴        : ["<:cwb_04:987249051437260820>", "<:cwb_04n:986837281123999785>"],
      多雲時陰        : [":cloud:", ":cloud:"],
      陰時多雲        : [":cloud:", ":cloud:"],
      晴時多雲        : ["<:cwb_02:987252769553539102>", "<:cwb_02n:987252771189301288>"],
      多雲晴時        : ["<:cwb_03:987252772892200970>", "<:cwb_03n:987252774473457706>"],
      多雲時陰陣雨或雷雨   : ["<:cwb_16:979383845256319047>", "<:cwb_16:979383845256319047>"],
      陰時多雲陣雨或雷雨   : ["<:cwb_17:978824219330768916>", "<:cwb_17:978824219330768916>"],
      陰陣雨或雷雨      : ["<:cwb_18:978823361427800135>", "<:cwb_18:978823361427800135>"],
      陰短暫陣雨或雷雨    : ["<:cwb_18:978823361427800135>", "<:cwb_18:978823361427800135>"],
      陰時多雲短暫陣雨或雷雨 : ["<:cwb_18:978823361427800135>", "<:cwb_18:978823361427800135>"],
      多雲午後短暫雷陣雨   : ["<:cwb_22:991295064447914105>", "<:cwb_22n:991294935913480192>"],
      陰短暫陣雨       : ["<:cwb_11:1031128863624925234>", "<:cwb_11:1031128863624925234>"],
      多雲短暫陣雨      : ["<:cwb_08:1031129699893645323>", "<:cwb_08:1031129699893645323>"],
      多雲時陰短暫陣雨    : ["<:cwb_08:1031129699893645323>", "<:cwb_08:1031129699893645323>"],
    };

    return e[i][time.includes("晚") ? 1 : 0] ?? ":white_sun_small_cloud:";
  } catch (error) {
    return ":white_sun_small_cloud:";
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("forecast")
    .setDescription("查詢氣象預報"),
  defer     : true,
  ephemeral : false,

  /**
   * @param {import("discord.js").ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setDescription("請使用下方下拉式選單選取欲查詢天氣地區");
    let county = new StringSelectMenuBuilder()
      .setCustomId("county")
      .setPlaceholder("請選擇縣市")
      .setOptions(
        Object.keys(cwb_Forecast.county_code2).map(k => ({
          label       : k,
          value       : k,
          description : cwb_Forecast.county_code2[k],
        })),
      );
    let town = new StringSelectMenuBuilder()
      .setCustomId("town")
      .setPlaceholder("請選擇鄉鎮")
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
      components : [new ActionRowBuilder({ components: [county] }), new ActionRowBuilder({ components: [town] })],
    });
    const filter = (i) => i.user.id === interaction.user.id;

    const collector = sent.createMessageComponentCollector({ filter, time: 5 * 60000, componentType: ComponentType.SelectMenu });

    let _county_data, _town_data, _hazards, _hazards_W33, _currentCounty, _currentTown, _currentTownPage = 0;

    const loading = new EmbedBuilder()
      .setDescription("<a:loading:849794359083270144> 正在獲取資料");

    collector.on("collect", async i => {
      switch (i.customId) {
        case "county": {
          _currentCounty = i.values[0];
          _currentTownPage = 0;
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
            .setOptions(
              cwb_Forecast.county_town[_currentCounty][_currentTownPage].map(v => ({
                label       : v,
                value       : v,
                description : (v == "...") ? (_currentTownPage) ? "上一頁" : "下一頁" : _currentCounty,
              })),
            ).setDisabled(true);

          if (!_county_data || !_hazards)
            await i.editReply({
              embeds     : [loading],
              components : [new ActionRowBuilder({ components: [county] }), new ActionRowBuilder({ components: [town] })],
            });

          if (!_county_data)
            _county_data = (await cwb_Forecast.forecast())?.records;

          if (!_hazards)
            _hazards = (await cwb_Forecast.hazards())?.records;
          _hazards_W33 = await cwb_Forecast._hazards_W33();

          const embeds = [];

          if (_hazards.record.length > 0) {
            const hazard_list = _hazards.record.filter(h => h?.hazardConditions?.hazards?.hazard?.info?.affectedAreas?.location?.filter(e => e.locationName.includes(_currentCounty.slice(0, -1)))?.length > 0);

            if (hazard_list.length > 0)
              embeds.push(...hazard_list.map(e => new EmbedBuilder()
                .setColor(Colors.Red)
                .setAuthor({
                  name    : `${e?.hazardConditions?.hazards?.hazard?.info?.phenomena || e?.datasetInfo?.datasetDescription}${e?.hazardConditions?.hazards?.hazard?.info?.significance}`,
                  iconURL : "https://upload.cc/i1/2022/05/26/VuPXhM.png",
                })
                .setDescription(e.contents.content.contentText)));
          }

          if (_hazards_W33.length > 0) {
            const hazards_W33_list = _hazards_W33.filter(e => e.WarnArea.filter(WarnArea => WarnArea.County.includes(_currentCounty.slice(0, -1))).length > 0);

            if (hazards_W33_list.length > 0)
              embeds.push(...hazards_W33_list.map(e => new EmbedBuilder()
                .setColor(Colors.Red)
                .setAuthor({
                  name    : "大雷雨即時訊息",
                  iconURL : "https://upload.cc/i1/2022/05/26/VuPXhM.png",
                })
                .setTitle(e.Title)
                .setURL(`https://www.cwb.gov.tw/V8/C/P/Warning/W33_Cell.html?ID=${e.ID}`)
                .setDescription(e.Description + e.Instruction)
                .setImage(`https://www.cwb.gov.tw/Data/warning/w33/${e.ImgFile}`)));
          }

          const forecast_embed = new EmbedBuilder()
            .setAuthor({
              name    : "中央氣象局",
              iconURL : "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/ROC_Central_Weather_Bureau.svg/1200px-ROC_Central_Weather_Bureau.svg.png",
              url     : "https://www.cwb.gov.tw/",
            })
            .setTitle(`${_currentCounty} ${_county_data.datasetDescription}`)
            .setURL(`https://www.cwb.gov.tw/V8/C/W/County/County.html?CID=${cwb_Forecast.cid[_currentCounty]}`)
            .setColor(Colors.Blue)
            .setImage(await cwb_Forecast.ecard(_currentCounty))
            .setTimestamp();

          const location = _county_data.location.find(e => e.locationName == _currentCounty);
          location.weatherElement[0].time.forEach((time, index) => {
            const values = {};
            location.weatherElement.forEach(weatherElement => {
              values[weatherElement.elementName] = Object.values(weatherElement.time[index].parameter)[0];
            });

            forecast_embed.addFields(
              ...[
                { name: "▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬", value: `**${timeperiod(new Date(time.startTime))}** ${timestamp(time.startTime)}` },
                { name: `${emoji(values.Wx, timeperiod(new Date(time.startTime)))} 天氣`, value: values.Wx, inline: true },
                { name: ":droplet: 降雨機率", value: `${values.PoP}%`, inline: true },
                { name: ":thermometer: 氣溫", value: `${values.MinT}℃ ～ ${values.MaxT}℃`, inline: true },
                { name: ":smiley: 舒適度", value: values.CI, inline: true },
              ],
            );
          });
          embeds.push(forecast_embed);

          county = county.setDisabled(false);
          town = town.setDisabled(false);

          await i.editReply({
            embeds,
            components: [new ActionRowBuilder({ components: [county] }), new ActionRowBuilder({ components: [town] })],
          });
          break;
        }

        case "town": {
          _currentTown = i.values[0];

          await i.deferUpdate();

          if (_currentTown == "...") {
            if (_currentTownPage)
              _currentTownPage = 0;
            else
              _currentTownPage = 1;

            town = town.setOptions(
              cwb_Forecast.county_town[_currentCounty][_currentTownPage].map(v => ({
                label       : v,
                value       : v,
                description : (v == "...") ? (_currentTownPage) ? "上一頁" : "下一頁" : _currentCounty,
              })),
            );

            await i.editReply({
              embeds     : i.message.embeds,
              components : [new ActionRowBuilder({ components: [county] }), new ActionRowBuilder({ components: [town] })],
            });
            break;
          }

          county = county.setDisabled(true);
          town = town.setOptions(
            cwb_Forecast.county_town[_currentCounty][0].map(v => ({
              label       : v,
              value       : v,
              description : (v == "...") ? (_currentTownPage) ? "上一頁" : "下一頁" : _currentCounty,
              default     : v == _currentTown,
            })),
          ).setDisabled(true);

          if (!_town_data) {
            await i.editReply({
              embeds     : [loading],
              components : [new ActionRowBuilder({ components: [county] }), new ActionRowBuilder({ components: [town] })],
            });
            _town_data = (await cwb_Forecast.forecast_county(_currentCounty))?.records;
          }

          const embeds = [];

          if (_hazards.record.length > 0) {
            const hazard_list = _hazards.record.filter(h => h.hazardConditions?.hazards?.hazard?.info?.affectedAreas?.location?.filter(e => e.locationName.includes(_currentCounty.slice(0, -1))).length > 0);

            if (hazard_list.length > 0)
              embeds.push(...hazard_list.map(e => new EmbedBuilder()
                .setColor(Colors.Red)
                .setAuthor({
                  name    : `${e.hazardConditions.hazards.hazard.info.phenomena}${e.hazardConditions.hazards.hazard.info.significance}`,
                  iconURL : "https://upload.cc/i1/2022/05/26/VuPXhM.png",
                })
                .setDescription(e.contents.content.contentText)));
          }

          const location = _town_data.locations[0].location.find(e => e.locationName == _currentTown);

          const forecast_embed = new EmbedBuilder()
            .setAuthor({
              name    : "中央氣象局",
              iconURL : "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/ROC_Central_Weather_Bureau.svg/1200px-ROC_Central_Weather_Bureau.svg.png",
              url     : "https://www.cwb.gov.tw/",
            })
            .setTitle(`${_currentCounty} ${_currentTown} ${_county_data.datasetDescription}`)
            .setURL(`https://www.cwb.gov.tw/V8/C/W/Town/Town.html?TID=${location.geocode}`)
            .setColor(Colors.Blue)
            .setImage(await cwb_Forecast.ecard(_currentCounty))
            .setTimestamp();

          const elements = new Map(location.weatherElement.map(weatherElement => [weatherElement.elementName, weatherElement]));
          const fields = [];

          for (const key of ["Wx", "T", "AT", "PoP6h", "RH", "CI"]) {

            /**
             * @type {{time: {}[]}}
             */
            const el = elements.get(key);
            const time = (key == "PoP6h")
              ? el.time.reduce((acc, v, index) => (!index && (v.dateTime != elements.get("T").time[0].startTime) ? acc.push(v) : acc.push(v, v)) && acc, [])
              : el.time;

            if (!fields.length)
              for (const t of time)
                fields.push({
                  name  : `${timestamp(t.startTime)} ${emoji(t.elementValue[0].value)} **${t.elementValue[0].value}**`,
                  page  : t.startTime,
                  value : "",
                });

            const numericValues = time.map((v) => +v.elementValue[0].value);

            for (const ti in time) {
              let str = "";

              switch (key) {
                case "Wx": break;
                case "CI":
                  str = `${+time[ti].elementValue[0].value < 16 ? "🥶" : time[ti].elementValue[0].value > 26 ? "🥵" : "😀"} 舒適度　 │ **${time[ti].elementValue[1].value}** \`${time[ti].elementValue[0].value}\``;
                  break;

                default: {
                  const floor = Math.min(...numericValues);
                  const ceil = Math.max(...numericValues);
                  const step = (ceil - floor) / 10;
                  const count = Math.round((numericValues[ti] - floor) / step);
                  str = `${{ T: "🌡", AT: "👕", PoP6h: "☔", RH: "💧" }[key]} ${{ T: "氣溫　　", AT: "體感溫度", PoP6h: "降雨機率", RH: "相對溼度" }[key]} │ ${{ T: "🟧", AT: "🟨", PoP6h: "🟦", RH: "🟪" }[key].repeat(count)} **${time[ti].elementValue[0].value}${{ T: "℃", AT: "℃" }[key] ?? "%"}**`;
                  break;
                }
              }

              fields[ti].value += `${str}\n`;
            }
          }

          const paging = fields.map((v) => new Date(v.page).getDate()).filter((v, index, a) => a.indexOf(v) === index);
          const pages = [];
          const buttons = [];

          for (const date of paging) {
            const page = new EmbedBuilder(forecast_embed.data);

            for (const field of fields)
              if (new Date(field.page).getDate() == date)
                page.addFields(field);

            pages.push(page);

            const time = new Date(fields.find(v => new Date(v.page).getDate() == date).page);
            buttons.push(new ButtonBuilder()
              .setStyle(ButtonStyle.Secondary)
              .setLabel(`${time.getMonth() + 1}/${time.getDate()}`)
              .setCustomId(`forecast-${paging.indexOf(date)}`));
          }

          embeds.push(pages[0]);
          const forecaseembedindex = embeds.indexOf(pages[0]);

          county = county.setDisabled(false);
          town = town.setDisabled(false);

          const s = await i.editReply({
            embeds,
            components: [new ActionRowBuilder({ components: [county] }), new ActionRowBuilder({ components: [town] }), new ActionRowBuilder({ components: buttons })],
          });
          const sc = s.createMessageComponentCollector({ componentType: ComponentType.Button });
          sc.on("collect", inter => {
            const newembeds = inter.message.embeds;
            newembeds.splice(forecaseembedindex, 1, pages[inter.customId.split("-")[1]]);
            inter.update({
              embeds     : newembeds,
              components : [new ActionRowBuilder({ components: [county] }), new ActionRowBuilder({ components: [town] }), new ActionRowBuilder({ components: buttons })],
            });
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