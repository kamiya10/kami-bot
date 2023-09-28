const { Colors, Events } = require("discord.js");
const { EmbedBuilder, codeBlock } = require("@discordjs/builders");
const { KamiListener } = require("../classes/listener");

/**
 * Slash command listener.
 * @param {import("../classes/client").KamiClient} client
 * @returns
 */
const onCommand = (client) => new KamiListener("command")
  .on(Events.InteractionCreate, async (interaction) => {
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
      console.error(`Failed to execute command /${interaction.commandName}`);
      console.error(error);
      const embed = new EmbedBuilder()
        .setColor(Colors.Red)
        .setTitle("🛑 Uncaught Exception")
        .setDescription(`Error stack:\n${codeBlock("ansi", error.stack)}`);

      if (command && command.defer) {
        await interaction.editReply({ embeds: [embed] });
      } else {
        await interaction.reply({ embeds: [embed] });
      }
    }
  });
module.exports = onCommand;