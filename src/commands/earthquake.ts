import {
  Colors,
  EmbedBuilder,
  InteractionContextType,
  SlashCommandBuilder,
} from 'discord.js';
import { KamiCommand } from '@/class/command';
import { $at } from '@/class/utils';
import { t as $t } from 'i18next';

import earthquakeReport from '$/earthquake/report';
import earthquakePush from '$/earthquake/push';

/**
 * The /avatar command.
 */
export default new KamiCommand({
  builder: new SlashCommandBuilder()
    .setName('earthquake')
    .setNameLocalizations($at('slash:earthquake.$name'))
    .setDescription('地震報告')
    .setDescriptionLocalizations($at('slash:earthquake.$desc'))
    .setContexts(InteractionContextType.Guild)
    .addSubcommand(earthquakeReport.builder)
    .addSubcommand(earthquakePush.builder),
  defer: true,
  ephemeral: true,
  async execute(interaction) {
    const baseEmbed = new EmbedBuilder()
      .setAuthor({
        name: $t('header:earthquake', {
          lng: interaction.locale,
          0: interaction.guild.name,
        }),
        iconURL: interaction.guild.iconURL() ?? '',
      })
      .setColor(Colors.Blue)
      .setDescription('✅');

    switch (interaction.options.getSubcommand(false)) {
      case 'report':
        if (await earthquakeReport.execute.call(this, interaction)) return;
        break;

      case 'push':
        await earthquakePush.execute.call(this, interaction, baseEmbed);
        break;
    }

    await interaction.editReply({ embeds: [baseEmbed] });
  },
  async onSelectMenu(interaction, id) {
    const [subcommand] = id.split('-');

    switch (subcommand) {
      case 'report':
        await earthquakeReport.onSelectMenu?.call(this, interaction, id);
        break;
    }

    return;
  },
});
