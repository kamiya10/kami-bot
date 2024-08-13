/* eslint-disable no-irregular-whitespace */
const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Colors,
  EmbedBuilder,
} = require("discord.js");
const { stripIndents } = require("common-tags");
const colors = {
  綠色: Colors.Green,
  黃色: Colors.Yellow,
  橙色: Colors.Orange,
  紅色: Colors.Red,
};
const magnitudeTW = [
  "極微",
  "極微",
  "微小",
  "微小",
  "輕微",
  "中等",
  "強烈",
  "重大",
  "極大",
];
const magnitudeE = [
  "\\⚫",
  "\\⚫",
  "\\⚪",
  "\\🔵",
  "\\🟢",
  "\\🟡",
  "\\🟠",
  "\\🔴",
  "\\🛑",
];
const depthTW = ["極淺層", "淺層", "中層", "深層"];
const depthE = ["\\🔴", "\\🟠", "\\🟡", "\\🟢"];

/**
 * @param {Earthquake} Earthquake Earthquake data
 * @param {0|1|2|3|4|5} style Format style
 * @return {import("discord.js").MessageOptions}
 */
function formatEarthquake(Earthquake, style = 0) {
  const depth = [30, 70, 300, 700];
  depth.push(Earthquake.EarthquakeInfo.FocalDepth);
  const depthI = depth
    .sort((a, b) => a - b)
    .indexOf(Earthquake.EarthquakeInfo.FocalDepth);
  const magnitudeI =
    ~~Earthquake.EarthquakeInfo.EarthquakeMagnitude.MagnitudeValue;
  const time = new Date(Earthquake.EarthquakeInfo.OriginTime);
  const timecode =
    "" +
    time.getFullYear() +
    (time.getMonth() + 1 < 10 ? "0" : "") +
    (time.getMonth() + 1) +
    (time.getDate() < 10 ? "0" : "") +
    time.getDate() +
    (time.getHours() < 10 ? "0" : "") +
    time.getHours() +
    (time.getMinutes() < 10 ? "0" : "") +
    time.getMinutes() +
    (time.getSeconds() < 10 ? "0" : "") +
    time.getSeconds();
  const cwa_code =
    "EQ" +
    Earthquake.EarthquakeNo +
    "-" +
    (time.getMonth() + 1 < 10 ? "0" : "") +
    (time.getMonth() + 1) +
    (time.getDate() < 10 ? "0" : "") +
    time.getDate() +
    "-" +
    (time.getHours() < 10 ? "0" : "") +
    time.getHours() +
    (time.getMinutes() < 10 ? "0" : "") +
    time.getMinutes() +
    (time.getSeconds() < 10 ? "0" : "") +
    time.getSeconds();
  const cwa_codeYear =
    "EQ" +
    Earthquake.EarthquakeNo +
    "-" +
    time.getFullYear() +
    "-" +
    (time.getMonth() + 1 < 10 ? "0" : "") +
    (time.getMonth() + 1) +
    (time.getDate() < 10 ? "0" : "") +
    time.getDate() +
    "-" +
    (time.getHours() < 10 ? "0" : "") +
    time.getHours() +
    (time.getMinutes() < 10 ? "0" : "") +
    time.getMinutes() +
    (time.getSeconds() < 10 ? "0" : "") +
    time.getSeconds();
  const cwa_url = "https://www.cwa.gov.tw/V8/C/E/EQ/" + cwa_code + ".html";
  const cwa_image = Earthquake.cwa_image
    ? Earthquake.cwa_image
    : "https://www.cwa.gov.tw/Data/earthquake/img/EC" +
      (Earthquake.EarthquakeNo % 1000 == 0 ? "L" : "") +
      (Earthquake.EarthquakeNo % 1000 == 0
        ? timecode
        : timecode.slice(4, timecode.length - 2)) +
      Earthquake.EarthquakeInfo.EarthquakeMagnitude.MagnitudeValue * 10 +
      (Earthquake.EarthquakeNo % 1000 == 0
        ? ""
        : Earthquake.EarthquakeNo.toString().substring(3)) +
      "_H.png";

  const url = new ActionRowBuilder().addComponents([
    new ButtonBuilder()
      .setLabel("地震報告")
      .setStyle(ButtonStyle.Link)
      .setURL(cwa_url),
    new ButtonBuilder()
      .setLabel("地震測報中心")
      .setStyle(ButtonStyle.Link)
      .setURL(Earthquake.Web),
  ]);

  switch (style) {
    case 0: {
      const content = `**[${Earthquake.EarthquakeNo % 1000 == 0 ? "小區域" : Earthquake.EarthquakeNo}]** <t:${~~(time.getTime() / 1000)}> ${Earthquake.ReportContent.substring(11)}`;
      return { content, components: [] };
    }

    case 1: {
      const desc = `**[${Earthquake.EarthquakeNo % 1000 == 0 ? "小區域" : Earthquake.EarthquakeNo}]** <t:${~~(time.getTime() / 1000)}>\n${Earthquake.ReportContent.substring(11)}`;
      const embed = new EmbedBuilder()
        .setColor(colors[Earthquake.ReportColor])
        .setAuthor({
          name: "地震報告",
          iconURL: "https://i.imgur.com/qIxk1H1.png",
        })
        .setThumbnail(cwa_image)
        .setDescription(desc)
        .setFooter({
          text: "交通部中央氣象署",
          iconURL:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/ROC_Central_Weather_Bureau.svg/1200px-ROC_Central_Weather_Bureau.svg.png",
        })
        .setTimestamp(time);

      return { embeds: [embed], components: [url] };
    }

    case 2: {
      const desc = `**[${Earthquake.EarthquakeNo % 1000 == 0 ? "小區域" : Earthquake.EarthquakeNo}]** <t:${~~(time.getTime() / 1000)}>\n${Earthquake.ReportContent.substring(11)}`;
      const embed = new EmbedBuilder()
        .setColor(colors[Earthquake.ReportColor])
        .setAuthor({
          name: "地震報告",
          iconURL: "https://i.imgur.com/qIxk1H1.png",
        })
        .setImage(cwa_image)
        .setDescription(desc)
        .setFooter({
          text: "交通部中央氣象署",
          iconURL:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/ROC_Central_Weather_Bureau.svg/1200px-ROC_Central_Weather_Bureau.svg.png",
        })
        .setTimestamp(time);

      return { embeds: [embed], components: [url] };
    }

    case 3: {
      const desc = stripIndents`
        **編號：**${Earthquake.EarthquakeNo % 1000 == 0 ? "無（小區域有感地震）" : Earthquake.EarthquakeNo}
        **日期：**<t:${~~(time.getTime() / 1000)}:D>
        **時間：**<t:${~~(time.getTime() / 1000)}:T>
        **震央：**${Earthquake.EarthquakeInfo.Epicenter.Location.replace("(", "（").replace(")", "）").split("（").join("\n（　　　")}
        **深度：**${Earthquake.EarthquakeInfo.FocalDepth} 公里
        **規模：**芮氏 ${Earthquake.EarthquakeInfo.EarthquakeMagnitude.MagnitudeValue}`;

      const embed = new EmbedBuilder()
        .setColor(colors[Earthquake.ReportColor])
        .setAuthor({
          name: "地震報告",
          iconURL: "https://i.imgur.com/qIxk1H1.png",
        })
        .setImage(cwa_image)
        .setDescription(desc)
        .setFooter({
          text: "交通部中央氣象署",
          iconURL:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/ROC_Central_Weather_Bureau.svg/1200px-ROC_Central_Weather_Bureau.svg.png",
        })
        .setTimestamp(time);

      Earthquake.Intensity.ShakingArea.filter((v) => !v.InfoStatus)
        // TODO: idk what this line does this do if the given report is already sorted
        // .sort((a, b) => b.AreaIntensity.value - a.AreaIntensity.value)
        .forEach((ShakingArea) =>
          embed.addFields({
            name: ShakingArea.AreaDesc,
            value: ShakingArea.CountyName,
          }),
        );

      return { embeds: [embed], components: [url] };
    }

    case 4: {
      const desc = `<t:${~~(time.getTime() / 1000)}>\n${Earthquake.ReportContent.substring(11)}`;

      const embed = new EmbedBuilder()
        .setColor(colors[Earthquake.ReportColor])
        .setAuthor({
          name: "地震報告",
          iconURL: "https://i.imgur.com/qIxk1H1.png",
        })
        .setURL(cwa_url)
        .setImage(cwa_image)
        .setDescription(desc)
        .setFields(
          ...[
            {
              name: "編號",
              value: `${Earthquake.EarthquakeNo % 1000 == 0 ? "無（小區域有感地震）" : Earthquake.EarthquakeNo}`,
              inline: true,
            },
            {
              name: "時間",
              value: `<t:${~~(time.getTime() / 1000)}:D><t:${~~(time.getTime() / 1000)}:T>`,
              inline: true,
            },
            {
              name: "深度",
              value: `${depthE[depthI]}**${Earthquake.EarthquakeInfo.FocalDepth}** 公里 \`(${depthTW[depthI]})\``,
              inline: true,
            },
            {
              name: "規模",
              value: `${magnitudeE[magnitudeI]}芮氏 **${Earthquake.EarthquakeInfo.EarthquakeMagnitude.MagnitudeValue}** \`(${magnitudeTW[magnitudeI]})\``,
              inline: true,
            },
            {
              name: "震央",
              value: `${Earthquake.EarthquakeInfo.Epicenter.Location.replace("(", "（").replace(")", "）").split("（").join("\n（")}`,
            },
          ],
        )
        .setFooter({
          text: "交通部中央氣象署",
          iconURL:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/ROC_Central_Weather_Bureau.svg/1200px-ROC_Central_Weather_Bureau.svg.png",
        })
        .setTimestamp(time);

      Earthquake.Intensity.ShakingArea.filter((v) => !v.InfoStatus)
        // TODO: idk what this line does this do if the given report is already sorted
        // .sort((a, b) => b.AreaIntensity.value - a.AreaIntensity.value)
        .forEach((ShakingArea) =>
          embed.addFields({
            name: ShakingArea.AreaDesc,
            value: ShakingArea.CountyName,
          }),
        );

      return { embeds: [embed], components: [url] };
    }

    case 5: {
      const desc = `<t:${~~(time.getTime() / 1000)}>\n${Earthquake.ReportContent.substring(11)}`;
      const embeds = [];
      const embed = new EmbedBuilder()
        .setColor(colors[Earthquake.ReportColor])
        .setAuthor({
          name: "地震報告",
          iconURL: "https://i.imgur.com/qIxk1H1.png",
        })
        .setURL(cwa_url)
        .setImage(cwa_image)
        .setDescription(desc)
        .setFields(
          ...[
            {
              name: "編號",
              value: `${Earthquake.EarthquakeNo % 1000 == 0 ? "無（小區域有感地震）" : Earthquake.EarthquakeNo}`,
              inline: true,
            },
            {
              name: "時間",
              value: `<t:${~~(time.getTime() / 1000)}:D>\n<t:${~~(time.getTime() / 1000)}:T>\n<t:${~~(time.getTime() / 1000)}:R>`,
              inline: true,
            },
            {
              name: "震央位置",
              value: `${Earthquake.EarthquakeInfo.Epicenter.Location.replace("(", "（").replace(")", "）").split("（").join("\n（")}`,
              inline: true,
            },
            {
              name: "震央經緯",
              value: `北緯 **${Earthquake.EarthquakeInfo.Epicenter.EpicenterLatitude}** 度\n東經 **${Earthquake.EarthquakeInfo.Epicenter.EpicenterLongitude}**   度`,
              inline: true,
            },
            {
              name: "深度",
              value: `${depthE[depthI]} **${Earthquake.EarthquakeInfo.FocalDepth}** 公里\n　 ${depthTW[depthI]}`,
              inline: true,
            },
            {
              name: "規模",
              value: `${magnitudeE[magnitudeI]} 芮氏 **${Earthquake.EarthquakeInfo.EarthquakeMagnitude.MagnitudeValue}**\n　 ${magnitudeTW[magnitudeI]}`,
              inline: true,
            },
          ],
        )
        .setFooter({
          text: "交通部中央氣象署",
          iconURL:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/ROC_Central_Weather_Bureau.svg/1200px-ROC_Central_Weather_Bureau.svg.png",
        })
        .setTimestamp(time);

      Earthquake.Intensity.ShakingArea.filter((v) => !v.InfoStatus)
        // TODO: idk what this line does this do if the given report is already sorted
        // .sort((a, b) => b.AreaIntensity.value - a.AreaIntensity.value)
        .forEach((ShakingArea) =>
          embed.addFields({
            name: ShakingArea.AreaDesc,
            value: ShakingArea.CountyName,
          }),
        );

      const shakemap = new EmbedBuilder()
        .setURL(cwa_url)
        .setImage(Earthquake.ShakemapImageURI);

      const pgvmap = new EmbedBuilder()
        .setURL(cwa_url)
        .setImage(
          `https://www.cwa.gov.tw/Data/earthquake/zip/${cwa_codeYear}/${time.getFullYear()}${Earthquake.EarthquakeNo.toString().substring(3)}v.png`,
        );

      const pgamap = new EmbedBuilder()
        .setURL(cwa_url)
        .setImage(
          `https://www.cwa.gov.tw/Data/earthquake/zip/${cwa_codeYear}/${time.getFullYear()}${Earthquake.EarthquakeNo.toString().substring(3)}a.png`,
        );

      embeds.push(embed);

      if (Earthquake.ShakemapImageURI) {embeds.push(shakemap);}
      embeds.push(pgvmap, pgamap);
      return { embeds, components: [url] };
    }
  }
}

