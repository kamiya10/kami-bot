// @ts-check

import {
  EmbedBuilder,
  SlashCommandBuilder,
  TimestampStyles,
  codeBlock,
  time,
} from "discord.js";
import { t as $t } from "i18next";
import { Colors } from "discord.js";

import { $at } from "@/classes/utils";
import type { KamiClient } from "@/classes/client";
import { KamiCommand } from "@/classes/command";
import { Logger } from "@/classes/logger";

/**
 * The /ping command.
 * @param {KamiClient} client
 * @returns {KamiCommand}
 */
export default (client: KamiClient): KamiCommand =>
  new KamiCommand({
    dev: true,
    filePath: import.meta.url,
    builder: new SlashCommandBuilder()
      .setName("ping")
      .setNameLocalizations($at("slash:ping.NAME"))
      .setDescription("Check if the bot is alive or not.")
      .setDescriptionLocalizations($at("slash:ping.DESC")),
    async execute(interaction) {
      try {
        const start = Date.now();
        const sent = await interaction.editReply("Pong!");
        const end = Date.now();
        const latency = end - start;

        const embed = new EmbedBuilder()
          .setAuthor({
            name: $t("header:ping", {
              lng: interaction.locale,
              0: client.user!.displayName,
            }),
            iconURL: client.user!.displayAvatarURL(),
          })
          .setColor(
            latency >= 1000
              ? Colors.Red
              : latency >= 500
              ? Colors.Yellow
              : Colors.Green
          )
          .addFields(
            ...[
              {
                name: "Clock",
                value: `💬 **Message Time**: ${time(
                  ~~(sent.createdTimestamp / 1000),
                  TimestampStyles.LongDate
                )}${time(
                  ~~(sent.createdTimestamp / 1000),
                  TimestampStyles.LongTime
                )}.${`${new Date(
                  ~~(sent.createdTimestamp / 1000)
                ).getMilliseconds()}`.padStart(
                  3,
                  "0"
                )}\n🤖 **Bot Time**: ${time(
                  ~~(end / 1000),
                  TimestampStyles.LongDate
                )}${time(
                  ~~(end / 1000),
                  TimestampStyles.LongTime
                )}.${`${new Date(~~(end / 1000)).getMilliseconds()}`.padStart(
                  3,
                  "0"
                )}`,
              },
              {
                name: "Latency",
                value: `⌛ **Ping**: ${latency}ms\n💓 **Heartbeat**: ${client.ws.ping}ms`,
              },
            ]
          )
          .setTimestamp();

        await interaction.editReply({ content: "Pong!", embeds: [embed] });
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
