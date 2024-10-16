import { PermissionFlagsBits } from 'discord.js';

import type { Channel, GuildMember } from 'discord.js';

export const canSend = (client: GuildMember, channel: Channel) => {
  if (!channel.isSendable()) return false;
  if (channel.isDMBased()) return true;

  return channel.permissionsFor(client).has(PermissionFlagsBits.SendMessages);
};
