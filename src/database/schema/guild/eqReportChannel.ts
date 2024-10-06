import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const guildEqReportChannel = sqliteTable('guild_eqReportChannel', {
  guildId: text('guildId').primaryKey(),
  channelId: text('channelId').notNull(),
  style: integer('style').default(0),
});
