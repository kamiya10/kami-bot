import {
  SlashCommandStringOption,
  SlashCommandSubcommandBuilder,
} from 'discord.js';
import { $at } from '@/class/utils';
import { t as $t } from 'i18next';

import type { KamiSubCommand } from '@/class/command';

const settingClearChoices = [
  {
    value: 'global',
    name: 'Global',
    name_localizations: $at('slash:voice.clear.CHOICES.global'),
  },
  {
    value: 'guild',
    name: 'This server',
    name_localizations: $at('slash:voice.clear.CHOICES.guild'),
  },
  {
    value: 'all',
    name: 'All',
    name_localizations: $at('slash:voice.clear.CHOICES.all'),
  },
];

const which = new SlashCommandStringOption()
  .setName('which')
  .setNameLocalizations($at('slash:voice.clear.%which.$name'))
  .setDescription('Choose which scope to clear.')
  .setDescriptionLocalizations($at('slash:voice.clear.%which.$desc'))
  .addChoices(...settingClearChoices)
  .setRequired(true);

export default {
  builder: new SlashCommandSubcommandBuilder()
    .setName('clear')
    .setNameLocalizations($at('slash:voice.clear.$name'))
    .setDescription('Clear temporary voice channel settings.')
    .setDescriptionLocalizations($at('slash:voice.clear.$desc'))
    .addStringOption(which),
  execute(interaction) {},
} as KamiSubCommand;
