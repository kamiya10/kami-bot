import { InteractionContextType, SlashCommandBuilder } from 'discord.js';
import { buildEarthquakeReportMessage } from '@/class/utils';

import { KamiCommand } from '@/class/command';

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
      const m = buildEarthquakeReportMessage(report, 'simple');
      await interaction.editReply(m);
    }

    await interaction.editReply({
      content: '目前沒有地震報告',
    });
  },
});
