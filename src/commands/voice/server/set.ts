import {
  ChannelType,
  SlashCommandChannelOption,
  SlashCommandIntegerOption,
  SlashCommandStringOption,
  SlashCommandSubcommandBuilder,
} from 'discord.js';
import { $at } from '@/class/utils';
import { t as $t } from 'i18next';

import type { KamiSubCommand } from '@/class/command';
import { voiceRegionChoices } from '../../voice';

const channelOption = new SlashCommandChannelOption()
  .setName('channel')
  .setNameLocalizations(
    $at('slash:voice.server.add.%channel.$name'),
  )
  .setDescription('The channel to be a temporary voice channel creator.')
  .setDescriptionLocalizations(
    $at('slash:voice.server.add.%channel.$desc'),
  )
  .addChannelTypes(ChannelType.GuildVoice)
  .setRequired(true);

const categoryOption = new SlashCommandChannelOption()
  .setName('category')
  .setNameLocalizations(
    $at('slash:voice.server.add.%category.$name'),
  )
  .setDescription(
    'The category temporary voice channel should be created in.',
  )
  .setDescriptionLocalizations(
    $at('slash:voice.server.add.%category.$desc'),
  )
  .addChannelTypes(ChannelType.GuildCategory)
  .setRequired(true);

const nameOption
      = new SlashCommandStringOption()
        .setName('name')
        .setNameLocalizations($at('slash:voice.name.%name.$name'))
        .setDescription('The new name of the temporary voice channel.')
        .setDescriptionLocalizations($at('slash:voice.name.%name.$desc'));

const limitOption = new SlashCommandIntegerOption()
  .setName('limit')
  .setNameLocalizations($at('slash:voice.limit.%limit.$name'))
  .setDescription(
    'The new user limit of the temporary voice channel. (0 = Unlimited)',
  )
  .setDescriptionLocalizations(
    $at('slash:voice.limit.%limit.$desc'),
  )
  .setMinValue(0)
  .setMaxValue(99);

const bitrateOption
      = new SlashCommandIntegerOption()
        .setName('bitrate')
        .setNameLocalizations($at('slash:voice.bitrate.%bitrate.$name'))
        .setDescription(
          'The new bitrate of the temporary voice channel. (In kbps)',
        )
        .setDescriptionLocalizations(
          $at('slash:voice.bitrate.%bitrate.$desc'),
        )
        .setMinValue(8)
        .setMaxValue(384);

const regionOption = new SlashCommandStringOption()
  .setName('region')
  .setNameLocalizations($at('slash:voice.region.%region.$name'))
  .setDescription('The new region of the temporary voice channel.')
  .setDescriptionLocalizations(
    $at('slash:voice.region.%region.$desc'),
  )
  .addChoices(...voiceRegionChoices);

export default {
  builder: new SlashCommandSubcommandBuilder()
    .setName('set')
    .setNameLocalizations($at('slash:voice.server.add.$name'))
    .setDescription(
      'Add a voice channel to be a temporary voice channel creator.',
    )
    .setDescriptionLocalizations($at('slash:voice.server.add.$desc'))
    .addChannelOption(channelOption)
    .addChannelOption(categoryOption)
    .addStringOption(nameOption)
    .addIntegerOption(limitOption)
    .addIntegerOption(bitrateOption)
    .addStringOption(regionOption),
  execute(interaction) {},
} as KamiSubCommand;
