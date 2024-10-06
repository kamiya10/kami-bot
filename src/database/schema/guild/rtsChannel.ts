import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { guild } from '.';
import { relations } from 'drizzle-orm';

export const guildRtsChannel = sqliteTable('guild_rtsChannel', {
  guildId: text('guildId')
    .primaryKey()
    .references(() => guild.id),
  channelId: text('channelId').notNull(),
  autoDelete: integer('autoDelete', { mode: 'boolean' }),
});

export const guildRtsChannelRelations = relations(
  guildRtsChannel,
  ({ one }) => ({
    guildId: one(guild, {
      fields: [guildRtsChannel.guildId],
      references: [guild.id],
    }),
  }),
);
