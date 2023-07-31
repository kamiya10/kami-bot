/* eslint-disable array-bracket-newline */
/* eslint-disable array-element-newline */
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, ComponentType, EmbedBuilder, SlashCommandBuilder, StringSelectMenuBuilder, TimestampStyles, time: timestamp } = require("discord.js");
const CWBForecast = require("../../API/cwb_forecast");
const cwb_Forecast = new CWBForecast(process.env.CWB_TOKEN);

function emoji(i, time) {
  try {
    const e = {
      晴           : ["<:cwb_01:1135494700816670721>", "<:cwb_01n:1135494738166939668>"],
      陰           : ["<:cwb_07:986836830899032086>", "<:cwb_07:986836830899032086>"],
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
      短暫陣雨        : ["<:cwb_08:1031129699893645323>", "<:cwb_08:1031129699893645323>"],
      多雲短暫陣雨      : ["<:cwb_08:1031129699893645323>", "<:cwb_08:1031129699893645323>"],
      多雲時陰短暫陣雨    : ["<:cwb_08:1031129699893645323>", "<:cwb_08:1031129699893645323>"],
    };

    return e[i][time.includes("晚") ? 1 : 0] ?? ":white_sun_small_cloud:";
  } catch (error) {
    return ":white_sun_small_cloud:";
  }
}

const WarningIcons = {
  W26: "https://upload.cc/i1/2023/07/31/0IG7ED.png",
};

