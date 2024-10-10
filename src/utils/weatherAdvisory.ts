import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  TimestampStyles,
  blockQuote,
  time,
} from 'discord.js';
import type { MessageCreateOptions, MessageEditOptions } from 'discord.js';
import type { Advisory } from '@/api/cwa/advisory';

export enum WeatherAdvisoryMessageStyle {
  Text = 'text',
  Simple = 'simple',
  Detailed = 'detail',
}

export const getAdvisoryUrl = (advisory: Advisory) => {
  switch (advisory.type) {
    case 'TY_NEWS':
    case 'TY_WARN':
    case 'TY_WIND':
      return `https://www.cwa.gov.tw/V8/C/P/Typhoon/${advisory.type}.html`;

    case 'PWS':
      return `https://www.cwa.gov.tw/V8/C/P/PWS/PWS.html`;

    case 'EQ':
      return `https://www.cwa.gov.tw/V8/C/E/index.html`;

    default:
      return `https://www.cwa.gov.tw/V8/C/P/Warning/${advisory.type}.html`;
  }
};

export const buildWeatherAdvisoryMessage = (
  advisory: Advisory,
  style: WeatherAdvisoryMessageStyle = WeatherAdvisoryMessageStyle.Simple,
): MessageCreateOptions & MessageEditOptions => {
  const embed = new EmbedBuilder()
    .setColor(advisory.color)
    .setAuthor({ name: advisory.name });

  const row = new ActionRowBuilder();

  const start = time(advisory.from, TimestampStyles.LongDateTime);
  const startRelative = time(advisory.from, TimestampStyles.RelativeTime);
  const end = time(advisory.to, TimestampStyles.LongDateTime);
  const endRelative = time(advisory.to, TimestampStyles.RelativeTime);

  if (style == WeatherAdvisoryMessageStyle.Text) {
    return {
      content: [
        `[${start} ➜ ${end}] **${advisory.content}**`,
        blockQuote(advisory.content),
      ].join('\n'),
    };
  }

  switch (style) {
    case WeatherAdvisoryMessageStyle.Simple:
      embed.setDescription(advisory.content).addFields(
        {
          name: '生效時間',
          value: `${start}\n(${startRelative})`,
          inline: true,
        },
        {
          name: '失效時間',
          value: `${end}\n(${endRelative})`,
          inline: true,
        },
      );
      break;

    case WeatherAdvisoryMessageStyle.Detailed:
      embed.setDescription(advisory.content).addFields(
        {
          name: '生效時間',
          value: `${start}\n(${startRelative})`,
          inline: true,
        },
        {
          name: '失效時間',
          value: `${end}\n(${endRelative})`,
          inline: true,
        },
      );
      break;
  }

  row.addComponents(
    new ButtonBuilder()
      .setStyle(ButtonStyle.Link)
      .setURL(getAdvisoryUrl(advisory))
      .setEmoji('🔗')
      .setLabel('警特報連結'),
  );

  return {
    embeds: [embed],
  };
};
