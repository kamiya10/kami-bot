import { Colors, EmbedBuilder, SlashCommandBooleanOption, SlashCommandBuilder } from 'discord.js';
import { KamiCommand } from '@/class/command';
import { t as $t } from 'i18next';
import { user } from '@/database/schema';

const stateOption = new SlashCommandBooleanOption()
  .setName('state')
  .setDescription('The state of track_voice_activity setting.')
  .setRequired(true);

export default new KamiCommand({
  builder: new SlashCommandBuilder()
    .setName('track_voice_activity')
    .setDescription('Enable or disable voice activity tracking. (Channel Join, Leave, Switch notifications)')
    .addBooleanOption(stateOption),
  ephemeral: true,
  defer: true,
  async execute(interaction) {
    const state = interaction.options.getBoolean('state', true);

    const { trackVoiceActivity } = (await this.database.insert(user).values({
      id: interaction.member.id,
      trackVoiceActivity: state,
    })
      .onConflictDoUpdate({
        target: user.id,
        set: {
          trackVoiceActivity: state,
        },
      })
      .returning({
        trackVoiceActivity: user.trackVoiceActivity,
      }))[0];

    const embed = new EmbedBuilder()
      .setColor(Colors.Green)
      .setAuthor({
        name: $t('header:preference', {
          lng: interaction.locale,
          0: interaction.user.displayName,
        }),
        iconURL: interaction.guild.iconURL() ?? '',
      })
      .setDescription($t('preference:update_success', { lng: interaction.locale }))
      .setFields({
        name: $t('preference:voice_activity_tracking', { lng: interaction.locale }),
        value: `${trackVoiceActivity}`,
      });

    await interaction.editReply({
      embeds: [embed],
    });
  },
});
