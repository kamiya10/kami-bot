import {
  ActionRowBuilder,
  SlashCommandStringOption,
  SlashCommandSubcommandBuilder,
  StringSelectMenuBuilder,
} from 'discord.js';
import {
  buildEarthquakeReportMessage,
  ReportMessageStyle,
} from '@/utils/report';
import { $at } from '@/class/utils';

import type { KamiSubCommand } from '@/class/command';

const row = (selected?: ReportMessageStyle) =>
  new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('earthquake:report-style')
      .setMaxValues(1)
      .setMinValues(1)
      .addOptions(
        {
          value: ReportMessageStyle.CwaText,
          label: ReportMessageStyle.CwaText,
          default: selected == ReportMessageStyle.CwaText,
        },
        {
          value: ReportMessageStyle.CwaTextWithButton,
          label: ReportMessageStyle.CwaTextWithButton,
          default: selected == ReportMessageStyle.CwaTextWithButton,
        },
        {
          value: ReportMessageStyle.CwaSimple,
          label: ReportMessageStyle.CwaSimple,
          default: selected == ReportMessageStyle.CwaSimple,
        },
        {
          value: ReportMessageStyle.CwaSimpleLarge,
          label: ReportMessageStyle.CwaSimpleLarge,
          default: selected == ReportMessageStyle.CwaSimpleLarge,
        },
        {
          value: ReportMessageStyle.CwaDetail,
          label: ReportMessageStyle.CwaDetail,
          default: selected == ReportMessageStyle.CwaDetail,
        },
        {
          value: ReportMessageStyle.Simple,
          label: ReportMessageStyle.Simple,
          default: selected == ReportMessageStyle.Simple,
        },
      ),
  );

const styleOption = new SlashCommandStringOption()
  .setName('style')
  .setNameLocalizations($at('slash:earthquake.report.%style.$name'))
  .setDescription('The style of the message.')
  .setDescriptionLocalizations($at('slash:earthquake.report.%style.$desc'))
  .addChoices(
    {
      name: ReportMessageStyle.CwaText,
      value: ReportMessageStyle.CwaText,
    },
    {
      name: ReportMessageStyle.CwaTextWithButton,
      value: ReportMessageStyle.CwaTextWithButton,
    },
    {
      name: ReportMessageStyle.CwaSimple,
      value: ReportMessageStyle.CwaSimple,
    },
    {
      name: ReportMessageStyle.CwaSimpleLarge,
      value: ReportMessageStyle.CwaSimpleLarge,
    },
    {
      name: ReportMessageStyle.Simple,
      value: ReportMessageStyle.Simple,
    },
    {
      name: ReportMessageStyle.Detailed,
      value: ReportMessageStyle.Detailed,
    },
  );

export default {
  builder: new SlashCommandSubcommandBuilder()
    .setName('report')
    .setNameLocalizations($at('slash:earthquake.report.$name'))
    .setDescription('Query earthquake information.')
    .setDescriptionLocalizations($at('slash:earthquake.report.$desc'))
    .addStringOption(styleOption),
  async execute(interaction) {
    const report = this.states.report[0];

    if (report) {
      const m = buildEarthquakeReportMessage(
        report,
        ReportMessageStyle.CwaSimple,
        {
          components: [row()],
        },
      );
      await interaction.editReply(m);
      return true;
    }

    await interaction.editReply({
      content: '目前沒有地震報告',
    });

    return true;
  },
  async onSelectMenu(interaction) {
    if (!interaction.isStringSelectMenu()) return;

    const style = interaction.values[0] as ReportMessageStyle;
    const report = this.states.report[0];

    const m = buildEarthquakeReportMessage(report, style, {
      components: [row(style)],
    });

    await interaction.editReply(m);
  },
} as KamiSubCommand;
