// @ts-check

import {
  Colors,
  EmbedBuilder,
  SlashCommandBuilder,
  codeBlock,
} from "discord.js";

import type { KamiClient } from "@/classes/client";
import { KamiCommand } from "@/classes/command";
import { Logger } from "@/classes/logger";
import { buildEarthquakeReportMessage } from "@/classes/utils";

/**
 * The /avatar command.
 * @returns {KamiCommand}
 */
export default (client: KamiClient): KamiCommand =>
  new KamiCommand({
    dev: true,
    filePath: import.meta.url,
    builder: new SlashCommandBuilder()
      .setName("report")
      .setDescription("地震報告"),
    async execute(interaction) {
      try {
        const report = client.states.report[0];

        if (report) {
          const m = buildEarthquakeReportMessage(report, "simple");
          await interaction.editReply(m);
        }
      } catch (error) {
        if (error instanceof Error) {
          Logger.error(error);
          const embed = new EmbedBuilder()
            .setColor(Colors.Red)
            .setTitle("🛑 Uncaught Exception")
            .setDescription(
              `Error stack:\n${codeBlock("ansi", error.stack ?? "")}`
            );
          await interaction.editReply({ embeds: [embed] });
        }
      }
    },
  });
