import { EventHandler } from '@/class/event';
import { EmbedBuilder, messageLink } from 'discord.js';

import type { Guild, Message, TextBasedChannel } from 'discord.js';
import type { KamiClient } from '@/class/client';

const messageLinkRegex = /https:\/\/(?:ptb|canary)?\.?discord\.com\/channels\/(\d*)\/(\d*)\/(\d*)/;

const parseMessageLink = async function (this: KamiClient, url: string): Promise<[guild: Guild, channel: TextBasedChannel, mentioned: Message<true>] | null> {
  const result = messageLinkRegex.exec(url);

  if (!result || result.length != 3) return null;

  const guild = this.guilds.cache.get(result[0]);
  if (!guild) return null;

  const channel = guild.channels.cache.get(result[1]);
  if (!channel?.isTextBased()) return null;

  const message = channel.messages.cache.get(result[2])
    ?? await channel.messages.fetch({
      message: result[2],
    });
  if (!message) return null;

  return [guild, channel, message];
};

export default new EventHandler({
  event: 'messageCreate',
  async on(message) {
    if (!message.inGuild()) return;
    if (!message.content) return;

    const link = messageLink(message.channel.id, message.id, message.guild.id);
    const result = await parseMessageLink.call(this, link);

    if (!result) return;

    const [guild, channel, mentioned] = result;

    const embed = new EmbedBuilder()
      .setDescription(mentioned.content)
      .setColor(mentioned.member!.displayColor);

    await message.reply({
      embeds: [embed, ...mentioned.embeds],
      allowedMentions: {
        parse: [],
      },
    });
  },
});
