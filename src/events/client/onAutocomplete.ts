import { Events } from 'discord.js';
import { EventHandler } from '@/class/event';

export default new EventHandler({
  event: Events.InteractionCreate,
  async on(interaction) {
    if (!interaction.inCachedGuild()) return;
    if (!interaction.isAutocomplete()) return;

    const command = this.commands.get(interaction.commandName);

    if (!command) return;
    if (!command.onAutocomplete) return;

    const options = await command.onAutocomplete.call(this, interaction);

    await interaction.respond(options);
  },
});
