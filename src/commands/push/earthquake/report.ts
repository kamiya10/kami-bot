import {
  ChannelType,
  Colors,
  EmbedBuilder,
  SlashCommandBooleanOption,
  SlashCommandChannelOption,
  SlashCommandStringOption,
  SlashCommandSubcommandBuilder,
} from 'discord.js';
import { ReportMessageStyle } from '@/utils/report';
import { $at } from '@/class/utils';
import { t as $t } from 'i18next';
import { eq } from 'drizzle-orm';
import { guildEqReportChannel } from '@/database/schema';

import type { KamiSubCommand } from '@/class/command';

const channelOption = new SlashCommandChannelOption()
  .setName('channel')
  .setNameLocalizations($at('slash:push.earthquake.report.%channel.$name'))
  .setDescription(
    'The channel push notification should send to, leave this field empty to unsubscribe.',
  )
  .setDescriptionLocalizations($at('slash:push.earthquake.report.%channel.$desc'))
  .addChannelTypes(ChannelType.GuildText);

const numberedOption = new SlashCommandBooleanOption()
  .setName('numbered')
  .setNameLocalizations($at('slash:push.earthquake.report.%numbered.$name'))
  .setDescription('Whether to only receive numbered earthquake reports.')
  .setDescriptionLocalizations($at('slash:push.earthquake.report.%numbered.$desc'));

const styleOption = new SlashCommandStringOption()
  .setName('style')
  .setNameLocalizations($at('slash:push.earthquake.report.%style.$name'))
  .setDescription('The style of the push notification.')
  .setDescriptionLocalizations($at('slash:push.earthquake.report.%style.$desc'))
  .addChoices(
    {
      name: ReportMessageStyle.CwaText,
      value: ReportMessageStyle.CwaText,
    },
    {
      name: ReportMessageStyle.CwaTextWithButton,
      value: ReportMessageStyle.CwaTextWithButton,
    },
    {
      name: ReportMessageStyle.CwaSimple,
      value: ReportMessageStyle.CwaSimple,
    },
    {
      name: ReportMessageStyle.CwaSimpleLarge,
      value: ReportMessageStyle.CwaSimpleLarge,
    },
    {
      name: ReportMessageStyle.Simple,
      value: ReportMessageStyle.Simple,
    },
    {
      name: ReportMessageStyle.Detailed,
      value: ReportMessageStyle.Detailed,
    },
  );

export default {
  builder: new SlashCommandSubcommandBuilder()
    .setName('report')
    .setNameLocalizations($at('slash:push.earthquake.report.$name'))
    .setDescription('Subscribe to weather advisory push notifications.')
    .setDescriptionLocalizations($at('slash:push.earthquake.report.$desc'))
    .addChannelOption(channelOption)
    .addBooleanOption(numberedOption)
    .addStringOption(styleOption),
  async execute(interaction) {
    const channel = interaction.options.getChannel<ChannelType.GuildText>('channel');
    const numbered = interaction.options.getBoolean('numbered') ?? undefined;
    const style = interaction.options.getString('style') ?? undefined;

    const embed = new EmbedBuilder()
      .setAuthor({
        name: $t('push:earthquake.header', {
          lng: interaction.locale,
          0: interaction.guild.name,
        }),
        iconURL: interaction.guild.iconURL() ?? '',
      })
      .setColor(Colors.Blue)
      .setDescription('✅');

    if (!channel) {
      await this.database
        .delete(guildEqReportChannel)
        .where(eq(guildEqReportChannel.guildId, interaction.guild.id));

      embed.setDescription(
        $t('push:earthquake.remove_success', { lng: interaction.locale }),
      );

      await interaction.editReply({ embeds: [embed] });
      return;
    }

    const data = await this.database
      .insert(guildEqReportChannel)
      .values({
        guildId: interaction.guild.id,
        channelId: channel.id,
        numbered,
        style,
      })
      .onConflictDoUpdate({
        target: guildEqReportChannel.guildId,
        set: {
          channelId: channel.id,
          numbered,
          style,
        },
      })
      .returning();

    const setting = data[0];

    embed
      .setDescription(
        $t('push:earthquake.set_push_success', { lng: interaction.locale }),
      )
      .addFields(
        {
          name: $t('push:earthquake.channel', { lng: interaction.locale }),
          value: channel.toString(),
          inline: true,
        },
        {
          name: $t('push:earthquake.numbered', { lng: interaction.locale }),
          value: `${setting.numbered}`,
          inline: true,
        },
        {
          name: $t('push:earthquake.style', { lng: interaction.locale }),
          value: setting.style,
          inline: true,
        },
      );

    await interaction.editReply({ embeds: [embed] });
  },
} as KamiSubCommand;
