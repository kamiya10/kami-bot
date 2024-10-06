import {
  Colors,
  EmbedBuilder,
  SlashCommandBooleanOption,
  SlashCommandIntegerOption,
  SlashCommandStringOption,
  SlashCommandSubcommandBuilder,
  VideoQualityMode,
} from 'discord.js';
import { videoQualityChoices, voiceRegionChoices } from '$/voice';
import { t as $t } from 'i18next';

import type { KamiSubCommand } from '@/class/command';
import { userVoiceChannel } from '@/database/schema';
import { $at } from '@/class/utils';

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
  async execute(interaction, { baseEmbed }) {
    const name = interaction.options.getString('name');
    const limit = interaction.options.getInteger('limit');
    const bitrate = interaction.options.getInteger('bitrate');
    const region = interaction.options.getString('region');
    const videoQuality = interaction.options.getInteger(
      'video',
    ) as VideoQualityMode | null;
    const slowMode = interaction.options.getInteger('slow');
    const nsfw = interaction.options.getBoolean('nsfw');

    const embed = new EmbedBuilder(baseEmbed.data);

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
      await interaction.editReply({
        embeds: [embed],
      });
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

    await interaction.editReply({
      embeds: [embed],
    });
  },
} as KamiSubCommand<{ baseEmbed: EmbedBuilder }>;
