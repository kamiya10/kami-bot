import { EmbedBuilder, codeBlock } from 'discord.js';
import { EventHandler } from '@/class/event';
import { Colors } from 'discord.js';

import logger from 'logger';

/**
 * Slash command listener.
 * @param {KamiClient} client
 * @returns
 */
export default new EventHandler({
  event: 'interactionCreate',
  async on(interaction) {
    if (!interaction.isChatInputCommand()) return;
    if (!interaction.isCommand()) return;
    if (!interaction.inCachedGuild()) return;

    const command = this.commands.get(interaction.commandName);
    if (!command) return;

    try {
      if (command.defer) {
        await interaction.deferReply({ ephemeral: command.ephemeral });
      }

      await command.execute.call(this, interaction);
    }
    catch (error) {
      if (error instanceof Error) {
        logger.error(
          `Failed to execute command /${interaction.commandName}`,
          error,
        );

        const embed = new EmbedBuilder()
          .setColor(Colors.Red)
          .setTitle('🛑 Uncaught Exception')
          .setDescription(
            `Error stack:\n${codeBlock('ansi', error.stack ?? '')}`,
          );

        if (command.defer) {
          await interaction.editReply({ embeds: [embed] });
        }
        else {
          await interaction.reply({ embeds: [embed] });
        }
      }
    }
  },
});
