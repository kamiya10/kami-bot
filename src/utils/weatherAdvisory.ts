import { Colors, EmbedBuilder, TimestampStyles, blockQuote, time } from 'discord.js';
import { HazardSignificance } from '@/api/cwa/weatherAdvisory';

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

export const buildWeatherAdvisoryMessage = (
  wa: WeatherAdvisory,
  style: WeatherAdvisoryMessageStyle = WeatherAdvisoryMessageStyle.Simple,
): MessageCreateOptions & MessageEditOptions => {
  const embed = new EmbedBuilder()
    .setColor(getAdvisoryColor(wa))
    .setAuthor({ name: wa.description });

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
            value: `${start} (${startRelative})`,
            inline: true,
          },
          {
            name: '失效時間',
            value: `${end} (${endRelative})`,
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
            value: `${start} (${startRelative})`,
            inline: true,
          },
          {
            name: '失效時間',
            value: `${end} (${endRelative})`,
            inline: true,
          },
        ); ;
      break;
  }

  return {
    embeds: [embed],
  };
};
