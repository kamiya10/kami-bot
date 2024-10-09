import { ReportMessageStyle } from '@/utils/report';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const guildEqReportChannel = sqliteTable('guild_eqReportChannel', {
  guildId: text('guildId').primaryKey(),
  channelId: text('channelId').notNull(),
  numbered: integer('numbered', { mode: 'boolean' }).notNull().default(true),
  style: text('style').notNull().default(ReportMessageStyle.CwaSimple),
});
