import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { VideoQualityMode } from 'discord.js';

export const guildVoiceChannel = sqliteTable('guild_voiceChannel', {
  guildId: text('guildId').notNull(),
  channelId: text('channelId').primaryKey(),
  categoryId: text('categoryId'),
  name: text('name'),
  limit: integer('limit').notNull().default(0),
  bitrate: integer('bitrate').notNull().default(64000),
  region: text('region'),
  videoQuality: integer('videoQuality')
    .notNull()
    .default(VideoQualityMode.Auto),
  slowMode: integer('slowMode').notNull().default(0),
  nsfw: integer('nsfw', { mode: 'boolean' }).notNull().default(false),
});
