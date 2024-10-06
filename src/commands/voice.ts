import {
  Colors,
  EmbedBuilder,
  GuildMember,
  SlashCommandBuilder,
  SlashCommandSubcommandGroupBuilder,
  VideoQualityMode,
} from 'discord.js';
import { $at } from '@/class/utils';
import { t as $t } from 'i18next';
import { KamiCommand } from '@/class/command';

import voiceServerSet from './voice/server/set';
import voiceServerInfo from './voice/server/info';
import voiceServerRemove from './voice/server/remove';
import voiceServerSetup from './voice/server/setup';
import voiceClear from './voice/clear';
import voiceSet from './voice/set';

export const voiceRegionChoices = [
  {
    value: 'brazil',
    name: 'Brazil',
    name_localizations: $at('voice:region.brazil'),
  },
  {
    value: 'hongkong',
    name: 'Hong Kong',
    name_localizations: $at('voice:region.hongkong'),
  },
  {
    value: 'india',
    name: 'India',
    name_localizations: $at('voice:region.india'),
  },
  {
    value: 'japan',
    name: 'Japan',
    name_localizations: $at('voice:region.japan'),
  },
  {
    value: 'rotterdam',
    name: 'Rotterdam',
    name_localizations: $at('voice:region.rotterdam'),
  },
  {
    value: 'russia',
    name: 'Russia',
    name_localizations: $at('voice:region.russia'),
  },
  {
    value: 'singapore',
    name: 'Singapore',
    name_localizations: $at('voice:region.singapore'),
  },
  {
    value: 'southafrica',
    name: 'South Africa',
    name_localizations: $at('voice:region.southafrica'),
  },
  {
    value: 'sydney',
    name: 'Sydney',
    name_localizations: $at('voice:region.sydney'),
  },
  {
    value: 'us-central',
    name: 'US Central',
    name_localizations: $at('voice:region.us_central'),
  },
  {
    value: 'us-east',
    name: 'US East',
    name_localizations: $at('voice:region.us_east'),
  },
  {
    value: 'us-south',
    name: 'US South',
    name_localizations: $at('voice:region.us_south'),
  },
  {
    value: 'us-west',
    name: 'US West',
    name_localizations: $at('voice:region.us_west'),
  },
];

export const videoQualityChoices = [
  {
    value: VideoQualityMode.Auto,
    name: 'Auto',
  },
  {
    value: VideoQualityMode.Full,
    name: 'Full',
  },
];

/**
 * The /voice command.
 * @param {KamiClient} client
 * @returns {KamiCommand}
 */
export default new KamiCommand({
  builder: new SlashCommandBuilder()
    .setName('voice')
    .setNameLocalizations($at('slash:voice.$name'))
    .setDescription('Commands for temporary voice channels.')
    .setDescriptionLocalizations($at('slash:voice.$desc'))
    .addSubcommandGroup(
      new SlashCommandSubcommandGroupBuilder()
        .setName('server')
        .setNameLocalizations($at('slash:voice.server.$name'))
        .setDescription(
          'Server configuration commands for temporary voice channels.',
        )
        .setDescriptionLocalizations($at('slash:voice.server.$desc'))

        // /voice server setup
        .addSubcommand(voiceServerSetup.builder)

        // /voice server config
        .addSubcommand(voiceServerSet.builder)

        // /voice server remove
        .addSubcommand(voiceServerRemove.builder)

        // /voice server info
        .addSubcommand(voiceServerInfo.builder),
    )

    // /voice clear
    .addSubcommand(voiceClear.builder)

    // /voice set
    .addSubcommand(voiceSet.builder),
  defer: true,
  ephemeral: true,
  async execute(interaction) {
    const baseEmbed = new EmbedBuilder()
      .setAuthor({
        name: $t('header:voice', {
          lng: interaction.locale,
          0: interaction.guild.name,
        }),
        iconURL: interaction.guild.iconURL() ?? '',
      })
      .setColor(Colors.Blue)
      .setDescription('✅');

    if (interaction.options.getSubcommandGroup(false) == 'server') {
      // /voice server [setup/info/set/remove]
      switch (interaction.options.getSubcommand()) {
        // /voice server setup
        case 'setup':
          await voiceServerSetup.execute.call(this, interaction);
          break;

        // /voice server info
        case 'info':
          await voiceServerInfo.execute.call(this, interaction);
          break;

        // /voice server config
        case 'set':
          await voiceServerSet.execute.call(this, interaction, { baseEmbed });
          break;

        // /voice server remove
        case 'remove':
          await voiceServerRemove.execute.call(this, interaction);
          break;
      }
    }
    else if (interaction.member instanceof GuildMember) {
      // /voice [clear/set]
      const subcommand = interaction.options.getSubcommand(false);

      switch (subcommand) {
        case 'set': {
          await voiceSet.execute.call(this, interaction, { baseEmbed });
          break;
        }

        // /voice clear
        case 'clear': {
          await voiceClear.execute.call(this, interaction, { baseEmbed });
          break;
        }

        default: {
          break;
        }
      }
    }

    await interaction.editReply({ embeds: [baseEmbed] });
  },
});
