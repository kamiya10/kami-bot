import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { guild } from '.';
import { relations } from 'drizzle-orm';

export const rtsChannel = sqliteTable('rtsChannel', {
  guildId: text('guildId').references(() => guild.id),
  channelId: text('channelId').primaryKey(),
  autoDelete: integer('autoDelete', { mode: 'boolean' }),
});

export const rtsChannelRelations = relations(rtsChannel, ({ one }) => ({
  guildId: one(guild, {
    fields: [rtsChannel.guildId],
    references: [guild.id],
  }),
}));
