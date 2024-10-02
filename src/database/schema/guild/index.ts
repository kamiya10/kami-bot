import { relations } from 'drizzle-orm';
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { eqReportChannel } from './eqReportChannel';

export const guild = sqliteTable('guild', {
  id: text('id').primaryKey(),
});

export const guildRelations = relations(guild, ({ many }) => ({
  eqReportChannel: many(eqReportChannel),
}));
