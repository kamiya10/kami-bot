import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const userVoiceChannel = sqliteTable('user_voiceChannel', {
  userId: text('userId').primaryKey(),
  name: text('name'),
  limit: integer('limit'),
  bitrate: integer('bitrate'),
  region: text('region'),
  videoQuality: integer('videoQuality'),
  slowMode: integer('slowMode'),
  nsfw: integer('nsfw', { mode: 'boolean' }),
});
