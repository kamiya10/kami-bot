import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  Collection,
  Colors,
  EmbedBuilder,
  inlineCode,
  SlashCommandChannelOption,
  SlashCommandSubcommandBuilder,
  VideoQualityMode,
} from 'discord.js';
import { $at } from '@/class/utils';
import { t as $t } from 'i18next';
import { eq } from 'drizzle-orm';
import { formatVoiceName } from '@/utils/voice';
import { guildVoiceChannel } from '@/database/schema';

import type { KamiSubCommand } from '@/class/command';

const channelOption = new SlashCommandChannelOption()
  .setName('channel')
  .setNameLocalizations($at('slash:voice.server.info.%channel.$name'))
  .setDescription(
    'Show the specific temporary voice channel creator configuration.',
  )
  .setDescriptionLocalizations($at('slash:voice.server.info.%channel.$desc'))
  .addChannelTypes(ChannelType.GuildVoice);

const pageCache = new Collection<
  string,
  { index: number; pages: EmbedBuilder[] }
>();

export default {
  builder: new SlashCommandSubcommandBuilder()
    .setName('info')
    .setNameLocalizations($at('slash:voice.server.info.$name'))
    .setDescription(
      'Get currently configured temporary voice channel creators.',
    )
    .setDescriptionLocalizations($at('slash:voice.server.info.$desc'))
    .addChannelOption(channelOption),
  async execute(interaction, embed) {
    const ch
      = interaction.options.getChannel<ChannelType.GuildVoice>('channel');

    const data = await this.database.query.guildVoiceChannel.findMany({
      where: ch
        ? eq(guildVoiceChannel.channelId, ch.id)
        : eq(guildVoiceChannel.guildId, interaction.guild.id),
    });

    if (!data.length) {
      embed
        .setColor(Colors.Grey)
        .setDescription($t('voice:no_settings', { lng: interaction.locale }));
      await interaction.editReply({
        embeds: [embed],
      });
      return true;
    }

    const pages: EmbedBuilder[] = [];
    const failed: string[] = [];

    for (let i = 0, n = data.length; i < n; i++) {
      const setting = data[i];
      const page = new EmbedBuilder(embed.data);
      const channel = this.channels.cache.get(setting.channelId);

      if (!channel?.isVoiceBased()) {
        failed.push(setting.channelId);
        continue;
      }

      const videoQualityString = {
        [VideoQualityMode.Auto]: $t('voice:@video.auto', {
          lng: interaction.locale,
        }),
        [VideoQualityMode.Full]: $t('voice:@video.full', {
          lng: interaction.locale,
        }),
      } as Record<number, string>;

      let description = `${channel}`;

      if (setting.categoryId) {
        const category = this.channels.cache.get(setting.categoryId);
        if (category?.type == ChannelType.GuildCategory) {
          description += ` ➜ 📁${category.name}`;
        }
      }

      const voiceRegionI18nKey = `voice:@region.${setting.region ?? 'auto'}`;

      page
        .setDescription(description)
        .setFooter({
          text: $t('voice:page_footer', {
            lng: interaction.locale,
            0: i + 1,
            1: data.length,
          }),
        })
        .addFields(
          {
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
            value:
              setting.limit == 0
                ? $t('voice:@limit.disabled', { lng: interaction.locale })
                : `${setting.limit}`,
            inline: true,
          },
          {
            name: $t('voice:region', { lng: interaction.locale }),
            value: $t(voiceRegionI18nKey, voiceRegionI18nKey, {
              lng: interaction.locale,
            }),
            inline: true,
          },
          {
            name: $t('voice:video', { lng: interaction.locale }),
            value: `${`${videoQualityString[setting.videoQuality]}`}`,
            inline: true,
          },
          {
            name: $t('voice:slow', { lng: interaction.locale }),
            value:
              setting.slowMode == 0
                ? $t('voice:@slow.disabled', { lng: interaction.locale })
                : setting.slowMode < 60
                  ? $t('voice:@slow.seconds', {
                    lng: interaction.locale,
                    0: setting.slowMode,
                  })
                  : setting.slowMode < 3600
                    ? $t('voice:@slow.minutes', {
                      lng: interaction.locale,
                      0: Math.trunc(setting.slowMode / 60),
                    })
                    : $t('voice:@slow.hours', {
                      lng: interaction.locale,
                      0: Math.trunc(setting.slowMode / 3600),
                    }),
            inline: true,
          },
          {
            name: $t('slash:voice.set.%nsfw.$name', {
              lng: interaction.locale,
            }),
            value: `${setting.nsfw}`,
            inline: true,
          },
        );

      pages.push(page);
    }

    pageCache.set(interaction.guild.id, { index: 0, pages });

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('voice:info-prev')
          .setEmoji('◀️')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true),
      )
      .addComponents(
        new ButtonBuilder()
          .setCustomId('voice:info-next')
          .setEmoji('▶️')
          .setStyle(ButtonStyle.Secondary),
      );

    await interaction.editReply({
      embeds: [pages[0]],
      components: data.length > 1 ? [row] : [],
    });

    return true;
  },
  async onButton(interaction, buttonId) {
    const cache = pageCache.get(interaction.guild.id);
    if (!cache) return;

    if (buttonId == 'info-prev') {
      cache.index--;
    }

    if (buttonId == 'info-next') {
      cache.index++;
    }

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('voice:info-prev')
          .setEmoji('◀️')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(cache.index <= 0),
      )
      .addComponents(
        new ButtonBuilder()
          .setCustomId('voice:info-next')
          .setEmoji('▶️')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(cache.index >= cache.pages.length - 1),
      );

    await interaction.editReply({
      embeds: [cache.pages[cache.index]],
      components: [row],
    });
  },
} as KamiSubCommand<EmbedBuilder>;
