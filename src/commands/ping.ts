// @ts-check

import {
  EmbedBuilder,
  InteractionContextType,
  SlashCommandBuilder,
  TimestampStyles,
  time,
} from 'discord.js';
import { $at } from '@/class/utils';
import { t as $t } from 'i18next';
import { Colors } from 'discord.js';
import { KamiCommand } from '@/class/command';

/**
 * The /ping command.
 */
export default new KamiCommand({
  builder: new SlashCommandBuilder()
    .setName('ping')
    .setNameLocalizations($at('slash:ping.$name'))
    .setDescription('Check if the bot is alive or not.')
    .setDescriptionLocalizations($at('slash:ping.$desc'))
    .setContexts(
      InteractionContextType.BotDM,
      InteractionContextType.Guild,
      InteractionContextType.PrivateChannel,
    ),
  defer: true,
  ephemeral: true,
  async execute(interaction) {
    const start = Date.now();
    const sent = await interaction.editReply('Pong!');
    const end = Date.now();
    const latency = end - start;

    const embed = new EmbedBuilder()
      .setAuthor({
        name: $t('header:ping', {
          lng: interaction.locale,
          0: this.user!.displayName,
        }),
        iconURL: this.user!.displayAvatarURL(),
      })
      .setColor(
        latency >= 1000
          ? Colors.Red
          : latency >= 500
            ? Colors.Yellow
            : Colors.Green,
      )
      .addFields(
        ...[
          {
            name: 'Clock',
            value: `💬 **Message Time**: ${time(
              ~~(sent.createdTimestamp / 1000),
              TimestampStyles.LongDate,
            )}${time(
              ~~(sent.createdTimestamp / 1000),
              TimestampStyles.LongTime,
            )}.${`${new Date(
              ~~(sent.createdTimestamp / 1000),
            ).getMilliseconds()}`.padStart(3, '0')}\n🤖 **Bot Time**: ${time(
              ~~(end / 1000),
              TimestampStyles.LongDate,
            )}${time(
              ~~(end / 1000),
              TimestampStyles.LongTime,
            )}.${`${new Date(~~(end / 1000)).getMilliseconds()}`.padStart(
              3,
              '0',
            )}`,
          },
          {
            name: 'Latency',
            value: `⌛ **Ping**: ${latency}ms\n💓 **Heartbeat**: ${this.ws.ping}ms`,
          },
        ],
      )
      .setTimestamp();

    await interaction.editReply({ content: 'Pong!', embeds: [embed] });
  },
});
