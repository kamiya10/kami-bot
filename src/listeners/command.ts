import { Colors, Events } from "discord.js";
import { EmbedBuilder, codeBlock } from "@discordjs/builders";
import { KamiListener } from "../classes/listener";
import { Logger } from "../classes/logger";
import type { KamiClient } from "../classes/client";

/**
 * Slash command listener.
 * @param {KamiClient} client
 * @returns
 */
export const build = (client: KamiClient) => new KamiListener("command")
  .on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);

      try {
        if (interaction.isCommand()) {
          if (command) {
            if (command.defer) {
              await interaction.deferReply();
            }

            await command.execute(interaction);
          }
        }
      } catch (error) {
        if (error instanceof Error) {
          Logger.error(`Failed to execute command /${interaction.commandName}`);
          Logger.error(error);
          const embed = new EmbedBuilder()
            .setColor(Colors.Red)
            .setTitle("🛑 Uncaught Exception")
            .setDescription(`Error stack:\n${codeBlock("ansi", error.stack ?? "")}`);
          if (command && command.defer) {
            await interaction.editReply({ embeds: [embed] });
          } else {
            await interaction.reply({ embeds: [embed] });
          }
        }
      }
    }
  });