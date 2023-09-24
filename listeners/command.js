const { Events } = require("discord.js");
const { KamiListener } = require("../classes/listener");

module.exports =

/**
 * @param {import("../classes/client").KamiClient} client
 * @returns
 */
(client) => new KamiListener("command")
  .on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isCommand()) {
      const command = client.commands.get(interaction.commandName);

      if (command) {
        if (command.defer) {
          await interaction.deferReply();
        }

        command.execute(interaction);
      }
    }
  });