module.exports = formatEarthquake;

/**
 * @typedef {object} Earthquake
 * @property {number} EarthquakeNo
 * @property {string} ReportType
 * @property {string} ReportColor
 * @property {string} ReportContent
 * @property {string} ReportImageURI
 * @property {string} ReportRemark
 * @property {string} Web
 * @property {string} ShakemapImageURI
 * @property {EarthquakeInfo} EarthquakeInfo
 * @property {Intensity} Intensity
 */

/**
 * @typedef {object} EarthquakeInfo
 * @property {string} OriginTime
 * @property {string} Source
 * @property {number} FocalDepth
 * @property {Epicenter} Epicenter
 * @property {EarthquakeMagnitude} EarthquakeMagnitude
 */

/**
 * @typedef {object} Epicenter
 * @property {string} Location
 * @property {number} EpicenterLatitude
 * @property {number} EpicenterLongitude
 */

/**
 * @typedef {object} EarthquakeMagnitude
 * @property {string} MagnitudeType
 * @property {number} MagnitudeValue
 */

/**
 * @typedef {object} Intensity
 * @property {ShakingArea[]} ShakingArea
 */

/**
 * @typedef {object} ShakingArea
 * @property {string} AreaDesc
 * @property {string} CountyName
 * @property {string} InfoStatus
 * @property {string} AreaIntensity
 * @property {EqStation[]} EqStation
 */

/**
 * @typedef {object} areaIntensity
 * @property {number} value
 * @property {string} unit
 */

/**
 * @typedef {object} EqStation
 * @property {string} StationName
 * @property {string} StationID
 * @property {string} InfoStatus
 * @property {number} BackAzimuth
 * @property {number} EpicenterDistance
 * @property {pga} pga
 * @property {pgv} pgv
 * @property {string} SeismicIntensity
 * @property {number} StationLatitude
 * @property {number} StationLongitude
 * @property {string} WaveImageURI
 */

/**
 * @typedef {object} pga
 * @property {number} EWComponent
 * @property {number} NSComponent
 * @property {number} VComponent
 * @property {number} IntScaleValue
 * @property {string} unit
 */

/**
 * @typedef {object} pgv
 * @property {number} EWComponent
 * @property {number} NSComponent
 * @property {number} VComponent
 * @property {number} IntScaleValue
 * @property {string} unit
 */
