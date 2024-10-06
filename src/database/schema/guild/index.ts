import { relations } from 'drizzle-orm';
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { guildEqReportChannel } from './eqReportChannel';
import { guildVoiceChannel } from './voiceChannel';
import { guildRtsChannel } from './rtsChannel';

export const guild = sqliteTable('guild', {
  id: text('id').primaryKey(),
});

export const guildRelations = relations(guild, ({ many, one }) => ({
  rtsChannel: one(guildRtsChannel, {
    fields: [guild.id],
    references: [guildRtsChannel.channelId],
  }),
  eqReportChannel: one(guildEqReportChannel, {
    fields: [guild.id],
    references: [guildEqReportChannel.channelId],
  }),
  voiceChannel: many(guildVoiceChannel),
}));
