import { Events } from 'discord.js';
import { EventHandler } from '@/class/event';

export default new EventHandler({
  event: Events.InteractionCreate,
  async on(interaction) {
    if (!interaction.inCachedGuild()) return;
    if (!interaction.isAnySelectMenu()) return;

    const [commandName, menuId] = interaction.customId.split(':');
    const command = this.commands.get(commandName);

    if (!command) return;
    if (!command.onSelectMenu) return;

    if (command.defer) {
      await interaction.deferUpdate();
    }

    await command.onSelectMenu.call(this, interaction, menuId);
  },
});
