import {
  ActionRowBuilder,
  InteractionContextType,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
} from 'discord.js';
import {
  ReportMessageStyle,
  buildEarthquakeReportMessage,
} from '@/utils/report';
import { KamiCommand } from '@/class/command';

const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
  new StringSelectMenuBuilder()
    .setCustomId('report:style')
    .setMaxValues(1)
    .setMinValues(1)
    .addOptions(
      {
        value: ReportMessageStyle.CwaText,
        label: ReportMessageStyle.CwaText,
      },
      {
        value: ReportMessageStyle.CwaSimple,
        label: ReportMessageStyle.CwaSimple,
        default: true,
      },
      {
        value: ReportMessageStyle.CwaSimpleLarge,
        label: ReportMessageStyle.CwaSimpleLarge,
      },
      {
        value: ReportMessageStyle.CwaDetail,
        label: ReportMessageStyle.CwaDetail,
      },
      {
        value: ReportMessageStyle.Simple,
        label: ReportMessageStyle.Simple,
      },
    ),
);

/**
 * The /avatar command.
 */
export default new KamiCommand({
  builder: new SlashCommandBuilder()
    .setName('report')
    .setDescription('地震報告')
    .setContexts(InteractionContextType.Guild),
  defer: true,
  ephemeral: true,
  async execute(interaction) {
    const report = this.states.report[0];

    if (report) {
      const m = buildEarthquakeReportMessage(
        report,
        ReportMessageStyle.CwaSimple,
        {
          components: [row],
        },
      );
      await interaction.editReply(m);
      return;
    }

    await interaction.editReply({
      content: '目前沒有地震報告',
    });
  },
  async onSelectMenu(interaction) {
    if (!interaction.isStringSelectMenu()) return;
    const style = interaction.values[0] as ReportMessageStyle;
    const report = this.states.report[0];

    if (report) {
      const m = buildEarthquakeReportMessage(report, style, {
        components: [interaction.message.components.at(-1)!],
      });
      await interaction.editReply(m);
      return;
    }

    await interaction.editReply({
      content: '目前沒有地震報告',
      components: interaction.message.components,
    });
  },
});
