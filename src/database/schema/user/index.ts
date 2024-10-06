import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { userVoiceChannel } from './voiceChannel';
import { relations } from 'drizzle-orm';

export const user = sqliteTable('user', {
  id: text('id').primaryKey(),
});

export const userRelations = relations(user, ({ one }) => ({
  voiceChannel: one(userVoiceChannel, {
    fields: [user.id],
    references: [userVoiceChannel.userId],
  }),
}));