const WindDirections = {
  偏北風 : "↑",
  東北風 : "↗",
  偏東風 : "→",
  東南風 : "↘",
  偏南風 : "↓",
  西南風 : "↙",
  偏西風 : "←",
  西北風 : "↖",
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("forecast")
    .setNameLocalization("zh-TW", "氣象預報")
    .setDescription("View weather forecast.")
    .setDescriptionLocalization("zh-TW", "查詢氣象預報"),
  defer     : true,
  ephemeral : false,
  global    : true,

  /**
   * @param {import("discord.js").ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { list: warnList, ...warnings } = await cwb_Forecast._warns();
    const now = new Date(Date.now());
    const imageTimestamp = "" + now.getFullYear() + (now.getMonth() + 1).toString().padStart(2, "0") + now.getHours().toString().padStart(2, "2") + "00";
    const embedList = [];

    if (warnList.includes("TY_NEWS"))
      addTyphoonNewsEmbed(embedList);

    if (warnList.includes("TY_WARN"))
      addTyphoonWarnEmbed(embedList, warnings.TY_WARN);

    embedList.push(new EmbedBuilder()
      .setDescription("請使用下方下拉式選單選取欲查詢天氣地區")
      .setImage(`https://www.cwb.gov.tw/Data/upload/WT_L20230528174525_1.png?T=${imageTimestamp}`));

    let county = new StringSelectMenuBuilder()
      .setCustomId("county")
      .setPlaceholder("請選擇縣市")
      .setOptions(
        Object.keys(CWBForecast.county_code2).map(k => ({
          label       : k,
          value       : k,
          description : CWBForecast.county_code2[k],
        })),
      );

    let town = new StringSelectMenuBuilder()
      .setCustomId("town")
      .setPlaceholder("請選擇鄉鎮")
      .setDisabled(true)
      .addOptions({
        label : "請選擇鄉鎮",
        value : "null",
      });

    const sent = await interaction.editReply({
      embeds     : embedList,
      components : [new ActionRowBuilder({ components: [county] }), new ActionRowBuilder({ components: [town] })],
    });

    const collector = sent.createMessageComponentCollector({ time: 5 * 60000, componentType: ComponentType.StringSelect });

    let _county_data, _town_data, _hazards, _currentCounty, _currentTown, _currentTownPage = 0;

    const loading = new EmbedBuilder()
      .setDescription("<a:loading:849794359083270144> 正在獲取資料");

    collector.on("collect", async i => {
      switch (i.customId) {
        case "county": {
          _currentCounty = i.values[0];
          _currentTownPage = 0;
          await i.deferUpdate();

          county = county.setOptions(
            Object.keys(CWBForecast.county_code2).map(k => ({
              label       : k,
              value       : k,
              description : CWBForecast.county_code2[k],
              default     : k == _currentCounty,
            })),
          ).setDisabled(true);

          town = town
            .setOptions(
              CWBForecast.town_pages[_currentCounty][_currentTownPage].map(v => ({
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

          const embeds = [];

          if (warnList.includes("TY_NEWS"))
            addTyphoonNewsEmbed(embeds);

          if (warnList.includes("TY_WARN"))
            addTyphoonWarnEmbed(embeds, warnings.TY_WARN);

          for (const id in warnings)
            if (warnings[id] && !Array.isArray(warnings[id]))
              if (!warnings[id].affectedAreas.length || warnings[id].affectedAreas.includes(_currentCounty)) {
                const warn = new EmbedBuilder()
                  .setColor(warnings[id].title.includes("解除") ? Colors.Green : Colors.Orange)
                  .setAuthor({
                    name    : CWBForecast.warn_id[id],
                    iconURL : warnings[id].title.includes("解除") ? "https://upload.cc/i1/2023/05/24/9q6as4.png" : (WarningIcons[id] ?? "https://upload.cc/i1/2022/05/26/VuPXhM.png"),
                    url     : `https://www.cwb.gov.tw/V8/C/P/Warning/${id}.html`,
                  })
                  .setDescription(`${timestamp(new Date(warnings[id].issued), TimestampStyles.ShortDateTime)} → ${timestamp(new Date(warnings[id].validto), TimestampStyles.ShortDateTime)}\n\n${warnings[id].content}`);
                embeds.push(warn);

                switch (id) {
                  case "TY_WIND":
                  case "TY_WARN":
                  case "TY_NEWS":
                  case "EQ":
                  case "PWS":
                  case "FIFOWS":
                  case "W33":
                  case "W34": {
                    break;
                  }

                  case "W37":{
                    warn.setThumbnail("https://www.cwb.gov.tw/Data/warning/Surge_Swell/Swell_MapTaiwan02.png");
                    break;
                  }

                  default:
                    warn.setThumbnail(`https://www.cwb.gov.tw/Data/warning/${id}_C.png`);
                    break;
                }
              }

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

          if (warnings.W33.length > 0) {
            const hazards_W33_list = warnings.W33.filter(e => e.WarnArea.filter(WarnArea => WarnArea.County.includes(_currentCounty.slice(0, -1))).length > 0);

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
                .setImage(`https://www.cwb.gov.tw/Data/warning/w33/${e.ImgFile}?T=${imageTimestamp}`)));
          }

          const forecast_embed = new EmbedBuilder()
            .setAuthor({
              name    : "中央氣象局",
              iconURL : "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/ROC_Central_Weather_Bureau.svg/1200px-ROC_Central_Weather_Bureau.svg.png",
              url     : "https://www.cwb.gov.tw/",
            })
            .setTitle(`${_currentCounty} ${_county_data.datasetDescription}`)
            .setURL(`https://www.cwb.gov.tw/V8/C/W/County/County.html?CID=${CWBForecast.cid[_currentCounty]}`)
            .setColor(Colors.Blue)
            .setImage(await cwb_Forecast.ecard(_currentCounty))
            .setTimestamp();

          const location = _county_data.location.find(e => e.locationName == _currentCounty);
          location.weatherElement[0].time.forEach((time, index) => {
            const values = {};

            location.weatherElement.forEach(weatherElement => {
              values[weatherElement.elementName] = Object.values(weatherElement.time[index].parameter)[0];
            });

            const lines = [];

            lines.push(`🌡 氣溫　　 │ **${values.MinT}℃ ～ ${values.MaxT}℃**`);
            lines.push(`☔ 降雨機率 │ **${values.PoP}%**`);
            lines.push(`😀 舒適度　 │ **${values.CI}**`);

            // ${+time[ti].elementValue[0].value < 16 ? "🥶" : time[ti].elementValue[0].value > 26 ? "🥵" : "😀"}
            forecast_embed.addFields({
              name  : `${timestamp(new Date(time.startTime), TimestampStyles.ShortDateTime)} __${timeperiod(new Date(time.startTime))}__ ${emoji(values.Wx, timeperiod(new Date(time.startTime)))} ${values.Wx}`,
              value : lines.join("\n") });
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
              CWBForecast.town_pages[_currentCounty][_currentTownPage].map(v => ({
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
            CWBForecast.town_pages[_currentCounty][0].map(v => ({
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

          if (warnList.includes("TY_NEWS"))
            addTyphoonNewsEmbed(embeds);

          if (warnList.includes("TY_WARN"))
            addTyphoonWarnEmbed(embeds, warnings.TY_WARN);

          for (const id in warnings)
            if (warnings[id] && !Array.isArray(warnings[id]))
              if (!warnings[id].affectedAreas.length || warnings[id].affectedAreas.includes(_currentCounty)) {
                const warn = new EmbedBuilder()
                  .setColor(warnings[id].title.includes("解除") ? Colors.Green : Colors.Orange)
                  .setAuthor({
                    name    : CWBForecast.warn_id[id],
                    iconURL : warnings[id].title.includes("解除") ? "https://upload.cc/i1/2023/05/24/9q6as4.png" : (WarningIcons[id] ?? "https://upload.cc/i1/2022/05/26/VuPXhM.png"),
                    url     : `https://www.cwb.gov.tw/V8/C/P/Warning/${id}.html`,
                  })
                  .setDescription(`${timestamp(new Date(warnings[id].issued), TimestampStyles.ShortDateTime)} → ${timestamp(new Date(warnings[id].validto), TimestampStyles.ShortDateTime)}\n\n${warnings[id].content}`);
                embeds.push(warn);

                switch (id) {
                  case "TY_WIND":
                  case "TY_WARN":
                  case "TY_NEWS":
                  case "EQ":
                  case "PWS":
                  case "FIFOWS":
                  case "W33":
                  case "W34": {
                    break;
                  }

                  case "W37":{
                    warn.setThumbnail("https://www.cwb.gov.tw/Data/warning/Surge_Swell/Swell_MapTaiwan02.png");
                    break;
                  }

                  default:
                    warn.setThumbnail(`https://www.cwb.gov.tw/Data/warning/${id}_C.png`);
                    break;
                }
              }

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

          if (warnings.W33.length > 0) {
            const hazards_W33_list = warnings.W33.filter(e => e.WarnArea.filter(WarnArea => WarnArea.County.includes(_currentCounty.slice(0, -1))).length > 0);

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
                .setImage(`https://www.cwb.gov.tw/Data/warning/w33/${e.ImgFile}?T=${imageTimestamp}`)));
          }

          const location = _town_data.locations[0].location.find(e => e.locationName == _currentTown);

          const forecast_embed = new EmbedBuilder()
            .setAuthor({
              name    : "中央氣象局",
              iconURL : "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/ROC_Central_Weather_Bureau.svg/1200px-ROC_Central_Weather_Bureau.svg.png",
              url     : "https://www.cwb.gov.tw/",
            })
            .setTitle(`${_currentCounty} ${_currentTown} ${_county_data.datasetDescription}`)
            .setURL(`https://www.cwb.gov.tw/V8/C/W/Town/Town.html?TID=${location?.geocode}`)
            .setColor(Colors.Blue)
            .setImage(await cwb_Forecast.ecard(_currentCounty))
            .setTimestamp();

          const elements = new Map(location.weatherElement.map(weatherElement => [weatherElement.elementName, weatherElement]));
          const fields = [];

          for (const key of ["Wx", "T", "AT", "PoP6h", "RH", "CI", "WD"]) {
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
                  name  : `${timestamp(new Date(t.startTime), TimestampStyles.ShortDateTime)} ${emoji(t.elementValue[0].value, (new Date(t.startTime).getHours() >= 18) ? "晚" : "")} **${t.elementValue[0].value}**`,
                  page  : t.startTime,
                  value : "",
                });

            const numericValues = time.map((v) => +v.elementValue[0].value);

            for (const ti in time) {
              let str = "";

              switch (key) {
                case "Wx": break;
                case "CI": {
                  str = `${+time[ti].elementValue[0].value < 16 ? "🥶" : time[ti].elementValue[0].value > 26 ? "🥵" : "😀"} 舒適度　 │ **${time[ti].elementValue[1].value}** \`${time[ti].elementValue[0].value}\``;
                  break;
                }

                case "PoP6h":
                case "RH": {
                  const count = Math.round(numericValues[ti] / 10);
                  str = `${{ PoP6h: "☔", RH: "💧" }[key]} ${{ PoP6h: "降雨機率", RH: "相對溼度" }[key]} │ ${{ PoP6h: "🟦", RH: "🟪" }[key].repeat(count)} **${time[ti].elementValue[0].value}%**`;
                  break;
                }

                case "T":
                case "AT": {
                  const floor = Math.min(...numericValues);
                  const ceil = Math.max(...numericValues);
                  const step = (ceil - floor) / 10;
                  const count = Math.round((numericValues[ti] - floor) / step);
                  str = `${{ T: "🌡", AT: "👕" }[key]} ${{ T: "氣溫　　", AT: "體感溫度" }[key]} │ ${{ T: "🟧", AT: "🟨" }[key].repeat(count)} **${time[ti].elementValue[0].value}${{ T: "℃", AT: "℃" }[key] ?? "%"}**`;
                  break;
                }

                case "WD": {
                  const s = elements.get("WS").time[ti].elementValue;
                  const d = time[ti].elementValue[0].value;
                  str = `💨 風　　　 │ **${WindDirections[d]} ${d}** ${s[0].value} ${s[0].measures}（${s[1].measures} ${s[1].value}）`;
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
              .setStyle(buttons.length ? ButtonStyle.Secondary : ButtonStyle.Primary)
              .setLabel(`${time.getMonth() + 1}/${time.getDate()} (${[ "日", "一", "二", "三", "四", "五", "六" ][time.getDay()]})`)
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
            for (const index in buttons)
              buttons[index].setStyle(index == inter.customId.split("-")[1] ? ButtonStyle.Primary : ButtonStyle.Secondary);
            buttons[inter.customId.split("-")[1]].setStyle(ButtonStyle.Primary);
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

function addTyphoonNewsEmbed(arr) {
  arr.push(new EmbedBuilder()
    .setColor(Colors.Red)
    .setAuthor({
      name    : "颱風消息",
      iconURL : "https://upload.cc/i1/2022/05/26/VuPXhM.png",
    })
    .setDescription("詳細資訊請使用 </typhoon:1110826483016028161>"));
}

function addTyphoonWarnEmbed(arr, data) {
  const issue = new Date(data.issued);
  const valid = new Date(data.validto);
  const now = new Date(Date.now());
  const imageTimestamp = "" + now.getFullYear() + (now.getMonth() + 1).toString().padStart(2, "0") + now.getHours().toString().padStart(2, "2") + "00";

  const title = data.TY_WARN_LIST.C[0].TabName.split(" ");
  title.splice(1, 0, data.PTA_TYPHOON);

  const embed = new EmbedBuilder()
    .setColor(data.title.includes("解除") ? Colors.Green : Colors.Red)
    .setAuthor({
      name    : data.title,
      iconURL : data.title.includes("解除") ? "https://upload.cc/i1/2023/05/24/9q6as4.png" : "https://upload.cc/i1/2022/05/26/VuPXhM.png",
    })
    .setTitle(title.join(" ").replace(" ", "："))
    .setURL("https://www.cwb.gov.tw/V8/C/P/Typhoon/TY_WARN.html")
    .setImage(`https://www.cwb.gov.tw/Data/typhoon/TY_WARN/B20.png?T=${imageTimestamp}`)
    .addFields({
      name   : "發布時間",
      value  : timestamp(issue, TimestampStyles.ShortDateTime),
      inline : true,
    }, {
      name   : "有效至",
      value  : `${timestamp(valid, issue.getDate() == valid.getDate() ? TimestampStyles.ShortTime : TimestampStyles.ShortDateTime)} (${timestamp(new Date(data.validto), TimestampStyles.RelativeTime)})`,
      inline : true,
    });

  for (const key of ["Movement", "LandWarn", "SeaWarn", "HeavyRain", "NoticeText", "NoteText"])
    if (data[key].length)
      if (Array.isArray(data[key]))
        embed.addFields({
          name  : { Movement: "颱風動態", LandWarn: "陸上警戒區域", SeaWarn: "海上警戒區域", HeavyRain: "豪雨特報", NoticeText: "注意事項", NoteText: "附註" }[key],
          value : ((key == "NoticeText") ? data[key].slice(0, -1) : data[key]).map(v => `* ${v}`).join("\n"),
        });
      else
        embed.addFields({
          name  : { Movement: "颱風動態", LandWarn: "陸上警戒區域", SeaWarn: "海上警戒區域", HeavyRain: "豪雨特報", NoticeText: "注意事項", NoteText: "附註" }[key],
          value : data[key],
        });

  arr.push(embed);
}