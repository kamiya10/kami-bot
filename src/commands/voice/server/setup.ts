import { ActionRowBuilder, ButtonBuilder, ButtonStyle, CategoryChannel, ChannelType, codeBlock, Colors, ComponentType, EmbedBuilder, PermissionFlagsBits, SlashCommandSubcommandBuilder } from 'discord.js';
import { $at } from '@/class/utils';
import { t as $t } from 'i18next';

import type { KamiSubCommand } from '@/class/command';

const ChannelIcons = {
  [ChannelType.GuildAnnouncement]: '📢',
  [ChannelType.GuildCategory]: '📁',
  [ChannelType.GuildForum]: '💬',
  [ChannelType.GuildMedia]: '🖼️',
  [ChannelType.GuildStageVoice]: '🎤',
  [ChannelType.GuildText]: '#️⃣',
  [ChannelType.GuildVoice]: '🔊',
};

const requiredPermissions = [
  PermissionFlagsBits.ManageChannels,
  PermissionFlagsBits.MoveMembers,
] as const;

const voiceChannelTypes = [ChannelType.GuildVoice, ChannelType.GuildStageVoice];

export default {
  builder: new SlashCommandSubcommandBuilder()
    .setName('setup')
    .setNameLocalizations($at('slash:voice.server.setup.$name'))
    .setDescription('Setup a temporary voice channel creator.')
    .setDescriptionLocalizations($at('slash:voice.server.setup.$desc')),
  async execute(interaction) {
    const permissions = interaction.guild?.members.me?.permissions;
    const permissionEmbed = new EmbedBuilder();

    if (!permissions) {
      permissionEmbed
        .setColor(Colors.Red)
        .setDescription(
          `Insufficient Permissions. (Missing ${requiredPermissions.join(' ')})`,
        );

      await interaction.editReply({ embeds: [permissionEmbed] });

      return;
    }
    else if (!permissions.has(requiredPermissions)) {
      permissionEmbed
        .setColor(Colors.Red)
        .setDescription(
          `Insufficient Permissions. (Missing ${permissions
            .missing(requiredPermissions)
            .join(' ')})`,
        );

      await interaction.editReply({ embeds: [permissionEmbed] });

      return;
    }

    const lastCategory = interaction.guild.channels.cache
      .filter((ch) => ch instanceof CategoryChannel)
      .sort((a, b) => b.position - a.position)
      .first();

    const diffTree = [];

    if (lastCategory instanceof CategoryChannel) {
      const lastCategoryChildren = lastCategory.children.cache.sort(
        (a, b) =>
          ((a.position + 1) << (voiceChannelTypes.includes(a.type) ? 8 : 0))
          - ((b.position + 2) << (voiceChannelTypes.includes(b.type) ? 8 : 0)),
      );

      if (lastCategoryChildren.size) {
        diffTree.push(
          `  ${ChannelIcons[lastCategoryChildren.first()!.parent!.type]} ${
            lastCategoryChildren.first()!.parent!.name
          }`,
        );
        diffTree.push(
          ...lastCategoryChildren
            .map((ch) => `${ChannelIcons[ch.type]} ${ch.name}`)
            .map((v, i, a) => `${i == a.length - 1 ? '   └' : '   ├'} ${v}`),
        );
      }
    }

    diffTree.push('+ Temporary Voice Channels\n+  └ 🔊 Create Channel');

    const confirmationEmbed = new EmbedBuilder()
      .setColor(Colors.Blue)
      .setDescription(
        'Doing this will create a category channel and a voice channel to your server. Do you want to proceed?\nThis can be undone by deleting the created channels.',
      )
      .addFields({
        name: 'Diff Changes',
        value: codeBlock('diff', diffTree.join('\n')),
      });

    const actions = new ActionRowBuilder<ButtonBuilder>().setComponents(
      new ButtonBuilder()
        .setStyle(ButtonStyle.Primary)
        .setCustomId('cancel')
        .setLabel('Cancel'),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setCustomId('proceed')
        .setLabel('Proceed'),
    );

    const sent = await interaction.editReply({
      embeds: [confirmationEmbed],
      components: [actions],
    });

    try {
      const decision = await sent.awaitMessageComponent({
        componentType: ComponentType.Button,
        time: 30000,
      });

      if (decision.customId == 'cancel') {
        await decision.update({
          embeds: [
            new EmbedBuilder()
              .setColor(Colors.Blue)
              .setDescription(
                'Temporary Voice Channel Setup has been cancelled.',
              ),
          ],
          components: [],
        });

        setTimeout(() => void sent.delete(), 5000);
        return;
      }

      const progressEmbed = new EmbedBuilder()
        .setColor(Colors.Yellow)
        .setDescription('Setting up Temporary Voice Channel...');

      await decision.update({ embeds: [progressEmbed], components: [] });

      const category = await interaction.guild.channels.create({
        name: 'Temporary Voice Channel',
        type: ChannelType.GuildCategory,
        permissionOverwrites: [
          {
            id: interaction.guild.roles.everyone.id,
            deny: [PermissionFlagsBits.Speak, PermissionFlagsBits.Stream],
          },
          {
            id: interaction.user.id,
            allow: [
              PermissionFlagsBits.ManageChannels,
              PermissionFlagsBits.MoveMembers,
            ],
          },
        ],
      });

      const channel = await interaction.guild.channels.create({
        name: 'Create Channel',
        parent: category,
        type: ChannelType.GuildVoice,
        userLimit: 1,
      });

      guildVoiceData[channel.id] = {
        category: category?.id || null,
        name: null,
        nameOverride: false,
        bitrate: null,
        bitrateOverride: false,
        limit: null,
        limitOverride: false,
        region: null,
        regionOverride: false,
      };

      await this.database.database.guild.write();

      const doneEmbed = new EmbedBuilder()
        .setColor(Colors.Green)
        .setDescription('Temporary Voice Channel has been added to the server.');

      await decision.editReply({ embeds: [doneEmbed], components: [] });
    }
    catch (error) {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.Blue)
            .setDescription(
              'Temporary Voice Channel Setup has timed out.\nPlease try again. </voice server setup:1157680405907001487>',
            ),
        ],
        components: [],
      });

      setTimeout(() => void sent.delete(), 5000);
    }
  },
} as KamiSubCommand;
