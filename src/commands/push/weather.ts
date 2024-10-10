import {
  ChannelType,
  Colors,
  EmbedBuilder,
  SlashCommandChannelOption,
  SlashCommandStringOption,
  SlashCommandSubcommandBuilder,
} from 'discord.js';
import { WeatherAdvisoryMessageStyle } from '@/utils/weatherAdvisory';
import { eq } from 'drizzle-orm';
import { guildWeatherAdvisoryChannel } from '@/database/schema';
import { $at } from '@/class/utils';
import { t as $t } from 'i18next';

import type { KamiSubCommand } from '@/class/command';

const channelOption = new SlashCommandChannelOption()
  .setName('channel')
  .setNameLocalizations($at('slash:push.weather.%channel.$name'))
  .setDescription(
    'The channel push notification should send to, leave this field empty to unsubscribe.',
  )
  .setDescriptionLocalizations($at('slash:push.weather.%channel.$desc'))
  .addChannelTypes(ChannelType.GuildText);

const styleOption = new SlashCommandStringOption()
  .setName('style')
  .setNameLocalizations($at('slash:push.weather.%style.$name'))
  .setDescription('The style of the push notification')
  .setDescriptionLocalizations($at('slash:push.weather.%style.$desc'))
  .addChoices(
    {
      name: WeatherAdvisoryMessageStyle.Text,
      value: WeatherAdvisoryMessageStyle.Text,
    },
    {
      name: WeatherAdvisoryMessageStyle.Simple,
      value: WeatherAdvisoryMessageStyle.Simple,
    },
    {
      name: WeatherAdvisoryMessageStyle.Detailed,
      value: WeatherAdvisoryMessageStyle.Detailed,
    },
  );

export default {
  builder: new SlashCommandSubcommandBuilder()
    .setName('weather')
    .setNameLocalizations($at('slash:push.weather.$name'))
    .setDescription('Subscribe to weather advisory push notifications.')
    .setDescriptionLocalizations($at('slash:push.weather.$desc'))
    .addChannelOption(channelOption)
    .addStringOption(styleOption),
  async execute(interaction) {
    const channel
      = interaction.options.getChannel<ChannelType.GuildText>('channel');
    const style = interaction.options.getString('style') ?? undefined;

    const embed = new EmbedBuilder()
      .setAuthor({
        name: $t('push:weather.header', {
          lng: interaction.locale,
          0: interaction.guild.name,
        }),
        iconURL: interaction.guild.iconURL() ?? '',
      })
      .setColor(Colors.Blue)
      .setDescription('✅');

    if (!channel) {
      await this.database
        .delete(guildWeatherAdvisoryChannel)
        .where(eq(guildWeatherAdvisoryChannel.guildId, interaction.guild.id));

      embed.setDescription(
        $t('push:weather.remove_success', { lng: interaction.locale }),
      );

      await interaction.editReply({ embeds: [embed] });
      return;
    }

    const data = await this.database
      .insert(guildWeatherAdvisoryChannel)
      .values({
        guildId: interaction.guild.id,
        channelId: channel.id,
        style,
      })
      .onConflictDoUpdate({
        target: guildWeatherAdvisoryChannel.guildId,
        set: {
          channelId: channel.id,
          style,
        },
      })
      .returning();

    const setting = data[0];

    embed
      .setDescription(
        $t('push:weather.set_push_success', { lng: interaction.locale }),
      )
      .addFields(
        {
          name: $t('push:weather.channel', { lng: interaction.locale }),
          value: channel.toString(),
          inline: true,
        },
        {
          name: $t('push:weather.style', { lng: interaction.locale }),
          value: setting.style,
          inline: true,
        },
      );

    await interaction.editReply({ embeds: [embed] });
  },
} as KamiSubCommand;
