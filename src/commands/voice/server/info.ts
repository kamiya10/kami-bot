import {
  ChannelType,
  Collection,
  Colors,
  EmbedBuilder,
  SlashCommandChannelOption,
  SlashCommandSubcommandBuilder,
} from 'discord.js';
import { $at } from '@/class/utils';
import { t as $t } from 'i18next';

import type { KamiSubCommand } from '@/class/command';
import { eq } from 'drizzle-orm';
import { guildVoiceChannel } from '@/database/schema';

const channelOption = new SlashCommandChannelOption()
  .setName('channel')
  .setNameLocalizations($at('slash:voice.server.info.%channel.$name'))
  .setDescription('Show the specific temporary voice channel creator configuration.')
  .setDescriptionLocalizations($at('slash:voice.server.info.%channel.$desc'))
  .addChannelTypes(ChannelType.GuildVoice);

const pageCache = new Collection<string, EmbedBuilder[]>();

export default {
  builder: new SlashCommandSubcommandBuilder()
    .setName('info')
    .setNameLocalizations($at('slash:voice.server.info.$name'))
    .setDescription(
      'Get currently configured temporary voice channel creators.',
    )
    .setDescriptionLocalizations($at('slash:voice.server.info.$desc'))
    .addChannelOption(channelOption),
  async execute(interaction) {
    const ch = interaction.options.getChannel<ChannelType.GuildVoice>('channel');

    const data = await this.database.query
      .guildVoiceChannel
      .findMany({
        where: ch
          ? eq(guildVoiceChannel.channelId, ch.id)
          : eq(guildVoiceChannel.guildId, interaction.guild.id),
      });

    const embed = new EmbedBuilder()
      .setColor(Colors.Blue)
      .setAuthor({
        name: $t('header:voice', {
          lng: interaction.locale,
          0: interaction.guild.name,
        }),
        iconURL: interaction.guild.iconURL() ?? '',
      });

    if (!data.length) {
      embed.setDescription('沒有已設定的語音頻道');
      await interaction.editReply({
        embeds: [embed],
      });
      return;
    }

    const pages: EmbedBuilder[] = [];
    const failed: string[] = [];

    for (const setting of data) {
      const page = new EmbedBuilder(embed.data);
      const channel = this.channels.cache.get(setting.channelId);

      if (!channel?.isVoiceBased()) {
        failed.push(setting.channelId);
        continue;
      }

      let description = `${channel}`;

      if (setting.categoryId) {
        const category = this.channels.cache.get(setting.categoryId);
        description += ` ➜ ${category}`;
      }

      page
        .setDescription(description)
        .addFields(
          {
            name: '位元率',
            value: `${setting.bitrate} kbps`,
            inline: true,
          },
          {
            name: '人數上限',
            value: `${setting.limit || '無上限'}`,
            inline: true,
          },
          {
            name: '地區',
            value: `${setting.region}`,
            inline: true,
          },
          {
            name: '視訊畫質',
            value: `${setting.videoQuality}`,
            inline: true,
          },
          {
            name: '低速模式',
            value: `${setting.slowMode}`,
            inline: true,
          },
          {
            name: 'NSFW',
            value: `${setting.nsfw}`,
            inline: true,
          },
        );

      pages.push(page);
    }

    pageCache.set(interaction.guild.id, pages);
  },
} as KamiSubCommand;
