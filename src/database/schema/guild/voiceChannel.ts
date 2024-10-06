import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { VideoQualityMode } from 'discord.js';
import { guild } from '.';
import { relations } from 'drizzle-orm';

export const guildVoiceChannel = sqliteTable('guild_voiceChannel', {
  guildId: text('guildId').references(() => guild.id),
  channelId: text('channelId').primaryKey(),
  categoryId: text('categoryId'),
  name: text('name'),
  bitrate: integer('bitrate').notNull().default(64000),
  limit: integer('limit').notNull().default(0),
  region: text('region'),
  videoQuality: integer('videoQuality').notNull().default(VideoQualityMode.Auto),
  slowMode: integer('slowMode').notNull().default(0),
  nsfw: integer('nsfw', { mode: 'boolean' }).notNull().default(false),
});

export const guildVoiceChannelRelations = relations(
  guildVoiceChannel,
  ({ one }) => ({
    guildId: one(guild, {
      fields: [guildVoiceChannel.guildId],
      references: [guild.id],
    }),
  }),
);
