// @ts-check

import {
  Colors,
  EmbedBuilder,
  GuildMember,
  ImageFormat,
  InteractionContextType,
  SlashCommandBooleanOption,
  SlashCommandBuilder,
  SlashCommandUserOption,
  hyperlink,
} from 'discord.js';
import { $at } from '@/class/utils';
import { t as $t } from 'i18next';
import { KamiCommand } from '@/class/command';

/**
 * The /avatar command.
 */
export default new KamiCommand({
  builder: new SlashCommandBuilder()
    .setName('avatar')
    .setNameLocalizations($at('slash:avatar.$name'))
    .setDescription('Get the avatar of a member.')
    .setDescriptionLocalizations($at('slash:avatar.$desc'))
    .setContexts(InteractionContextType.Guild)
    .addUserOption(
      new SlashCommandUserOption()
        .setName('member')
        .setNameLocalizations($at('slash:avatar.%member.$name'))
        .setDescription('The member to get the avatar of.')
        .setDescriptionLocalizations($at('slash:avatar.%member.$desc')),
    )
    .addBooleanOption(
      new SlashCommandBooleanOption()
        .setName('server')
        .setNameLocalizations($at('slash:avatar.%server.$name'))
        .setDescription('Get the server specific avatar.')
        .setDescriptionLocalizations($at('slash:avatar.%server.$desc')),
    ),
  defer: true,
  ephemeral: true,
  async execute(interaction) {
    const member
      = interaction.options.getMember('member') ?? interaction.member;
    const server = interaction.options.getBoolean('server');
    const urls = {} as Record<ImageFormat, string>;
    const embed = new EmbedBuilder();

    if (member instanceof GuildMember) {
      embed.setAuthor({
        name: $t('header:avatar', {
          lng: interaction.locale,
          0: member.displayName,
        }),
        iconURL: member.displayAvatarURL(),
      });

      await member.fetch(true);

      if (typeof server == 'boolean') {
        if (server) {
          if (member.avatar) {
            embed.setThumbnail(member.avatarURL({ size: 256 }));
            urls.jpeg = member.avatarURL({
              extension: ImageFormat.JPEG,
              size: 4096,
              forceStatic: false,
            })!;
            urls.png = member.avatarURL({
              extension: ImageFormat.PNG,
              size: 4096,
              forceStatic: false,
            })!;
            urls.webp = member.avatarURL({
              extension: ImageFormat.WebP,
              size: 4096,
              forceStatic: false,
            })!;
            urls.gif = member.avatarURL({
              extension: ImageFormat.GIF,
              size: 4096,
            })!;
          }
          else {
            embed
              .setColor(Colors.Red)
              .setDescription('❌ This member has no server specific avatar.');
          }
        }
        else {
          embed.setThumbnail(member.user.displayAvatarURL({ size: 256 }));
          urls.jpeg = member.user.displayAvatarURL({
            extension: ImageFormat.JPEG,
            size: 4096,
            forceStatic: false,
          });
          urls.png = member.user.displayAvatarURL({
            extension: ImageFormat.PNG,
            size: 4096,
            forceStatic: false,
          });
          urls.webp = member.user.displayAvatarURL({
            extension: ImageFormat.WebP,
            size: 4096,
            forceStatic: false,
          });
          urls.gif = member.user.displayAvatarURL({
            extension: ImageFormat.GIF,
            size: 4096,
          });
        }
      }
      else {
        embed.setThumbnail(member.displayAvatarURL({ size: 256 }));
        urls.jpeg = member.displayAvatarURL({
          extension: ImageFormat.JPEG,
          size: 4096,
          forceStatic: false,
        });
        urls.png = member.displayAvatarURL({
          extension: ImageFormat.PNG,
          size: 4096,
          forceStatic: false,
        });
        urls.webp = member.displayAvatarURL({
          extension: ImageFormat.WebP,
          size: 4096,
          forceStatic: false,
        });
        urls.gif = member.displayAvatarURL({
          extension: ImageFormat.GIF,
          size: 4096,
        });
      }

      embed
        .setColor(Colors.Blue)
        .setDescription(
          `**Image Formats:**\n${(['JPEG', 'PNG', 'WebP', 'GIF'] as const)
            .map((format) => hyperlink(format, urls[ImageFormat[format]]))
            .join('🔸')}`,
        );
    }
    else {
      embed.setColor(Colors.Red).setDescription('❌ Member not found.');
    }

    await interaction.editReply({
      embeds: [embed],
    });
  },
});
