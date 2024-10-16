import { Colors, EmbedBuilder, MessageFlags } from 'discord.js';
import { EventHandler } from '@/class/event';
import { canSend } from '@/utils/permission';

import type { MessageCreateOptions, MessagePayload } from 'discord.js';

export default new EventHandler({
  event: 'voiceStateUpdate',
  on(oldState, newState) {
    const me = newState.guild.members.me;
    const member = newState.member;

    if (!member || member.user.bot || !me) return;

    const embed = new EmbedBuilder()
      .setTimestamp();

    const payload = {
      embeds: [embed],
      flags: MessageFlags.SuppressNotifications,
    } satisfies MessagePayload | MessageCreateOptions;

    // join voice channel
    if (!oldState.channel && newState.channel) {
      if (!canSend(me, newState.channel)) return;

      embed
        .setColor(Colors.Green)
        .setDescription(`📥 ${newState.member}`);

      newState.channel
        .send(payload)
        .catch((e) => void e);
      return;
    }

    // leave voice channel
    if (oldState.channel && !newState.channel) {
      if (!canSend(me, oldState.channel)) return;

      embed
        .setColor(Colors.Red)
        .setDescription(`📤 ${oldState.member}`);

      oldState.channel
        .send(payload)
        .catch((e) => void e);
      return;
    }

    // switch voice channel
    if (oldState.channel && newState.channel && oldState.channel.id != newState.channel.id) {
      if (!canSend(me, oldState.channel)) return;
      if (!canSend(me, newState.channel)) return;

      embed
        .setColor(Colors.Blue)
        .setDescription(`🔄️ ${newState.member} (📤 ➜ ${newState.channel})`);

      oldState.channel
        .send(payload)
        .catch((e) => void e);

      embed
        .setColor(Colors.Blue)
        .setDescription(`🔄️ ${newState.member} (${oldState.channel} ➜ 📥)`);

      newState.channel
        .send(payload)
        .catch((e) => void e);

      return;
    }
  },
});
