import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const guildRtsChannel = sqliteTable('guild_rtsChannel', {
  guildId: text('guildId').primaryKey(),
  channelId: text('channelId').notNull(),
  autoDelete: integer('autoDelete', { mode: 'boolean' }),
});
