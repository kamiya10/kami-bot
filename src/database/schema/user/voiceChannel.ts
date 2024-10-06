import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { user } from '.';

export const userVoiceChannel = sqliteTable('user_voiceChannel', {
  userId: text('userId').references(() => user.id),
  name: text('name'),
  bitrate: integer('bitrate'),
  limit: integer('limit'),
  region: text('region'),
  videoQuality: integer('videoQuality'),
  slowMode: integer('slowMode'),
  nsfw: integer('nsfw', { mode: 'boolean' }),
});

export const userVoiceChannelRelations = relations(
  userVoiceChannel,
  ({ one }) => ({
    userId: one(user, {
      fields: [userVoiceChannel.userId],
      references: [user.id],
    }),
  }),
);
