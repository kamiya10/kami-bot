import {
  ActionRowBuilder,
  SlashCommandBuilder,
  SlashCommandStringOption,
  StringSelectMenuBuilder,
} from 'discord.js';
import { KamiCommand } from '@/class/command';
import { $at } from '@/class/utils';
import { buildEarthquakeReportMessage, ReportMessageStyle } from '@/utils/report';

const row = (selected?: ReportMessageStyle) =>
  new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('earthquake:style')
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
  .setNameLocalizations($at('slash:earthquake.%style.$name'))
  .setDescription('The style of the message.')
  .setDescriptionLocalizations($at('slash:earthquake.%style.$desc'))
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

/**
 * The /avatar command.
 */
export default new KamiCommand({
  builder: new SlashCommandBuilder()
    .setName('earthquake')
    .setNameLocalizations($at('slash:earthquake.$name'))
    .setDescription('地震報告')
    .setDescriptionLocalizations($at('slash:earthquake.$desc'))
    .addStringOption(styleOption),
  defer: true,
  ephemeral: true,
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
    }

    await interaction.editReply({
      content: '目前沒有地震報告',
    });
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
});
