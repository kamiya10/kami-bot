import { relations } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { guild } from '.';

export const eqReportChannel = sqliteTable('eqReportChannel', {
  guildId: text('guildId').references(() => guild.id),
  channelId: text('channelId').primaryKey(),
  style: integer('style').default(0),
});

export const eqReportChannelRelations = relations(eqReportChannel, ({ one }) => ({
  guildId: one(guild, {
    fields: [eqReportChannel.guildId],
    references: [guild.id],
  }),
}));
