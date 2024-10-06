import {
  Colors,
  EmbedBuilder,
  GuildMember,
  SlashCommandBooleanOption,
  SlashCommandBuilder,
  SlashCommandIntegerOption,
  SlashCommandStringOption,
  SlashCommandSubcommandBuilder,
  SlashCommandSubcommandGroupBuilder,
  VoiceChannel,
  bold,
  inlineCode,
} from 'discord.js';
import { $at } from '@/class/utils';
import { t as $t } from 'i18next';
import { KamiCommand } from '@/class/command';

import voiceServerConfig from './voice/server/set';
import voiceServerInfo from './voice/server/info';
import voiceServerRemove from './voice/server/remove';
import voiceServerSetup from './voice/server/setup';
import voiceClear from './voice/clear';

export const voiceRegionChoices = [
  {
    value: 'brazil',
    name: 'Brazil',
    name_localizations: $at('slash:voice.region.CHOICES.brazil'),
  },
  {
    value: 'hongkong',
    name: 'Hong Kong',
    name_localizations: $at('slash:voice.region.CHOICES.hongkong'),
  },
  {
    value: 'india',
    name: 'India',
    name_localizations: $at('slash:voice.region.CHOICES.india'),
  },
  {
    value: 'japan',
    name: 'Japan',
    name_localizations: $at('slash:voice.region.CHOICES.japan'),
  },
  {
    value: 'rotterdam',
    name: 'Rotterdam',
    name_localizations: $at('slash:voice.region.CHOICES.rotterdam'),
  },
  {
    value: 'russia',
    name: 'Russia',
    name_localizations: $at('slash:voice.region.CHOICES.russia'),
  },
  {
    value: 'singapore',
    name: 'Singapore',
    name_localizations: $at('slash:voice.region.CHOICES.singapore'),
  },
  {
    value: 'southafrica',
    name: 'South Africa',
    name_localizations: $at('slash:voice.region.CHOICES.southafrica'),
  },
  {
    value: 'sydney',
    name: 'Sydney',
    name_localizations: $at('slash:voice.region.CHOICES.sydney'),
  },
  {
    value: 'us-central',
    name: 'US Central',
    name_localizations: $at('slash:voice.region.CHOICES.us_central'),
  },
  {
    value: 'us-east',
    name: 'US East',
    name_localizations: $at('slash:voice.region.CHOICES.us_east'),
  },
  {
    value: 'us-south',
    name: 'US South',
    name_localizations: $at('slash:voice.region.CHOICES.us_south'),
  },
  {
    value: 'us-west',
    name: 'US West',
    name_localizations: $at('slash:voice.region.CHOICES.us_west'),
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
        .addSubcommand(voiceServerConfig.builder)

        // /voice server remove
        .addSubcommand(voiceServerRemove.builder)

        // /voice server info
        .addSubcommand(voiceServerInfo.builder),
    )

    // /voice name
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName('name')
        .setNameLocalizations($at('slash:voice.name.$name'))
        .setDescription(
          'Change the name of a temporary voice channel you owned.',
        )
        .setDescriptionLocalizations($at('slash:voice.name.$desc'))
        .addStringOption(
          new SlashCommandStringOption()
            .setName('name')
            .setNameLocalizations($at('slash:voice.name.%name.$name'))
            .setDescription('The new name of the temporary voice channel.')
            .setDescriptionLocalizations(
              $at('slash:voice.name.%name.$desc'),
            ),
        )
        .addBooleanOption(
          new SlashCommandBooleanOption()
            .setName('default')
            .setNameLocalizations($at('slash:voice.%default.$name'))
            .setDescription(
              'Make this name as the server default name of the temporary voice channel on channel creation.',
            )
            .setDescriptionLocalizations(
              $at('slash:voice.%default.$desc'),
            ),
        )
        .addBooleanOption(
          new SlashCommandBooleanOption()
            .setName('global')
            .setNameLocalizations($at('slash:voice.%global.$name'))
            .setDescription(
              'Save the setting globally so it applies to all servers.',
            )
            .setDescriptionLocalizations(
              $at('slash:voice.%global.$desc'),
            ),
        ),
    )

    // /voice limit
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName('limit')
        .setNameLocalizations($at('slash:voice.limit.$name'))
        .setDescription(
          'Change the user limit of a temporary voice channel you owned.',
        )
        .setDescriptionLocalizations($at('slash:voice.limit.$desc'))
        .addIntegerOption(
          new SlashCommandIntegerOption()
            .setName('limit')
            .setNameLocalizations($at('slash:voice.limit.%limit.$name'))
            .setDescription(
              'The new user limit of the temporary voice channel. (0 = Unlimited)',
            )
            .setDescriptionLocalizations(
              $at('slash:voice.limit.%limit.$desc'),
            )
            .setMinValue(0)
            .setMaxValue(99),
        )
        .addBooleanOption(
          new SlashCommandBooleanOption()
            .setName('default')
            .setNameLocalizations($at('slash:voice.%default.$name'))
            .setDescription(
              'Make this user limit as the server default limit of the temporary voice channel on channel creation.',
            )
            .setDescriptionLocalizations(
              $at('slash:voice.%default.$desc'),
            ),
        )
        .addBooleanOption(
          new SlashCommandBooleanOption()
            .setName('global')
            .setNameLocalizations($at('slash:voice.%global.$name'))
            .setDescription(
              'Save the setting globally so it applies to all servers.',
            )
            .setDescriptionLocalizations(
              $at('slash:voice.%global.$desc'),
            ),
        ),
    )

    // /voice bitrate
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName('bitrate')
        .setNameLocalizations($at('slash:voice.bitrate.$name'))
        .setDescription(
          'Change the bitrate of a temporary voice channel you owned.',
        )
        .setDescriptionLocalizations($at('slash:voice.bitrate.$desc'))
        .addIntegerOption(
          new SlashCommandIntegerOption()
            .setName('bitrate')
            .setNameLocalizations(
              $at('slash:voice.bitrate.%bitrate.$name'),
            )
            .setDescription(
              'The new bitrate of the temporary voice channel. (In kbps)',
            )
            .setDescriptionLocalizations(
              $at('slash:voice.bitrate.%bitrate.$desc'),
            )
            .setMinValue(8)
            .setMaxValue(384),
        )
        .addBooleanOption(
          new SlashCommandBooleanOption()
            .setName('default')
            .setNameLocalizations($at('slash:voice.%default.$name'))
            .setDescription(
              'Make this bitrate as the server default of the temporary voice channel on channel creation.',
            )
            .setDescriptionLocalizations(
              $at('slash:voice.%default.$desc'),
            ),
        )
        .addBooleanOption(
          new SlashCommandBooleanOption()
            .setName('global')
            .setNameLocalizations($at('slash:voice.%global.$name'))
            .setDescription(
              'Save the setting globally so it applies to all servers.',
            )
            .setDescriptionLocalizations(
              $at('slash:voice.%global.$desc'),
            ),
        ),
    )

    // /voice region
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName('region')
        .setNameLocalizations($at('slash:voice.region.$name'))
        .setDescription(
          'Change the region of a temporary voice channel you owned.',
        )
        .setDescriptionLocalizations($at('slash:voice.region.$desc'))

        .addBooleanOption(
          new SlashCommandBooleanOption()
            .setName('default')
            .setNameLocalizations($at('slash:voice.%default.$name'))
            .setDescription(
              'Make this region as the server default of the temporary voice channel on channel creation.',
            )
            .setDescriptionLocalizations(
              $at('slash:voice.%default.$desc'),
            ),
        )
        .addBooleanOption(
          new SlashCommandBooleanOption()
            .setName('global')
            .setNameLocalizations($at('slash:voice.%global.$name'))
            .setDescription(
              'Save the setting globally so it applies to all servers.',
            )
            .setDescriptionLocalizations(
              $at('slash:voice.%global.$desc'),
            ),
        ),
    )

    // /voice clear
    .addSubcommand(voiceClear.builder),
  defer: true,
  ephemeral: true,
  async execute(interaction) {
    const embed = new EmbedBuilder()
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
      // /voice server [setup/info/add/remove/name/limit/bitrate/region]
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
        case 'config':
          await voiceServerConfig.execute.call(this, interaction);
          break;

        // /voice server remove
        case 'remove':
          await voiceServerRemove.execute.call(this, interaction);
          break;
      }
    }
    else if (interaction.member instanceof GuildMember) {
      // /voice [name/limit/bitrate/region]
      const userVoiceData = this.database.user(interaction.member.id).voice;
      const setAsDefault = interaction.options.getBoolean('default');
      const setAsGlobal = interaction.options.getBoolean('global');

      if (setAsDefault) {
        if (!userVoiceData[setAsGlobal ? 'global' : interaction.guild.id]) {
          userVoiceData[setAsGlobal ? 'global' : interaction.guild.id] = {
            name: null,
            bitrate: null,
            limit: null,
            region: null,
          };
        }
      }

      const subcommand = interaction.options.getSubcommand(false);
      const memberIsInTrackedVoiceChannel
        = interaction.member.voice.channel instanceof VoiceChannel
        && this.states.voice.has(interaction.member.voice.channel.id);

      switch (subcommand) {
        // /voice name
        case 'name': {
          const name = interaction.options.getString('name');

          if (setAsDefault) {
            userVoiceData[setAsGlobal ? 'global' : interaction.guild.id].name
              = name;
            embed.setDescription(
              `Your defaul temporary voice channel name is now ${
                name ? inlineCode(name) : 'cleared'
              }${
                setAsDefault
                  ? setAsGlobal
                    ? ' for all servers.'
                    : ' for this server'
                  : ''
              }.`,
            );
          }
          else if (
            interaction.member.voice.channel
            && this.states.voice.has(interaction.member.voice.channel.id)
          ) {
            const channel = this.states.voice.get(
              interaction.member.voice.channel.id,
            )!;

            if (channel.ownerId == interaction.member.id) {
              if (name) {
                await interaction.member.voice.channel.setName(name);
                embed
                  .setColor(Colors.Green)
                  .setDescription(
                    `Channel name has been changed to ${bold(
                      inlineCode(name),
                    )}.`,
                  );
              }
              else {
                await interaction.member.voice.channel.setName(
                  channel.defaultOptions.name,
                );
                embed
                  .setColor(Colors.Green)
                  .setDescription('Channel name has been reset.');
              }
            }
            else {
              embed
                .setColor(Colors.Red)
                .setDescription(
                  'You are not the owner of this temporary voice channel.',
                );
            }
          }
          else {
            embed
              .setColor(Colors.Red)
              .setDescription(
                'You must be in a tracked temporary voice channel to change its name.',
              );
          }

          break;
        }

        // /voice limit
        case 'limit': {
          const limit = interaction.options.getInteger('limit');

          if (setAsDefault) {
            userVoiceData[setAsGlobal ? 'global' : interaction.guild.id].limit
              = limit;
            embed.setDescription(
              `Your defaul temporary voice channel user limit is now ${
                limit ? inlineCode(`${limit || 'unlimited'}`) : 'cleared'
              }${
                setAsDefault
                  ? setAsGlobal
                    ? ' for all servers.'
                    : ' for this server'
                  : ''
              }.`,
            );
          }
          else if (memberIsInTrackedVoiceChannel) {
            const channel = this.states.voice.get(
              interaction.member.voice.channel!.id,
            )!;

            if (channel.ownerId == interaction.member.id) {
              if (limit) {
                await interaction.member.voice.channel!.setUserLimit(limit);
                embed
                  .setColor(Colors.Green)
                  .setDescription(
                    `Channel user limit has been changed to ${bold(
                      inlineCode(`${limit || 'unlimited'}`),
                    )}.`,
                  );
              }
              else {
                await interaction.member.voice.channel!.setUserLimit(
                  channel.defaultOptions.limit,
                );
                embed
                  .setColor(Colors.Green)
                  .setDescription('Channel user limit has been reset.');
              }
            }
            else {
              embed
                .setColor(Colors.Red)
                .setDescription(
                  'You are not the owner of this temporary voice channel.',
                );
            }
          }
          else {
            embed
              .setColor(Colors.Red)
              .setDescription(
                'You must be in a tracked temporary voice channel to change its user limit.',
              );
          }

          break;
        }

        // /voice bitrate
        case 'bitrate': {
          const bitrate = interaction.options.getInteger('bitrate');

          if (setAsDefault) {
            userVoiceData[
              setAsGlobal ? 'global' : interaction.guild.id
            ].bitrate = bitrate;
            embed.setDescription(
              `Your defaul temporary voice channel bitrate is now ${
                bitrate ? inlineCode(`${bitrate} kbps`) : 'cleared'
              }${
                setAsDefault
                  ? setAsGlobal
                    ? ' for all servers.'
                    : ' for this server'
                  : ''
              }.`,
            );
          }
          else if (
            this.states.voice.has(interaction.member.voice.channel!.id)
          ) {
            const channel = this.states.voice.get(
              interaction.member.voice.channel!.id,
            )!;

            if (channel.ownerId == interaction.member.id) {
              if (bitrate) {
                await interaction.member.voice.channel!.setBitrate(bitrate);
                embed
                  .setColor(Colors.Green)
                  .setDescription(
                    `Channel bitrate has been changed to ${bold(
                      inlineCode(`${bitrate} kbps`),
                    )}.`,
                  );
              }
              else {
                await interaction.member.voice.channel!.setBitrate(
                  channel.defaultOptions.bitrate,
                );
                embed
                  .setColor(Colors.Green)
                  .setDescription('Channel bitrate has been reset.');
              }
            }
            else {
              embed
                .setColor(Colors.Red)
                .setDescription(
                  'You are not the owner of this temporary voice channel.',
                );
            }
          }
          else {
            embed
              .setColor(Colors.Red)
              .setDescription(
                'You must be in a tracked temporary voice channel to change its bitrate.',
              );
          }

          break;
        }

        // /voice region
        case 'region': {
          const region = interaction.options.getString('region');

          if (setAsDefault) {
            userVoiceData[
              setAsGlobal ? 'global' : interaction.guild.id
            ].region = region;
            embed.setDescription(
              `Your defaul temporary voice channel region is now ${
                region ? inlineCode(region) : 'cleared'
              }${
                setAsDefault
                  ? setAsGlobal
                    ? ' for all servers.'
                    : ' for this server'
                  : ''
              }.`,
            );
          }
          else if (memberIsInTrackedVoiceChannel) {
            const channel = this.states.voice.get(
              interaction.member.voice.channel!.id,
            )!;

            if (channel.ownerId == interaction.member.id) {
              if (region) {
                await interaction.member.voice.channel!.setRTCRegion(region);
                embed
                  .setColor(Colors.Green)
                  .setDescription(
                    `Channel region has been changed to ${bold(
                      inlineCode(region),
                    )}.`,
                  );
              }
              else {
                await interaction.member.voice.channel!.setRTCRegion(
                  channel.defaultOptions.region,
                );
                embed
                  .setColor(Colors.Green)
                  .setDescription('Channel bitrate has been reset.');
              }
            }
            else {
              embed
                .setColor(Colors.Red)
                .setDescription(
                  'You are not the owner of this temporary voice channel.',
                );
            }
          }
          else {
            embed
              .setColor(Colors.Red)
              .setDescription(
                'You must be in a tracked temporary voice channel to change its region.',
              );
          }

          break;
        }

        // /voice clear
        case 'clear': {
          const scope = interaction.options.getString('scope');

          switch (scope) {
            case 'global': {
              userVoiceData.global = this.database.user.default.voice.global;
              embed.setDescription(
                'Your **global** defaul temporary voice channel settings have been cleared.',
              );

              break;
            }

            case 'guild': {
              if (userVoiceData[interaction.guild.id]) {
                delete userVoiceData[interaction.guild.id];
              }

              embed.setDescription(
                'Your defaul temporary voice channel settings for **this server** have been cleared.',
              );

              break;
            }

            case 'all': {
              this.database.user(interaction.member.id).voice
                = this.database.user.default.voice;

              embed.setDescription(
                'All your defaul temporary voice channel settings have been cleared.',
              );

              break;
            }

            default: {
              break;
            }
          }

          break;
        }

        default: {
          break;
        }
      }

      if (setAsDefault || subcommand == 'clear') {
        await this.database.database.user.write();
      }
    }

    await interaction.editReply({ embeds: [embed] });
  },
});
