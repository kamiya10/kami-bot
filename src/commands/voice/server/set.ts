import {
  bitrateOption,
  limitOption,
  nameOption,
  nsfwOption,
  regionOption,
  slowModeOption,
  videoQualityOption,
} from '../set';
import {
  ChannelType,
  Colors,
  EmbedBuilder,
  SlashCommandChannelOption,
  SlashCommandSubcommandBuilder,
  VideoQualityMode,
} from 'discord.js';
import { $at } from '@/class/utils';
import { t as $t } from 'i18next';

import type { KamiSubCommand } from '@/class/command';
import { guildVoiceChannel } from '@/database/schema';

export const channelOption = new SlashCommandChannelOption()
  .setName('channel')
  .setNameLocalizations($at('slash:voice.server.add.%channel.$name'))
  .setDescription('The channel to be a temporary voice channel creator.')
  .setDescriptionLocalizations($at('slash:voice.server.add.%channel.$desc'))
  .addChannelTypes(ChannelType.GuildVoice)
  .setRequired(true);

const categoryOption = new SlashCommandChannelOption()
  .setName('category')
  .setNameLocalizations($at('slash:voice.server.set.%category.$name'))
  .setDescription('The category temporary voice channel should be created in.')
  .setDescriptionLocalizations($at('slash:voice.server.set.%category.$desc'))
  .addChannelTypes(ChannelType.GuildCategory)
  .setRequired(true);

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
    .addStringOption(regionOption)
    .addIntegerOption(videoQualityOption)
    .addIntegerOption(slowModeOption)
    .addBooleanOption(nsfwOption),
  async execute(interaction, { baseEmbed }) {
    const channel = interaction.options.getChannel<ChannelType.GuildVoice>(
      'channel',
      true,
    );
    const category
      = interaction.options.getChannel<ChannelType.GuildCategory>('category');
    const name = interaction.options.getString('name');
    const limit = interaction.options.getInteger('limit') ?? 0;
    const bitrate = interaction.options.getInteger('bitrate') ?? 64000;
    const region = interaction.options.getString('region');
    const videoQuality
      = (interaction.options.getInteger('video') as VideoQualityMode)
      ?? VideoQualityMode.Auto;
    const slowMode = interaction.options.getInteger('slow') ?? 0;
    const nsfw = interaction.options.getBoolean('nsfw') ?? false;

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
      .insert(guildVoiceChannel)
      .values({
        guildId: interaction.guild.id,
        channelId: channel.id,
        categoryId: category?.id,
        bitrate,
        limit,
        name,
        nsfw,
        region,
        videoQuality,
        slowMode,
      })
      .onConflictDoUpdate({
        target: guildVoiceChannel.channelId,
        set: {
          categoryId: category?.id,
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

    let description = `${channel}`;

    if (category) {
      description += ` ➜ ${category}`;
    }

    embed
      .setColor(Colors.Green)
      .setTitle('✅ 已更新個人語音頻道偏好設定')
      .setDescription(description)
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
