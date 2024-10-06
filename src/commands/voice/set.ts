import {
  Colors,
  EmbedBuilder,
  SlashCommandBooleanOption,
  SlashCommandIntegerOption,
  SlashCommandStringOption,
  SlashCommandSubcommandBuilder,
  VideoQualityMode,
} from 'discord.js';
import { $at } from '@/class/utils';
import { t as $t } from 'i18next';
import { userVoiceChannel } from '@/database/schema';

import type { KamiSubCommand } from '@/class/command';

const voiceRegionChoices = [
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

const videoQualityChoices = [
  {
    value: VideoQualityMode.Auto,
    name: 'Auto',
  },
  {
    value: VideoQualityMode.Full,
    name: 'Full',
  },
];

export const nameOption = new SlashCommandStringOption()
  .setName('name')
  .setNameLocalizations($at('slash:voice.set.%name.$name'))
  .setDescription('The new name of the temporary voice channel.')
  .setDescriptionLocalizations($at('slash:voice.set.%name.$desc'));

export const limitOption = new SlashCommandIntegerOption()
  .setName('limit')
  .setNameLocalizations($at('slash:voice.set.%limit.$name'))
  .setDescription(
    'The new user limit of the temporary voice channel. (0 = Unlimited)',
  )
  .setDescriptionLocalizations($at('slash:voice.set.%limit.$desc'))
  .setMinValue(0)
  .setMaxValue(99);

export const bitrateOption = new SlashCommandIntegerOption()
  .setName('bitrate')
  .setNameLocalizations($at('slash:voice.set.%bitrate.$name'))
  .setDescription('The new bitrate of the temporary voice channel. (In kbps)')
  .setDescriptionLocalizations($at('slash:voice.set.%bitrate.$desc'))
  .setMinValue(8)
  .setMaxValue(384);

export const regionOption = new SlashCommandStringOption()
  .setName('region')
  .setNameLocalizations($at('slash:voice.set.%region.$name'))
  .setDescription('The new region of the temporary voice channel.')
  .setDescriptionLocalizations($at('slash:voice.set.%region.$desc'))
  .addChoices(...voiceRegionChoices);

export const videoQualityOption = new SlashCommandIntegerOption()
  .setName('video')
  .setNameLocalizations($at('slash:voice.set.%video.$name'))
  .setDescription(
    'The new slow mode limit of the temporary voice channel. (In seconds)',
  )
  .setDescriptionLocalizations($at('slash:voice.set.%video.$desc'))
  .addChoices(...videoQualityChoices);

export const slowModeOption = new SlashCommandIntegerOption()
  .setName('slow')
  .setNameLocalizations($at('slash:voice.set.%slow.$name'))
  .setDescription(
    'The new slow mode limit of the temporary voice channel. (In seconds)',
  )
  .setDescriptionLocalizations($at('slash:voice.set.%slow.$desc'))
  .setMinValue(0)
  .setMaxValue(21600);

export const nsfwOption = new SlashCommandBooleanOption()
  .setName('nsfw')
  .setNameLocalizations($at('slash:voice.set.%nsfw.$name'))
  .setDescription('The nsfw of the temporary voice channel.')
  .setDescriptionLocalizations($at('slash:voice.set.%nsfw.$desc'));

export default {
  builder: new SlashCommandSubcommandBuilder()
    .setName('set')
    .setNameLocalizations($at('slash:voice.set.$name'))
    .setDescription(
      'Change the settings of the temporary voice channel when it is created.',
    )
    .setDescriptionLocalizations($at('slash:voice.set.$desc'))
    .addStringOption(nameOption)
    .addIntegerOption(limitOption)
    .addIntegerOption(bitrateOption)
    .addStringOption(regionOption)
    .addIntegerOption(videoQualityOption)
    .addIntegerOption(slowModeOption)
    .addBooleanOption(nsfwOption),
  async execute(interaction, embed) {
    const name = interaction.options.getString('name');
    const limit = interaction.options.getInteger('limit');
    const bitrate = interaction.options.getInteger('bitrate');
    const region = interaction.options.getString('region');
    const videoQuality = interaction.options.getInteger(
      'video',
    ) as VideoQualityMode | null;
    const slowMode = interaction.options.getInteger('slow');
    const nsfw = interaction.options.getBoolean('nsfw');

    if (
      // eslint-disable-next-line no-constant-binary-expression
      true
      && name == null
      && limit == null
      && bitrate == null
      && region == null
      && videoQuality == null
      && slowMode == null
      && nsfw == null
    ) {
      embed.setColor(Colors.Red).setDescription('請至少提供一個選項');
      return;
    }

    await this.database
      .insert(userVoiceChannel)
      .values({
        userId: interaction.member.id,
        bitrate,
        limit,
        name,
        nsfw,
        region,
        videoQuality,
        slowMode,
      })
      .onConflictDoUpdate({
        target: userVoiceChannel.userId,
        set: {
          bitrate,
          limit,
          name,
          nsfw,
          region,
          videoQuality,
          slowMode,
        },
      });

    const videoQualityString = {
      [VideoQualityMode.Auto]: $t('voice:video_quality.auto'),
      [VideoQualityMode.Full]: $t('voice:video_quality.full'),
    };

    embed
      .setColor(Colors.Green)
      .setTitle('✅ 已更新個人語音頻道偏好設定')
      .addFields(
        {
          name: '位元率',
          value: bitrate == null ? '`未設定`' : `${bitrate} kbps`,
          inline: true,
        },
        {
          name: '人數上限',
          value: `${limit || '無上限'}`,
          inline: true,
        },
        {
          name: '地區',
          value: `${region}`,
          inline: true,
        },
        {
          name: '視訊畫質',
          value: `${videoQuality == null ? '`未設定`' : `${videoQualityString[videoQuality]}`}`,
          inline: true,
        },
        {
          name: '低速模式',
          value:
            slowMode == null
              ? '`未設定`'
              : slowMode == 0
                ? '無限速'
                : `${slowMode}秒`,
          inline: true,
        },
        {
          name: 'NSFW',
          value: `${nsfw}`,
          inline: true,
        },
      );
  },
} as KamiSubCommand<EmbedBuilder>;
