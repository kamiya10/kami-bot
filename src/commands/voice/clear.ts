import {
  Colors,
  EmbedBuilder,
  SlashCommandSubcommandBuilder,
} from 'discord.js';
import { $at } from '@/class/utils';

import type { KamiSubCommand } from '@/class/command';
import { userVoiceChannel } from '@/database/schema';
import { eq } from 'drizzle-orm';

export default {
  builder: new SlashCommandSubcommandBuilder()
    .setName('clear')
    .setNameLocalizations($at('slash:voice.clear.$name'))
    .setDescription('Clear temporary voice channel settings.')
    .setDescriptionLocalizations($at('slash:voice.clear.$desc')),
  async execute(interaction, { baseEmbed }) {
    const embed = new EmbedBuilder(baseEmbed.data);

    await this.database
      .delete(userVoiceChannel)
      .where(eq(userVoiceChannel.userId, interaction.member.id));

    embed
      .setColor(Colors.Green)
      .setDescription(
        'Your defaul temporary voice channel settings have been cleared.',
      );

    await interaction.editReply({
      embeds: [embed],
    });
  },
} as KamiSubCommand<{ baseEmbed: EmbedBuilder }>;
