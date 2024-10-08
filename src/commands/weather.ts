// @ts-check

import {
  EmbedBuilder,
  InteractionContextType,
  SlashCommandBuilder,
} from 'discord.js';
import { Colors } from 'discord.js';
import { KamiCommand } from '@/class/command';
import { $at } from '@/class/utils';
import { t as $t } from 'i18next';

import weatherPush from '$/weather/push';

/**
 * The /ping command.
 */
export default new KamiCommand({
  builder: new SlashCommandBuilder()
    .setName('weather')
    .setNameLocalizations($at('slash:weather.$name'))
    .setDescription('Check weather information.')
    .setDescriptionLocalizations($at('slash:weather.$desc'))
    .setContexts(
      InteractionContextType.BotDM,
      InteractionContextType.Guild,
      InteractionContextType.PrivateChannel,
    )
    .addSubcommand(weatherPush.builder),
  defer: true,
  ephemeral: true,
  async execute(interaction) {
    const baseEmbed = new EmbedBuilder()
      .setAuthor({
        name: $t('header:weather', {
          lng: interaction.locale,
          0: interaction.guild.name,
        }),
        iconURL: interaction.guild.iconURL() ?? '',
      })
      .setColor(Colors.Blue)
      .setDescription('✅');

    if (interaction.options.getSubcommand(false)) {
      await weatherPush.execute.call(this, interaction, baseEmbed);
    }

    await interaction.editReply({ embeds: [baseEmbed] });
  },
});
