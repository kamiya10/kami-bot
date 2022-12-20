const { ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, EmbedBuilder } = require("discord.js");
const { stripIndents } = require("common-tags");
const colors = {
  綠色 : Colors.Green,
  黃色 : Colors.Yellow,
  橙色 : Colors.Orange,
  紅色 : Colors.Red,
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
const depthTW = [
  "極淺層",
  "淺層",
  "中層",
  "深層",
];
const depthE = [
  "\\🔴",
  "\\🟠",
  "\\🟡",
  "\\🟢",
];

/**
 * @param {Earthquake} earthquake Earthquake data
 * @param {0|1|2|3|4|5} style Format style
 * @return {import("discord.js").MessageOptions}
 */
function formatEarthquake(earthquake, style = 0) {
  const depth = [
    30,
    70,
    300,
    700,
  ];
  depth.push(earthquake.earthquakeInfo.depth.value);
  const depthI = depth.sort((a, b) => a - b).indexOf(earthquake.earthquakeInfo.depth.value);
  const magnitudeI = ~~earthquake.earthquakeInfo.magnitude.magnitudeValue;
  const time = new Date(earthquake.earthquakeInfo.originTime);
  const timecode = ""
    + time.getFullYear()
    + (time.getMonth() + 1 < 10 ? "0" : "") + (time.getMonth() + 1)
    + (time.getDate() < 10 ? "0" : "") + time.getDate()
    + (time.getHours() < 10 ? "0" : "") + time.getHours()
    + (time.getMinutes() < 10 ? "0" : "") + time.getMinutes()
    + (time.getSeconds() < 10 ? "0" : "") + time.getSeconds();
  const cwb_code
    = "EQ"
    + earthquake.earthquakeNo
    + "-"
    + (time.getMonth() + 1 < 10 ? "0" : "") + (time.getMonth() + 1)
    + (time.getDate() < 10 ? "0" : "") + time.getDate()
    + "-"
    + (time.getHours() < 10 ? "0" : "") + time.getHours()
    + (time.getMinutes() < 10 ? "0" : "") + time.getMinutes()
    + (time.getSeconds() < 10 ? "0" : "") + time.getSeconds();
  const cwb_codeY
    = "EQ"
    + earthquake.earthquakeNo
    + "-"
    + time.getFullYear()
    + "-"
    + (time.getMonth() + 1 < 10 ? "0" : "") + (time.getMonth() + 1)
    + (time.getDate() < 10 ? "0" : "") + time.getDate()
    + "-"
    + (time.getHours() < 10 ? "0" : "") + time.getHours()
    + (time.getMinutes() < 10 ? "0" : "") + time.getMinutes()
    + (time.getSeconds() < 10 ? "0" : "") + time.getSeconds();
  const cwb_url
    = "https://www.cwb.gov.tw/V8/C/E/EQ/"
    + cwb_code
    + ".html";
  const cwb_image
    = "https://www.cwb.gov.tw/Data/earthquake/img/EC"
    + (earthquake.earthquakeNo == 111000 ? "L" : "")
    + (earthquake.earthquakeNo == 111000 ? timecode : timecode.slice(4, timecode.length - 2))
    + (earthquake.earthquakeInfo.magnitude.magnitudeValue * 10)
    + (earthquake.earthquakeNo == 111000 ? "" : earthquake.earthquakeNo.toString().substring(3))
    + "_H.png";
  const url = new ActionRowBuilder()
    .addComponents([
      new ButtonBuilder()
        .setLabel("地震報告")
        .setStyle(ButtonStyle.Link)
        .setURL(cwb_url),
      new ButtonBuilder()
        .setLabel("地震測報中心")
        .setStyle(ButtonStyle.Link)
        .setURL(earthquake.web),
    ]);

  switch (style) {
    case 0: {
      const content = `**[${earthquake.earthquakeNo == 111000 ? "小區域" : earthquake.earthquakeNo}]** <t:${~~(time.getTime() / 1000)}> ${earthquake.reportContent.substring(11)}`;
      return { content, components: [] };
    }

    case 1: {
      const desc = `**[${earthquake.earthquakeNo == 111000 ? "小區域" : earthquake.earthquakeNo}]** <t:${~~(time.getTime() / 1000)}>\n${earthquake.reportContent.substring(11)}`;
      const embed = new EmbedBuilder()
        .setColor(colors[earthquake.reportColor])
        .setAuthor({ name: "地震報告", iconURL: "https://i.imgur.com/qIxk1H1.png" })
        .setThumbnail(cwb_image)
        .setDescription(desc)
        .setFooter({ text: "交通部中央氣象局", iconURL: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/ROC_Central_Weather_Bureau.svg/1200px-ROC_Central_Weather_Bureau.svg.png" })
        .setTimestamp(time);

      return { embeds: [embed], components: [url] };
    }

    case 2: {
      const desc = `**[${earthquake.earthquakeNo == 111000 ? "小區域" : earthquake.earthquakeNo}]** <t:${~~(time.getTime() / 1000)}>\n${earthquake.reportContent.substring(11)}`;
      const embed = new EmbedBuilder()
        .setColor(colors[earthquake.reportColor])
        .setAuthor({ name: "地震報告", iconURL: "https://i.imgur.com/qIxk1H1.png" })
        .setImage(cwb_image)
        .setDescription(desc)
        .setFooter({ text: "交通部中央氣象局", iconURL: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/ROC_Central_Weather_Bureau.svg/1200px-ROC_Central_Weather_Bureau.svg.png" })
        .setTimestamp(time);

      return { embeds: [embed], components: [url] };
    }

    case 3: {
      const desc = stripIndents`
        **編號：**${earthquake.earthquakeNo == 111000 ? "無（小區域有感地震）" : earthquake.earthquakeNo}
        **日期：**<t:${~~(time.getTime() / 1000)}:D>
        **時間：**<t:${~~(time.getTime() / 1000)}:T>
        **震央：**${earthquake.earthquakeInfo.epiCenter.location.replace("(", "（").replace(")", "）").split("（").join("\n（　　　")}
        **深度：**${earthquake.earthquakeInfo.depth.value} 公里
        **規模：**芮氏 ${earthquake.earthquakeInfo.magnitude.magnitudeValue}`;

      const embed = new EmbedBuilder()
        .setColor(colors[earthquake.reportColor])
        .setAuthor({ name: "地震報告", iconURL: "https://i.imgur.com/qIxk1H1.png" })
        .setImage(cwb_image)
        .setDescription(desc)
        .setFooter({ text: "交通部中央氣象局", iconURL: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/ROC_Central_Weather_Bureau.svg/1200px-ROC_Central_Weather_Bureau.svg.png" })
        .setTimestamp(time);

      earthquake.intensity.shakingArea
        .filter(v => !v.infoStatus)
        .sort((a, b) => b.areaIntensity.value - a.areaIntensity.value)
        .forEach(shakingArea => embed.addFields({ name: shakingArea.areaDesc, value: shakingArea.areaName }));

      return { embeds: [embed], components: [url] };
    }

    case 4: {
      const desc = `<t:${~~(time.getTime() / 1000)}>\n${earthquake.reportContent.substring(11)}`;

      const embed = new EmbedBuilder()
        .setColor(colors[earthquake.reportColor])
        .setAuthor({ name: "地震報告", iconURL: "https://i.imgur.com/qIxk1H1.png" })
        .setURL(cwb_url)
        .setImage(cwb_image)
        .setDescription(desc)
        .setFields(
          ...[
            { name: "編號", value: `${earthquake.earthquakeNo == 111000 ? "無（小區域有感地震）" : earthquake.earthquakeNo}`, inline: true },
            { name: "時間", value: `<t:${~~(time.getTime() / 1000)}:D><t:${~~(time.getTime() / 1000)}:T>`, inline: true },
            { name: "深度", value: `${depthE[depthI]}**${earthquake.earthquakeInfo.depth.value}** 公里 \`(${depthTW[depthI]})\``, inline: true },
            { name: "規模", value: `${magnitudeE[magnitudeI]}芮氏 **${earthquake.earthquakeInfo.magnitude.magnitudeValue}** \`(${magnitudeTW[magnitudeI]})\``, inline: true },
            { name: "震央", value: `${earthquake.earthquakeInfo.epiCenter.location.replace("(", "（").replace(")", "）").split("（").join("\n（")}` },
          ],
        )
        .setFooter({ text: "交通部中央氣象局", iconURL: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/ROC_Central_Weather_Bureau.svg/1200px-ROC_Central_Weather_Bureau.svg.png" })
        .setTimestamp(time);

      earthquake.intensity.shakingArea
        .filter(v => !v.infoStatus)
        .sort((a, b) => b.areaIntensity.value - a.areaIntensity.value)
        .forEach(shakingArea => embed.addFields({ name: shakingArea.areaDesc, value: shakingArea.areaName }));

      return { embeds: [embed], components: [url] };
    }

    case 5: {
      const desc = `<t:${~~(time.getTime() / 1000)}>\n${earthquake.reportContent.substring(11)}`;
      const embeds = [];
      const embed = new EmbedBuilder()
        .setColor(colors[earthquake.reportColor])
        .setAuthor({ name: "地震報告", iconURL: "https://i.imgur.com/qIxk1H1.png" })
        .setURL(cwb_url)
        .setImage(cwb_image)
        .setDescription(desc)
        .setFields(
          ...[
            { name: "編號", value: `${earthquake.earthquakeNo == 111000 ? "無（小區域有感地震）" : earthquake.earthquakeNo}`, inline: true },
            { name: "時間", value: `<t:${~~(time.getTime() / 1000)}:D>\n<t:${~~(time.getTime() / 1000)}:T>\n<t:${~~(time.getTime() / 1000)}:R>`, inline: true },
            { name: "震央位置", value: `${earthquake.earthquakeInfo.epiCenter.location.replace("(", "（").replace(")", "）").split("（").join("\n（")}`, inline: true },
            { name: "震央經緯", value: `北緯 **${earthquake.earthquakeInfo.epiCenter.epiCenterLat.value}** 度\n東經 **${earthquake.earthquakeInfo.epiCenter.epiCenterLon.value}**   度`, inline: true },
            { name: "深度", value: `${depthE[depthI]} **${earthquake.earthquakeInfo.depth.value}** 公里\n　 ${depthTW[depthI]}`, inline: true },
            { name: "規模", value: `${magnitudeE[magnitudeI]} 芮氏 **${earthquake.earthquakeInfo.magnitude.magnitudeValue}**\n　 ${magnitudeTW[magnitudeI]}`, inline: true },
          ],
        )
        .setFooter({ text: "交通部中央氣象局", iconURL: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/ROC_Central_Weather_Bureau.svg/1200px-ROC_Central_Weather_Bureau.svg.png" })
        .setTimestamp(time);

      earthquake.intensity.shakingArea
        .filter(v => !v.infoStatus)
        .sort((a, b) => b.areaIntensity.value - a.areaIntensity.value)
        .forEach(shakingArea => embed.addFields({ name: shakingArea.areaDesc, value: shakingArea.areaName }));

      const shakemap = new EmbedBuilder()
        .setURL(cwb_url)
        .setImage(earthquake.shakemapImageURI);

      const pgvmap = new EmbedBuilder()
        .setURL(cwb_url)
        .setImage(`https://www.cwb.gov.tw/Data/earthquake/zip/${cwb_codeY}/${time.getFullYear()}${earthquake.earthquakeNo.toString().substring(3)}v.png`);

      const pgamap = new EmbedBuilder()
        .setURL(cwb_url)
        .setImage(`https://www.cwb.gov.tw/Data/earthquake/zip/${cwb_codeY}/${time.getFullYear()}${earthquake.earthquakeNo.toString().substring(3)}a.png`);

      embeds.push(embed);

      if (earthquake.shakemapImageURI)
        embeds.push(shakemap);
      embeds.push(pgvmap, pgamap);
      return { embeds, components: [url] };
    }
  }
}

module.exports = formatEarthquake;

/**
 * @typedef {object} Earthquake
 * @property {number} earthquakeNo
 * @property {string} reportType
 * @property {string} reportColor
 * @property {string} reportContent
 * @property {string} reportImageURI
 * @property {string} reportRemark
 * @property {string} web
 * @property {string} shakemapImageURI
 * @property {earthquakeInfo} earthquakeInfo
 * @property {intensity} intensity
 */

/**
 * @typedef {object} earthquakeInfo
 * @property {string} originTime
 * @property {string} source
 * @property {depth} depth
 * @property {epiCenter} epiCenter
 * @property {magnitude} magnitude
 */

/**
 * @typedef {object} depth
 * @property {number} value
 * @property {string} unit
 */

/**
 * @typedef {object} epiCenter
 * @property {string} location
 * @property {epiCenterLat} epiCenterLat
 * @property {epiCenterLon} epiCenterLon
 */

/**
 * @typedef {object} epiCenterLat
 * @property {number} value
 * @property {string} unit
 */

/**
 * @typedef {object} epiCenterLon
 * @property {string} unit
 * @property {number} value
 */

/**
 * @typedef {object} magnitude
 * @property {string} magnitudeType
 * @property {number} magnitudeValue
 */

/**
 * @typedef {object} intensity
 * @property {shakingArea[]} shakingArea
 */

/**
 * @typedef {object} shakingArea
 * @property {string} areaDesc
 * @property {string} areaName
 * @property {string} infoStatus
 * @property {areaIntensity} areaIntensity
 * @property {eqStation[]} eqStation
 */

/**
 * @typedef {object} areaIntensity
 * @property {number} value
 * @property {string} unit
 */

/**
 * @typedef {object} eqStation
 * @property {string} stationName
 * @property {string} stationCode
 * @property {string} infoStatus
 * @property {azimuth} azimuth
 * @property {distance} distance
 * @property {pga} pga
 * @property {pgv} pgv
 * @property {stationIntensity} stationIntensity
 * @property {stationLat} stationLat
 * @property {stationLon} stationLon
 * @property {string} waveImageURI
 */

/**
 * @typedef {object} azimuth
 * @property {number} value
 * @property {string} unit
 */

/**
 * @typedef {object} distance
 * @property {string} unit
 * @property {number} value
 */

/**
 * @typedef {object} pga
 * @property {number} ewComponent
 * @property {number} nsComponent
 * @property {number} vComponent
 * @property {number} intScaleValue
 * @property {string} unit
 */

/**
 * @typedef {object} pgv
 * @property {number} ewComponent
 * @property {number} nsComponent
 * @property {number} vComponent
 * @property {number} intScaleValue
 * @property {string} unit
 */

/**
 * @typedef {object} stationIntensity
 * @property {number} value
 * @property {string} unit
 */

/**
 * @typedef {object} stationLat
 * @property {number} value
 * @property {string} unit
 */

/**
 * @typedef {object} stationLon
 * @property {number} value
 * @property {string} unit
 */