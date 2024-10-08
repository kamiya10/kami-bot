import { WeatherAdvisoryMessageStyle } from '@/utils/weatherAdvisory';
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const guildWeatherAdvisoryChannel = sqliteTable('guild_weatherAdvisoryChannel', {
  guildId: text('guildId').primaryKey(),
  channelId: text('channelId').notNull(),
  style: text('style').notNull().default(WeatherAdvisoryMessageStyle.Simple),
});
