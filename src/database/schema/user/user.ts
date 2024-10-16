import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const user = sqliteTable('user', {
  id: text('id').primaryKey(),
  trackVoiceActivity: integer('trackVoiceActivity', { mode: 'boolean' }).default(true),
});
