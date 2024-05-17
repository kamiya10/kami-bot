import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, EmbedBuilder, Locale, time as timestamp, TimestampStyles, type MessageCreateOptions } from "discord.js";
import i18next from "i18next";
import { EarthquakeReportColor, type EarthquakeReport } from "../api/cwa";

export const $at = (key: string): Record<Locale, string> =>
  ([Locale.Japanese, Locale.ChineseTW] as const)
    .reduce((msg, lng) => {
      msg[lng] = i18next.t(key, { lng });
      return msg;
    }, <Record<Locale, string>>{});


const reportColor = {
  [EarthquakeReportColor.Green]: Colors.Green,
  [EarthquakeReportColor.Yellow]: Colors.Yellow,
  [EarthquakeReportColor.Orange]: Colors.Orange,
  [EarthquakeReportColor.Red]: Colors.Red,
};

export const buildEarthquakeReportMessage = (report: EarthquakeReport, style: string = "cwa-simple"): MessageCreateOptions => {
  const time = timestamp(new Date(report.EarthquakeInfo.OriginTime), TimestampStyles.LongDateTime);
  const relative = timestamp(new Date(report.EarthquakeInfo.OriginTime), TimestampStyles.RelativeTime);
  const type = report.EarthquakeNo % 1000 ? "Earthquake.EarthquakeNo" : "小區域";
  const author = {
    name: "地震報告",
    iconURL: "https://i.imgur.com/qIxk1H1.png"
  };
  const footer = {
    text: "交通部中央氣象署",
    iconURL: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/ROC_Central_Weather_Bureau.svg/1200px-ROC_Central_Weather_Bureau.svg.png"
  };
  const content = report.ReportContent.slice(11);
  const embed = new EmbedBuilder().setColor(reportColor[report.ReportColor]);

  switch (style) {
    case "cwa-text":
      return {
        content: `**[${type}]** ${time} ${content}`
      };

    /**
     * **[小區域]** 2024年5月17日 13:30
     * 花蓮縣近海發生規模3.6有感地震，最大震度花蓮縣鹽寮、花蓮縣花蓮市、南投縣合歡山1級。
     */
    case "cwa-simple":
      embed
        .setAuthor(author)
        .setDescription(`**[${type}]** ${time}\n${content}`)
        .setThumbnail(report.ReportImageURI)
        .setFooter(footer);
      break;

    default:
      break;
  }


  const actions = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setLabel("地震報告")
        .setURL(report.cwaUrl),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setLabel("地震測報中心")
        .setURL(report.Web),
    );

  return {
    embeds: [embed],
    components: [actions],
  };
};
