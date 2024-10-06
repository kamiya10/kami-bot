import {
  ChannelType,
  EmbedBuilder,
  SlashCommandChannelOption,
  SlashCommandSubcommandBuilder,
} from 'discord.js';
import { $at } from '@/class/utils';

import type { KamiSubCommand } from '@/class/command';
import { guildVoiceChannel } from '@/database/schema';
import { eq } from 'drizzle-orm';

export default {
  builder: new SlashCommandSubcommandBuilder()
    .setName('remove')
    .setNameLocalizations($at('slash:voice.server.remove.$name'))
    .setDescription(
      'Remove a voice channel from being a temporary voice channel creator.',
    )
    .setDescriptionLocalizations($at('slash:voice.server.remove.$desc'))
    .addChannelOption(
      new SlashCommandChannelOption()
        .setName('channel')
        .setNameLocalizations(
          $at('slash:voice.server.remove.%channel.$name'),
        )
        .setDescription(
          'The channel to remove from being a temporary voice channel creator.',
        )
        .setDescriptionLocalizations(
          $at('slash:voice.server.remove.%channel.$desc'),
        )
        .addChannelTypes(ChannelType.GuildVoice)
        .setRequired(true),
    ),
  async execute(interaction) {
    const channel = interaction.options.getChannel<ChannelType.GuildVoice>(
      'channel',
      true,
    );

    await this.database
      .delete(guildVoiceChannel)
      .where(eq(guildVoiceChannel.channelId, channel.id));

    const embed = new EmbedBuilder().setDescription(
      `已將 ${channel} 從語音頻道中移除`,
    );

    await interaction.editReply({
      embeds: [embed],
    });
  },
} as KamiSubCommand;
