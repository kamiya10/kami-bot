import { InteractionContextType, SlashCommandBuilder, SlashCommandSubcommandGroupBuilder } from 'discord.js';
import { KamiCommand } from '@/class/command';
import { $at } from '@/class/utils';

import pushEarthquakeReport from '$/push/earthquake/report';
import pushWeather from '$/push/weather';

export default new KamiCommand({
  builder: new SlashCommandBuilder()
    .setName('push')
    .setNameLocalizations($at('slash:push.$name'))
    .setDescription('Push notification configuration')
    .setDescriptionLocalizations($at('slash:push.$desc'))
    .setContexts(InteractionContextType.Guild)
    .addSubcommandGroup(new SlashCommandSubcommandGroupBuilder()
      .setName('earthquake')
      .setNameLocalizations($at('slash:push.earthquake.$name'))
      .setDescription('Earthquake push notification configuration')
      .setDescriptionLocalizations($at('slash:push.earthquake.$desc'))
      .addSubcommand(pushEarthquakeReport.builder))
    .addSubcommand(pushWeather.builder),
  ephemeral: true,
  defer: true,
  execute(interaction) {
    switch (interaction.options.getSubcommandGroup(false)) {
      case 'earthquake':{
        switch (interaction.options.getSubcommand()) {
          case 'report':
            pushEarthquakeReport.execute.call(this, interaction);
            break;
        }
      }
    }

    switch (interaction.options.getSubcommand()) {
      case 'weather':
        pushWeather.execute.call(this, interaction);
        break;

      default:
        break;
    }
  },
});
