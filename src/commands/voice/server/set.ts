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
  inlineCode,
  SlashCommandChannelOption,
  SlashCommandSubcommandBuilder,
  VideoQualityMode,
} from 'discord.js';
import { $at } from '@/class/utils';
import { t as $t } from 'i18next';
import { guildVoiceChannel } from '@/database/schema';
import { formatVoiceName } from '@/utils/voice';

import type { KamiSubCommand } from '@/class/command';

export const channelOption = new SlashCommandChannelOption()
  .setName('channel')
  .setNameLocalizations($at('slash:voice.server.set.%channel.$name'))
  .setDescription('The channel to be a temporary voice channel creator.')
  .setDescriptionLocalizations($at('slash:voice.server.set.%channel.$desc'))
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
    .setNameLocalizations($at('slash:voice.server.set.$name'))
    .setDescription(
      'Add a voice channel to be a temporary voice channel creator.',
    )
    .setDescriptionLocalizations($at('slash:voice.server.set.$desc'))
    .addChannelOption(channelOption)
    .addChannelOption(categoryOption)
    .addStringOption(nameOption)
    .addIntegerOption(limitOption)
    .addIntegerOption(bitrateOption)
    .addStringOption(regionOption)
    .addIntegerOption(videoQualityOption)
    .addIntegerOption(slowModeOption)
    .addBooleanOption(nsfwOption),
  async execute(interaction, embed) {
    const channel = interaction.options.getChannel<ChannelType.GuildVoice>(
      'channel',
      true,
    );
    const category
      = interaction.options.getChannel<ChannelType.GuildCategory>('category');
    const name = interaction.options.getString('name') ?? undefined;
    const limit = interaction.options.getInteger('limit') ?? undefined;
    const bitrate = interaction.options.getInteger('bitrate') ?? undefined;
    const region = interaction.options.getString('region') ?? undefined;
    const videoQuality
      = (interaction.options.getInteger('video') as VideoQualityMode)
      ?? undefined;
    const slowMode = interaction.options.getInteger('slow') ?? undefined;
    const nsfw = interaction.options.getBoolean('nsfw') ?? undefined;

    const data = await this.database
      .insert(guildVoiceChannel)
      .values({
        guildId: interaction.guild.id,
        channelId: channel.id,
        categoryId: category?.id,
        bitrate,
        limit,
        name: name ?? $t('voice:default_channel_name', { lng: interaction.locale }),
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
      }).returning();
    const setting = data[0];

    const videoQualityString = {
      [VideoQualityMode.Auto]: $t('voice:@video.auto', { lng: interaction.locale }),
      [VideoQualityMode.Full]: $t('voice:@video.full', { lng: interaction.locale }),
    } as Record<number, string>;

    let description = `${channel}`;

    if (category) {
      description += ` ➜ 📁${category.name}`;
    }

    const voiceRegionI18nKey = `voice:@region.${setting.region ?? 'auto'}`;

    embed
      .setColor(Colors.Green)
      .setTitle($t('voice:update_success', { lng: interaction.locale }))
      .setDescription(description)
      .addFields({
        name: $t('voice:name', { lng: interaction.locale }),
        value: [
          inlineCode(setting.name),
          formatVoiceName(setting.name, interaction.member),
        ].join('\n'),
        inline: true,
      },
      {
        name: $t('voice:bitrate', { lng: interaction.locale }),
        value: `${setting.bitrate} kbps`,
        inline: true,
      },
      {
        name: $t('voice:limit', { lng: interaction.locale }),
        value: setting.limit == 0 ? $t('voice:@limit.disabled', { lng: interaction.locale }) : `${setting.limit}`,
        inline: true,
      },
      {
        name: $t('voice:region', { lng: interaction.locale }),
        value: $t(voiceRegionI18nKey, voiceRegionI18nKey, { lng: interaction.locale }),
        inline: true,
      },
      {
        name: $t('voice:video', { lng: interaction.locale }),
        value: `${`${videoQualityString[setting.videoQuality]}`}`,
        inline: true,
      },
      {
        name: $t('voice:slow', { lng: interaction.locale }),
        value: setting.slowMode == 0
          ? $t('voice:@slow.disabled', { lng: interaction.locale })
          : setting.slowMode < 60
            ? $t('voice:@slow.seconds', { lng: interaction.locale, 0: setting.slowMode })
            : setting.slowMode < 3600
              ? $t('voice:@slow.minutes', { lng: interaction.locale, 0: Math.trunc(setting.slowMode / 60) })
              : $t('voice:@slow.hours', { lng: interaction.locale, 0: Math.trunc(setting.slowMode / 3600) }),
        inline: true,
      },
      {
        name: $t('slash:voice.set.%nsfw.$name', { lng: interaction.locale }),
        value: `${setting.nsfw}`,
        inline: true,
      },
      );
  },
} as KamiSubCommand<EmbedBuilder>;
