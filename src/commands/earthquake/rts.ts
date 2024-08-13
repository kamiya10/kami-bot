// @ts-check

import {
  ChannelType,
  Colors,
  EmbedBuilder,
  SlashCommandBooleanOption,
  SlashCommandBuilder,
  SlashCommandChannelOption,
  codeBlock,
} from "discord.js";
import { t as $t } from "i18next";

import type { KamiClient } from "@/classes/client";
import { KamiCommand } from "@/classes/command";
import { Logger } from "@/classes/logger";

/**
 * The /rts command.
 * @returns {KamiCommand}
 */
export default (client: KamiClient): KamiCommand =>
  new KamiCommand({
    dev: true,
    ephemeral: true,
    filePath: import.meta.url,
    builder: new SlashCommandBuilder()
      .setName("rts")
      .setDescription("地動即時資訊推播設定")
      .addChannelOption(
        new SlashCommandChannelOption()
          .setName("channel")
          .setDescription("The channel rts alert message should be sent to.")
          .addChannelTypes(ChannelType.GuildText)
      )
      .addBooleanOption(
        new SlashCommandBooleanOption()
          .setName("auto_delete")
          .setDescription(
            "Whether should message be auto deleted when the alert expires."
          )
      ),
    async execute(interaction) {
      try {
        if (!interaction.inCachedGuild()) return;

        const channel =
          interaction.options.getChannel<ChannelType.GuildText>("channel");
        const autoDelete = interaction.options.getBoolean("auto_delete");

        let content = "";

        if (channel) {
          client.database.guild(interaction.guild.id).earthquake.rts.channelId =
            channel.id;
          content += `已將推播頻道設為 **${channel.toString()}**`;
          if (autoDelete == undefined) {
            content += `。`;
          }
        } else {
          client.database.guild(interaction.guild.id).earthquake.rts.channelId =
            null;
          content += `已**清除**推播頻道`;
          if (autoDelete == undefined) {
            content += `。`;
          }
        }

        if (autoDelete != undefined) {
          client.database.guild(
            interaction.guild.id
          ).earthquake.rts.autoDelete = autoDelete;

          if (autoDelete) {
            if (channel) {
              content += `，並在警報結束後自動刪除訊息。`;
            } else {
              content += `已設定在警報結束後自動刪除訊息。`;
            }
          } else {
            if (channel) {
              content += `，且警報結束後將不再自動刪除訊息。`;
            } else {
              content += `警報結束後將不再自動刪除訊息。`;
            }
          }
        }

        const embed = new EmbedBuilder()
          .setAuthor({
            name: $t("header:rts", {
              lng: interaction.locale,
              0: interaction.guild.name,
            }),
            iconURL: interaction.guild.iconURL() ?? "",
          })
          .setColor(Colors.Green)
          .setDescription(content);

        await interaction.editReply({ embeds: [embed] });
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
