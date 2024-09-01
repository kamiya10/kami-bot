import { ExecutionResultType } from "@/commands";
import { SlashCommandBuilder } from "discord.js";
import { buildEarthquakeReportMessage } from "@/classes/utils";

import type { KamiCommand } from "@/commands";

/**
 * The /avatar command.
 */
export default {
  data: new SlashCommandBuilder()
    .setName("report")
    .setDescription("地震報告"),
  defer: true,
  ephemeral: true,
  global: true,
  execute() {
    const report = this.states.report[0];

    if (report) {
      const m = buildEarthquakeReportMessage(report, "simple");
      return Promise.resolve({
        type: ExecutionResultType.SingleSuccess,
        payload: m,
      });
    }

    return Promise.resolve({
      type: ExecutionResultType.SingleSuccess,
      payload: {
        type: ExecutionResultType.SingleSuccess,
        content: "目前沒有地震報告",
      },
    });
  },
} satisfies KamiCommand;
