import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { guild } from '.';
import { relations } from 'drizzle-orm';

export const voiceChannel = sqliteTable('voiceChannel', {
  guildId: text('guildId').references(() => guild.id),
  channelId: text('channelId').primaryKey(),
  categoryId: text('categoryId'),
  name: text('name'),
  bitrate: integer('bitrate').default(64000),
  limit: integer('limit').default(0),
});

export const voiceChannelRelations = relations(voiceChannel, ({ one }) => ({
  guildId: one(guild, {
    fields: [voiceChannel.guildId],
    references: [guild.id],
  }),
}));
