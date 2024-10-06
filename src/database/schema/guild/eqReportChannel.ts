import { relations } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { guild } from '.';

export const guildEqReportChannel = sqliteTable('guild_eqReportChannel', {
  guildId: text('guildId')
    .primaryKey()
    .references(() => guild.id),
  channelId: text('channelId').notNull(),
  style: integer('style').default(0),
});

export const guildEqReportChannelRelations = relations(
  guildEqReportChannel,
  ({ one }) => ({
    guildId: one(guild, {
      fields: [guildEqReportChannel.guildId],
      references: [guild.id],
    }),
  }),
);
