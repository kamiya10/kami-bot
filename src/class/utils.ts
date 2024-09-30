import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Colors,
  EmbedBuilder,
  Locale,
  TimestampStyles,
  time as timestamp,
} from 'discord.js';
import { EarthquakeReportColor } from '@/api/cwa';

import i18next from 'i18next';

import type { InteractionReplyOptions, MessageCreateOptions } from 'discord.js';
import type { EarthquakeReport } from '@/api/cwa';

export const $at = (key: string): Record<Locale, string> =>
  ([Locale.Japanese, Locale.ChineseTW] as const)
    .reduce((msg, lng) => {
      msg[lng] = i18next.t(key, key, { lng });
      return msg;
    }, ({} as Record<Locale, string>));

const reportColor = {
  [EarthquakeReportColor.Green]: Colors.Green,
  [EarthquakeReportColor.Yellow]: Colors.Yellow,
  [EarthquakeReportColor.Orange]: Colors.Orange,
  [EarthquakeReportColor.Red]: Colors.Red,
};

const intensityThumbnail = [
  null,
  'https://i.imgur.com/CCOJNVJ.png',
  'https://i.imgur.com/5kIjOZu.png',
  'https://i.imgur.com/70Xw6Hr.png',
  'https://i.imgur.com/JCWivZ9.png',
  'https://i.imgur.com/5UkRVPO.png',
  'https://i.imgur.com/CetfQEn.png',
  'https://i.imgur.com/I77vToX.png',
  'https://i.imgur.com/zYFj64D.png',
  'https://i.imgur.com/SNsfr5g.png',
] as const;

export const buildEarthquakeReportMessage = (report: EarthquakeReport, style = 'cwa-simple'): MessageCreateOptions & InteractionReplyOptions => {
  const time = timestamp(new Date(report.EarthquakeInfo.OriginTime), TimestampStyles.LongDateTime);
  // const relative = timestamp(new Date(report.EarthquakeInfo.OriginTime), TimestampStyles.RelativeTime);
  const type = report.EarthquakeNo % 1000 ? 'Earthquake.EarthquakeNo' : '小區域';
  const author = {
    name: '地震報告',
    iconURL: 'https://i.imgur.com/qIxk1H1.png',
  };
  const footer = {
    text: '交通部中央氣象署',
    iconURL: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/ROC_Central_Weather_Bureau.svg/1200px-ROC_Central_Weather_Bureau.svg.png',
  };
  const content = report.ReportContent.slice(11);
  const embed = new EmbedBuilder().setColor(reportColor[report.ReportColor]);

  switch (style) {
    /**
     * **[小區域]** 2024年5月17日 13:30
     * 花蓮縣近海發生規模3.6有感地震，最大震度花蓮縣鹽寮、花蓮縣花蓮市、南投縣合歡山1級。
     */
    case 'cwa-text':
      return {
        content: `**[${type}]** ${time} ${content}`,
      };

    /**
     * Embed
     *
     *   ■ 地震報告
     *
     *   **[小區域]** 2024年5月17日 13:30
     *   花蓮縣近海發生規模3.6有感地震，最大震度花蓮縣鹽寮、花蓮
     *   縣花蓮市、南投縣合歡山1級。
     *
     *   ■ 交通部中央氣象署 - 2024/05/17 13:30
     */
    case 'cwa-simple':
      embed
        .setAuthor(author)
        .setDescription(`**[${type}]** ${time}\n${content}`)
        .setThumbnail(report.ReportImageURI)
        .setFooter(footer);
      break;

    case 'cwa-simple-large':
      embed
        .setAuthor(author)
        .setDescription(`**[${type}]** ${time}\n${content}`)
        .setImage(report.ReportImageURI)
        .setFooter(footer);
      break;

    case 'cwa-detail':
      embed
        .setAuthor(author)
        .setDescription(`**[${type}]** ${time}\n${content}`)
        .setImage(report.ReportImageURI)
        .setFooter(footer);
      break;

    case 'simple':
      embed
        .setAuthor(author)
        .setDescription(`${time}\n${content.replace('，', '，\n')}`)
        .setFields(
          {
            name: '震源位置',
            value: content.split('發生')[0],
            inline: true,
          },
          {
            name: '規模',
            value: `M${report.EarthquakeInfo.EarthquakeMagnitude.MagnitudeValue}`,
            inline: true,
          },
          {
            name: '深度',
            value: `${report.EarthquakeInfo.FocalDepth}km`,
            inline: true,
          },
        )
        .setThumbnail(intensityThumbnail[report.intensity]);
      break;

    default:
      break;
  }

  const actions = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setLabel('地震報告')
        .setURL(report.cwaUrl),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setLabel('地震測報中心')
        .setURL(report.Web),
    );

  return {
    embeds: [embed],
    components: [actions],
  };
};
