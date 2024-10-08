import {
  Colors,
  EmbedBuilder,
  GuildMember,
  PermissionFlagsBits,
  SlashCommandBuilder,
  SlashCommandSubcommandGroupBuilder,
} from 'discord.js';
import { KamiCommand } from '@/class/command';
import { $at } from '@/class/utils';
import { t as $t } from 'i18next';

import voiceServerSet from '$/voice/server/set';
import voiceServerInfo from '$/voice/server/info';
import voiceServerRemove from '$/voice/server/remove';
import voiceClear from '$/voice/clear';
import voiceSet from '$/voice/set';

/**
 * The /voice command.
 * @param {KamiClient} client
 * @returns {KamiCommand}
 */
export default new KamiCommand({
  builder: new SlashCommandBuilder()
    .setName('voice')
    .setNameLocalizations($at('slash:voice.$name'))
    .setDescription('Commands for temporary voice channels.')
    .setDescriptionLocalizations($at('slash:voice.$desc'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addSubcommandGroup(
      new SlashCommandSubcommandGroupBuilder()
        .setName('server')
        .setNameLocalizations($at('slash:voice.server.$name'))
        .setDescription(
          'Server configuration commands for temporary voice channels.',
        )
        .setDescriptionLocalizations($at('slash:voice.server.$desc'))

        // /voice server config
        .addSubcommand(voiceServerSet.builder)

        // /voice server remove
        .addSubcommand(voiceServerRemove.builder)

        // /voice server info
        .addSubcommand(voiceServerInfo.builder),
    )

    // /voice clear
    .addSubcommand(voiceClear.builder)

    // /voice set
    .addSubcommand(voiceSet.builder),
  defer: true,
  ephemeral: true,
  async execute(interaction) {
    const baseEmbed = new EmbedBuilder()
      .setAuthor({
        name: $t('header:voice', {
          lng: interaction.locale,
          0: interaction.guild.name,
        }),
        iconURL: interaction.guild.iconURL() ?? '',
      })
      .setColor(Colors.Blue)
      .setDescription('✅');

    if (interaction.options.getSubcommandGroup(false) == 'server') {
      // /voice server [setup/info/set/remove]
      switch (interaction.options.getSubcommand()) {
        // /voice server info
        case 'info':
          if (await voiceServerInfo.execute.call(this, interaction, baseEmbed)) return;
          break;

        // /voice server config
        case 'set':
          await voiceServerSet.execute.call(this, interaction, baseEmbed);
          break;

        // /voice server remove
        case 'remove':
          await voiceServerRemove.execute.call(this, interaction, baseEmbed);
          break;
      }
    }
    else if (interaction.member instanceof GuildMember) {
      // /voice [clear/set]
      const subcommand = interaction.options.getSubcommand(false);

      switch (subcommand) {
        case 'set': {
          await voiceSet.execute.call(this, interaction, baseEmbed);
          break;
        }

        // /voice clear
        case 'clear': {
          await voiceClear.execute.call(this, interaction, baseEmbed);
          break;
        }

        default: {
          break;
        }
      }
    }

    await interaction.editReply({ embeds: [baseEmbed] });
  },
  async onButton(interaction, buttonId) {
    const [subcommand] = buttonId.split('-');

    switch (subcommand) {
      case 'info':
        await voiceServerInfo.onButton?.call(this, interaction, buttonId);
        break;
    }
  },
});
