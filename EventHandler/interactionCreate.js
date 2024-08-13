module.exports = {
  name: "interactionCreate",
  event: "interactionCreate",
  once: false,

  /**
   * @param {import("discord.js").ChatInputCommandInteraction } interaction The interaction which was created
   */
  async execute(client, interaction) {
    if (
      !(
        interaction.isCommand() ||
        interaction.isMessageContextMenuCommand() ||
        interaction.isAutocomplete()
      )
    )
      return;

    /**
     * @type {{data: import("discord.js").ApplicationCommandData, defer: boolean, execute: Promise}}
     */
    const command = interaction.client[
      interaction.isMessageContextMenuCommand() ? "context" : "commands"
    ].get(interaction.commandName);

    if (!command) return;

    try {
      if (interaction.isAutocomplete()) {
        await command.autoComplete(interaction);
        return;
      }

      if (command.defer)
        await interaction.deferReply({ ephemeral: command.ephemeral });

      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      const msg = `There was an error while executing this command!\n${error}`;

      if (command.defer) {
        await interaction.deleteReply();
        await interaction.followUp({ content: msg, ephemeral: true });
      } else {
        await interaction.reply({ content: msg, ephemeral: true });
      }
    }
  },
};
