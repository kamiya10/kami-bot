import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, EmbedBuilder, TimestampStyles, blockQuote, time } from 'discord.js';
import { HazardPhenomena, HazardSignificance } from '@/api/cwa/weatherAdvisory';

import type { MessageCreateOptions, MessageEditOptions } from 'discord.js';
import type { WeatherAdvisory } from '@/api/cwa/weatherAdvisory';

export enum WeatherAdvisoryMessageStyle {
  Text = 'text',
  Simple = 'simple',
  Detailed = 'detail',
}

export const getAdvisoryColor = (wa: WeatherAdvisory) => {
  switch (wa.description.slice(-2) as HazardSignificance) {
    case HazardSignificance.Warning: return Colors.Yellow;
    case HazardSignificance.Advisory: return Colors.Red;
  }

  return Colors.Blue;
};

export const getAdvisoryUrl = (wa: WeatherAdvisory) => {
  switch (wa.phenomena) {
    case HazardPhenomena.Typhoon:
      return 'https://www.cwa.gov.tw/V8/C/P/Typhoon/TY_NEWS.html';

    case HazardPhenomena.HeavyRain:
    case HazardPhenomena.ExtremelyHeavyRain:
    case HazardPhenomena.TorrentialRain:
    case HazardPhenomena.ExtremelyTorrentialRain:
      return 'https://www.cwa.gov.tw/V8/C/P/Warning/W26.html';

    case HazardPhenomena.DenseFog:
      return 'https://www.cwa.gov.tw/V8/C/P/Warning/W27.html';

    case HazardPhenomena.Swell:
      return 'https://www.cwa.gov.tw/V8/C/P/Warning/W37.html';
  }

  return 'https://www.cwa.gov.tw/V8/C/P/Warning/FIFOWS.html';
};

export const buildWeatherAdvisoryMessage = (
  wa: WeatherAdvisory,
  style: WeatherAdvisoryMessageStyle = WeatherAdvisoryMessageStyle.Simple,
): MessageCreateOptions & MessageEditOptions => {
  const embed = new EmbedBuilder()
    .setColor(getAdvisoryColor(wa))
    .setAuthor({ name: wa.description });

  const row = new ActionRowBuilder();

  const start = time(wa.startTime, TimestampStyles.LongDateTime);
  const startRelative = time(wa.startTime, TimestampStyles.RelativeTime);
  const end = time(wa.endTime, TimestampStyles.LongDateTime);
  const endRelative = time(wa.endTime, TimestampStyles.RelativeTime);

  if (style == WeatherAdvisoryMessageStyle.Text) {
    return {
      content: [
        `[${start} ➜ ${end}] **${wa.description}**`,
        blockQuote(wa.content),
      ].join('\n'),
    };
  }

  switch (style) {
    case WeatherAdvisoryMessageStyle.Simple:
      embed
        .setDescription(wa.content)
        .addFields(
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
      embed
        .setDescription(wa.content)
        .addFields(
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
        ); ;
      break;
  }

  row.addComponents(new ButtonBuilder()
    .setStyle(ButtonStyle.Link)
    .setURL(getAdvisoryUrl(wa))
    .setEmoji('🔗')
    .setLabel('警特報連結'),
  );

  return {
    embeds: [embed],
  };
};
