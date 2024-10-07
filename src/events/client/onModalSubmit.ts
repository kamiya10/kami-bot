import { Events } from 'discord.js';
import { EventHandler } from '@/class/event';

export default new EventHandler({
  event: Events.InteractionCreate,
  async on(interaction) {
    if (!interaction.inCachedGuild()) return;
    if (!interaction.isModalSubmit()) return;

    const [commandName, modalId] = interaction.customId.split(':');
    const command = this.commands.get(commandName);

    if (!command) return;
    if (!command.onModalSubmit) return;

    if (command.defer) {
      await interaction.deferUpdate();
    }

    await command.onModalSubmit.call(this, interaction, modalId);
  },
});
