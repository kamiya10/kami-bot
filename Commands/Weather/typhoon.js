/* eslint-disable array-bracket-newline */
/* eslint-disable array-element-newline */
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, ComponentType, EmbedBuilder, SlashCommandBuilder, TimestampStyles, time } = require("discord.js");
const cwa_Forecast = new (require("../../API/cwa_forecast"))(process.env.CWA_TOKEN);

const CycloneLevelColors = {
  熱帶性低氣壓 : Colors.Blue,
  輕度颱風   : Colors.Green,
  中度颱風   : Colors.Yellow,
  強烈颱風   : Colors.Red,
};

const CycloneLevelEmojis = {
  溫帶氣旋   : "🇱",
  熱帶性低氣壓 : "🇱",
  輕度颱風   : "🟢",
  中度颱風   : "🟡",
  強烈颱風   : "🔴",
};

const Bearings = {
  N   : "北",
  NNE : "北北東",
  NE  : "東北",
  ENE : "東北東",
  E   : "東",
  ESE : "東南東",
  SE  : "東南",
  SSE : "南南東",
  S   : "南",
  SSW : "南南西",
  SW  : "西南",
  WSW : "西南西",
  W   : "西",
  WNW : "西北西",
  NW  : "西北",
  NNW : "北北西",
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("typhoon")
    .setDescription("查詢颱風消息"),
  defer     : true,
  ephemeral : false,
  dev       : false,

  /**
   * @param {import("discord.js").ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const data = (await cwa_Forecast.typhoon())?.records;
    const cyclones = [];

    if (data)
      for (const cyclone of data.tropicalCyclones.tropicalCyclone) {
        const current = cyclone.analysisData.fix.at(-1);
        const lastForecast = cyclone.forecastData.fix.at(-1);
        const coord = parseCoordinate(current.coordinate);

        const cTime = new Date(current.fixTime);
        const cTimeId = `${cTime.getFullYear()}${`${((new Date(current.fixTime).getHours() - 8 < 0) && (cTime.getDate() - 1 < 0)) ? cTime.getMonth() : cTime.getMonth() + 1}`.padStart(2, "0")}${`${new Date(current.fixTime).getHours() - 8 < 0 ? cTime.getDate() - 1 : cTime.getDate()}`.padStart(2, "0")}${(new Date(current.fixTime).getHours() - 8 < 0 ? 18 : new Date(current.fixTime).getHours() - 8).toString().padStart(2, "0")}00`;

        const mainEmbed = new EmbedBuilder()
          .setColor(CycloneLevelColors[getCycloneLevel(current.maxWindSpeed)])
          .setAuthor({
            name    : "中央氣象局",
            iconURL : "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/ROC_Central_Weather_Bureau.svg/1200px-ROC_Central_Weather_Bureau.svg.png",
            url     : "https://www.cwa.gov.tw/",
          })
          .setTitle(`${getCycloneLevel(current.maxWindSpeed, current.coordinate)}：${cyclone.typhoonName} ${cyclone.cwaTyphoonName}`)
          .setURL("https://www.cwa.gov.tw/V8/C/P/Typhoon/TY_NEWS.html")
          .setDescription(`${time(new Date(current.fixTime), TimestampStyles.ShortDateTime)} 的中心位置在${coord.latitude == 0 ? "" : coord.latitude > 0 ? "北緯" : "南緯"} ${coord.latitude} 度，${coord.latitude == 0 ? "" : coord.latitude > 0 ? "東經" : "西經"} ${coord.longitude} 度，以每小時 ${cyclone.forecastData.fix[0].movingSpeed} 公里速度，向${Bearings[cyclone.forecastData.fix[0].movingDirection]}進行。中心氣壓 ${current.pressure} 百帕，近中心最大風速每秒 ${current.maxWindSpeed} 公尺，瞬間最大陣風每秒 ${current.maxGustSpeed} 公尺，七級風暴風半徑 ${current.circleOf15Ms.radius} 公里${current.circleOf25Ms ? `，十級風暴風半徑 ${current.circleOf25Ms.radius} 公里。` : "。"}`)
          .setImage(`https://www.cwa.gov.tw/Data/typhoon/TY_NEWS/PTA_${cTimeId}-${lastForecast.tau}_${cyclone.typhoonName}_zhtw.png`);

        const mainEmbedRadiirImage = new EmbedBuilder()
          .setURL("https://www.cwa.gov.tw/V8/C/P/Typhoon/TY_NEWS.html")
          .setImage(`https://www.cwa.gov.tw/Data/typhoon/TY_NEWS/WSP-MAP_${cTimeId}_${cyclone.typhoonName}_zhtw.png`);

        const historyEmbed = new EmbedBuilder()
          .setColor(CycloneLevelColors[getCycloneLevel(current.maxWindSpeed)])
          .setAuthor({
            name    : "中央氣象局",
            iconURL : "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/ROC_Central_Weather_Bureau.svg/1200px-ROC_Central_Weather_Bureau.svg.png",
            url     : "https://www.cwa.gov.tw/",
          })
          .setTitle(`${getCycloneLevel(current.maxWindSpeed, current.coordinate)}：${cyclone.typhoonName} ${cyclone.cwaTyphoonName} - 歷史路徑`)
          .setURL("https://www.cwa.gov.tw/V8/C/P/Typhoon/TY_NEWS.html");

        const forecastEmbed = new EmbedBuilder(historyEmbed.data).setTitle(`${getCycloneLevel(current.maxWindSpeed, current.coordinate)}：${cyclone.typhoonName} ${cyclone.cwaTyphoonName} - 預測路徑`);

        let bars = [];

        for (const history of cyclone.analysisData.fix) {
          history.fixTime = new Date(history.fixTime);

          if ((new Date(Date.now()).getDate() != history.fixTime.getDate() && !((~~((new Date(Date.now()).getTime() - history.fixTime.getTime()) / 86400_000) >= 2) ? [8] : [8, 20]).includes(history.fixTime.getHours())) && cyclone.analysisData.fix.indexOf(history)) {
            if (bars.at(-1))
              bars.at(-1).push(CycloneLevelEmojis[getCycloneLevel(history.maxWindSpeed)]);
            continue;
          }

          bars.push([CycloneLevelEmojis[getCycloneLevel(history.maxWindSpeed)]]);
        }

        let cur = 0;

        for (const history of cyclone.analysisData.fix) {
          if ((new Date(Date.now()).getDate() != history.fixTime.getDate() && !((~~((new Date(Date.now()).getTime() - history.fixTime.getTime()) / 86400_000) >= 2) ? [8] : [8, 20]).includes(history.fixTime.getHours())) && cyclone.analysisData.fix.indexOf(history)) continue;

          switch (bars[cur].length) {
            case 3: {
              bars[cur].push("<:bar:1110760055361511495>");
              break;
            }

            case 2: {
              bars[cur].splice(1, 0, "<:bar:1110760055361511495>");
              bars[cur].push("<:bar:1110760055361511495>");
              break;
            }

            case 1: {
              bars[cur].push("<:bar:1110760055361511495>");
              bars[cur].push("<:bar:1110760055361511495>");
              bars[cur].push("<:bar:1110760055361511495>");
              break;
            }
          }

          const str = [];

          const coordinate = parseCoordinate(history.coordinate);

          str.push(`${bars[cur][1]} 　位置　　　　　 │ ${coordinate.latitude == 0 ? "" : coordinate.latitude > 0 ? "東經" : "西經"} **${coordinate.longitude}** 度，${coordinate.latitude == 0 ? "" : coordinate.latitude > 0 ? "北緯" : "南緯"} **${coordinate.latitude}** 度`);
          str.push(`${bars[cur][2]} 　中心氣壓　　　 │ **${history.pressure} 百帕**`);
          str.push(`${bars[cur][3]} 　近中心最大風速 │ **${history.maxWindSpeed} m/s**`);

          if ((historyEmbed.data.fields?.length ?? 0) >= 25)
            historyEmbed.spliceFields(0, 1);

          historyEmbed.addFields({
            name  : `${bars[cur][0]} **${getCycloneLevel(history.maxWindSpeed, history.coordinate)}** ${time(history.fixTime, TimestampStyles.ShortDate)} ${time(history.fixTime, TimestampStyles.ShortTime)}`,
            value : str.join("\n"),
          });

          cur++;
        }

        bars = [];

        for (const forecast of cyclone.forecastData.fix) {
          forecast.fixTime = new Date(new Date(forecast.initTime).getTime() + +forecast.tau * 60 * 60 * 1000);

          if ((new Date(Date.now()).getDate() != forecast.fixTime.getDate() && ![8, 20].includes(forecast.fixTime.getHours())) && cyclone.forecastData.fix.indexOf(forecast)) {
            if (bars.at(-1))
              bars.at(-1).push(CycloneLevelEmojis[getCycloneLevel(forecast.maxWindSpeed)]);
            continue;
          }

          bars.push([CycloneLevelEmojis[getCycloneLevel(forecast.maxWindSpeed)]]);
        }

        cur = 0;

        for (const forecast of cyclone.forecastData.fix) {
          if ((new Date(Date.now()).getDate() != forecast.fixTime.getDate() && ![8, 20].includes(forecast.fixTime.getHours())) && cyclone.forecastData.fix.indexOf(forecast)) continue;

          switch (bars[cur].length) {
            case 3: {
              bars[cur].push("<:bar:1110760055361511495>");
              break;
            }

            case 2: {
              bars[cur].splice(1, 0, "<:bar:1110760055361511495>");
              bars[cur].push("<:bar:1110760055361511495>");
              break;
            }

            case 1: {
              bars[cur].push("<:bar:1110760055361511495>");
              bars[cur].push("<:bar:1110760055361511495>");
              bars[cur].push("<:bar:1110760055361511495>");
              break;
            }
          }

          const str = [];

          const coordinate = parseCoordinate(forecast.coordinate);

          str.push(`${bars[cur][1]} 　位置　　　　　 │ ${coordinate.latitude == 0 ? "" : coordinate.latitude > 0 ? "東經" : "西經"} **${coordinate.longitude}** 度，${coordinate.latitude == 0 ? "" : coordinate.latitude > 0 ? "北緯" : "南緯"} **${coordinate.latitude}** 度`);
          str.push(`${bars[cur][2]} 　中心氣壓　　　 │ **${forecast.pressure} 百帕**`);

          if (forecast.maxWindSpeed) str.push(`${bars[cur][3]} 　近中心最大風速 │ **${forecast.maxWindSpeed} m/s**`);

          forecastEmbed.addFields({
            name  : `${bars[cur][0]} **${getCycloneLevel(forecast.maxWindSpeed, forecast.coordinate)}** ${time(forecast.fixTime, TimestampStyles.ShortDate)} ${time(forecast.fixTime, TimestampStyles.ShortTime)}`,
            value : str.join("\n"),
          });

          cur++;
        }

        cyclones.push({
          main     : [mainEmbed, mainEmbedRadiirImage],
          history  : [historyEmbed],
          forecast : [forecastEmbed],
        });

        const pages = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId("typhoon-main")
              .setLabel("總覽")
              .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
              .setCustomId("typhoon-history")
              .setLabel("歷史路徑")
              .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
              .setCustomId("typhoon-forecast")
              .setLabel("預測路徑")
              .setStyle(ButtonStyle.Secondary),
          );

        const cycloneIndex = 0;

        const sent = await interaction.editReply({ embeds: cyclones[0].main, components: [ pages ] });
        const collector = sent.createMessageComponentCollector({ componentType: ComponentType.Button });
        collector.on("collect", async inter => {
          if (inter.customId == "typhoon-main")
            await inter.update({ embeds: cyclones[cycloneIndex].main, components: [ pages ] });

          if (inter.customId == "typhoon-history")
            await inter.update({ embeds: cyclones[cycloneIndex].history, components: [ pages ] });

          if (inter.customId == "typhoon-forecast")
            await inter.update({ embeds: cyclones[cycloneIndex].forecast, components: [ pages ] });
        });
      }
    else
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription("目前無發布颱風消息。").setColor(Colors.DarkGrey),
        ],
      });
  },
};

function getCycloneLevel(wind = 0, coord) {
  let coords;

  if (coord)
    coords = parseCoordinate(coord);

  const index = [17.1, 32.6, 50.9].concat([+wind]).sort((a, b) => a - b).indexOf(+wind);

  if (index == 0 && (coords?.latitude ?? 0) > 23.5)
    return "溫帶氣旋";
  else
    return [ "熱帶性低氣壓", "輕度颱風", "中度颱風", "強烈颱風" ][index];
}

function parseCoordinate(coord) {
  const coords = coord.split(",").map(Number);
  return { longitude: coords[0], latitude: coords[1] };
}