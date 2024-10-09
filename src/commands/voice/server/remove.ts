import {
  ChannelType,
  Colors,
  EmbedBuilder,
  SlashCommandChannelOption,
  SlashCommandSubcommandBuilder,
} from 'discord.js';
import { $at } from '@/class/utils';
import { t as $t } from 'i18next';
import { eq } from 'drizzle-orm';
import { guildVoiceChannel } from '@/database/schema';

import type { KamiSubCommand } from '@/class/command';

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
        .setNameLocalizations($at('slash:voice.server.remove.%channel.$name'))
        .setDescription(
          'The channel to remove from being a temporary voice channel creator.',
        )
        .setDescriptionLocalizations(
          $at('slash:voice.server.remove.%channel.$desc'),
        )
        .addChannelTypes(ChannelType.GuildVoice)
        .setRequired(true),
    ),
  async execute(interaction, embed) {
    const channel = interaction.options.getChannel<ChannelType.GuildVoice>(
      'channel',
      true,
    );

    const deleted = await this.database
      .delete(guildVoiceChannel)
      .where(eq(guildVoiceChannel.channelId, channel.id))
      .returning();
    if (deleted.length) {
      embed
        .setColor(Colors.Green)
        .setDescription(
          $t('voice:remove_success', {
            lng: interaction.locale,
            0: channel.toString(),
          }),
        );
    }
    else {
      embed
        .setColor(Colors.Red)
        .setDescription(
          $t('voice:remove_fail', {
            lng: interaction.locale,
            0: channel.toString(),
          }),
        );
    }
  },
} as KamiSubCommand<EmbedBuilder>;
