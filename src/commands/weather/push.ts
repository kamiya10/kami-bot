import { ChannelType, SlashCommandChannelOption, SlashCommandStringOption, SlashCommandSubcommandBuilder } from 'discord.js';
import { WeatherAdvisoryMessageStyle } from '@/utils/weatherAdvisory';
import { eq } from 'drizzle-orm';
import { guildWeatherAdvisoryChannel } from '@/database/schema';
import { $at } from '@/class/utils';
import { t as $t } from 'i18next';

import type { EmbedBuilder } from 'discord.js';
import type { KamiSubCommand } from '@/class/command';

const channelOption = new SlashCommandChannelOption()
  .setName('channel')
  .setNameLocalizations($at('slash:weather.push.%channel.$name'))
  .setDescription('The channel push notification should send to.')
  .setDescriptionLocalizations($at('slash:weather.push.%channel.$desc'))
  .addChannelTypes(ChannelType.GuildText);

const styleOption = new SlashCommandStringOption()
  .setName('style')
  .setDescription('The style of the push notification')
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
    .setName('push')
    .setNameLocalizations($at('slash:weather.push.$name'))
    .setDescription('Subscribe to weather advisory push notifications.')
    .setDescriptionLocalizations($at('slash:weather.push.$desc'))
    .addChannelOption(channelOption)
    .addStringOption(styleOption),
  async execute(interaction, embed) {
    const channel = interaction.options.getChannel<ChannelType.GuildText>('channel');
    const style = interaction.options.getString('style') ?? undefined;

    if (!channel) {
      await this.database
        .delete(guildWeatherAdvisoryChannel)
        .where(eq(guildWeatherAdvisoryChannel.guildId, interaction.guild.id));

      embed.setDescription($t('weather:remove_success', { lng: interaction.locale }));

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
      .setDescription($t('weather:set_push_success', { lng: interaction.locale }))
      .addFields(
        {
          name: $t('weather:channel', { lng: interaction.locale }),
          value: channel.toString(),
          inline: true,
        },
        {
          name: $t('weather:style', { lng: interaction.locale }),
          value: setting.style,
          inline: true,
        },
      );
  },
} as KamiSubCommand<EmbedBuilder>;
