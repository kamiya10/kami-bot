/* eslint-disable no-irregular-whitespace */
// @ts-check

import {
  codeBlock,
  EmbedBuilder,
  InteractionContextType,
  SlashCommandBuilder,
  SlashCommandStringOption,
} from 'discord.js';
import { $at } from '@/class/utils';
import { t as $t } from 'i18next';

import convert from 'color-convert';
import tinycolor from 'tinycolor2';
import { KamiCommand } from '@/class/command';

/**
 * The /ping command.
 */
export default new KamiCommand({
  builder: new SlashCommandBuilder()
    .setName('color')
    .setNameLocalizations($at('slash:color.$name'))
    .setDescription('Converts a color into many forms.')
    .setDescriptionLocalizations($at('slash:color.$desc'))
    .setContexts(
      InteractionContextType.BotDM,
      InteractionContextType.Guild,
      InteractionContextType.PrivateChannel,
    )
    .addStringOption(
      new SlashCommandStringOption()
        .setName('color')
        .setNameLocalizations($at('slash:color.%color.$name'))
        .setDescription(
          'The color to convert. Accepts hex colors, rgb, hsl, hsv, cmyk, or named. Omit to get a random color.',
        )
        .setDescriptionLocalizations($at('slash:color.%color.$desc')),
    ),
  defer: true,
  ephemeral: true,
  async execute(interaction) {
    const colorString = interaction.options.getString('color');

    const embed = new EmbedBuilder().setAuthor({
      name: $t('header:color', {
        lng: interaction.locale,
        0: interaction.user.displayName,
      }),
      iconURL: this.user!.displayAvatarURL(),
    });

    let color: tinycolor.Instance;

    if (colorString) {
      color = tinycolor(colorString);
    }
    else {
      color = tinycolor.random();
    }

    const isOpaque = color.getAlpha() == 1;

    const hex = color.toHex();
    const hex8 = color.toHex8();
    const rgb = color.toRgb();
    const rgbPercentage = color.toPercentageRgb();
    const cmy = [
      Math.round(((255 - rgb.r) / 255) * 10000) / 10000,
      Math.round(((255 - rgb.g) / 255) * 10000) / 10000,
      Math.round(((255 - rgb.b) / 255) * 10000) / 10000,
    ];
    const cmyk = convert.rgb.cmyk(rgb.r, rgb.g, rgb.b);
    const hsv = convert.rgb.hsv(rgb.r, rgb.g, rgb.b);
    const hsl = convert.rgb.hsl(rgb.r, rgb.g, rgb.b);
    const hwb = convert.rgb.hwb(rgb.r, rgb.g, rgb.b);
    // const hcg = convert.rgb.hcg(rgb.r, rgb.g, rgb.b);
    // const lch = convert.rgb.lch(rgb.r, rgb.g, rgb.b);
    // const lab = convert.rgb.lab(rgb.r, rgb.g, rgb.b);
    const xyz = convert.rgb.xyz(rgb.r, rgb.g, rgb.b);
    const yiq = [
      Math.round(0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b),
      Math.round(0.596 * rgb.r - 0.274 * rgb.g - 0.322 * rgb.b),
      Math.round(0.211 * rgb.r - 0.523 * rgb.g + 0.312 * rgb.b),
    ];
    const name = color.toName();
    const namePossible = convert.rgb.keyword(rgb.r, rgb.g, rgb.b);
    const ansi16 = convert.rgb.ansi16(rgb.r, rgb.g, rgb.b);
    const ansi256 = convert.rgb.ansi256(rgb.r, rgb.g, rgb.b);

    const colorHex = isOpaque ? hex : hex8;
    const colorAsNumber = isOpaque ? Number(`0x${hex}`) : Number(`0x${hex8}`);

    const hexJs = codeBlock('js', `0x${colorHex}`);
    const hexCss = codeBlock('css', `#${colorHex}`);

    const decimalJs = codeBlock('js', `${colorAsNumber}`);
    const decimalJava = codeBlock('java', `Decimal(${colorAsNumber})`);

    // rgb(r g b / a)
    const rgbCss = codeBlock(
      'css',
      `rgb(${rgb.r} ${rgb.g} ${rgb.b}${!isOpaque ? ` / ${rgb.a}` : ''})`,
    );

    // hsv(h s v / a)
    const hsvCss = codeBlock(
      'css',
      `hsv(${hsv[0]}deg ${hsv[1]}% ${hsv[2]}%${!isOpaque ? ` / ${rgb.a}` : ''})`,
    );

    // hsl(h s l / a)
    const hslCss = codeBlock(
      'css',
      `hsl(${hsl[0]}deg ${hsl[1]}% ${hsl[2]}%${!isOpaque ? ` / ${rgb.a}` : ''})`,
    );

    // hwb(h s l / a)
    const hwbCss = codeBlock(
      'css',
      `hwb(${hwb[0]}deg ${hwb[1]}% ${hwb[2]}%${!isOpaque ? ` / ${rgb.a}` : ''})`,
    );

    // xyz(x, y, z)
    const xyzCss = codeBlock(
      'css',
      `${isOpaque ? 'xyz' : 'xyza'}(${xyz[0]}, ${xyz[1]}, ${xyz[2]}${
        !isOpaque ? `, ${rgb.a}` : ''
      })`,
    );

    // yiq(y, i, q)
    const yiqCss = codeBlock(
      'css',
      `${isOpaque ? 'yiq' : 'yiqa'}(${yiq[0]}, ${yiq[1]}, ${yiq[2]}${
        !isOpaque ? `, ${rgb.a}` : ''
      })`,
    );

    // Color.valueOf(4289736237)
    const androidNumber = codeBlock(
      'java',
      `Color.valueOf(${Number(`0x${hex8.slice(6)}${hex}`)})`,
    );

    // Color.valueOf(0xffb02e2d)
    const androidHex = codeBlock(
      'java',
      `Color.valueOf(0x${hex8.slice(6)}${hex})`,
    );

    // cmy(c% m% y%)
    const cmyCss = codeBlock('css', `cmy(${cmy[0]}% ${cmy[1]}% ${cmy[2]}%)`);

    // cmyk(c% m% y% k%)
    const cmykCss = codeBlock(
      'css',
      `cmyk(${cmyk[0]}% ${cmyk[1]}% ${cmyk[2]}% ${cmyk[3]}%)`,
    );

    embed
      .setColor(Number(`0x${color.toHex()}`))
      .setThumbnail(`https://singlecolorimage.com/get/${hex}/128x128`)
      .setDescription(colorString)
      .addFields(
        ...[
          {
            name: 'Color Name',
            value: `${name || '*`None`*'}${
              name != namePossible ? ` (around ${namePossible})` : ''
            }`,
          },
          {
            name: 'hex',
            value: `${hexJs}${hexCss}`,
            inline: true,
          },
          {
            name: 'decimal',
            value: `${decimalJs}${decimalJava}`,
            inline: true,
          },
          {
            name: 'rgb',
            value: `🟥 ${rgb.r} (${rgbPercentage.r})　🟩 ${rgb.g} (${
              rgbPercentage.g
            })　🟦 ${rgb.b} (${rgbPercentage.b})\n${rgbCss}`,
          },
          {
            name: 'hsv',
            value: `🏳️‍🌈 ${hsv[0]}°　<:hsv_s:1184500143567945778> ${
              hsv[1]
            }%　<:hsv_v:1184500676227764266> ${hsv[2]}%\n${hsvCss}`,
            inline: true,
          },
          {
            name: 'hsl',
            value: `🏳️‍🌈 ${hsl[0]}°　<:hsl_s:1184501512999800843> ${
              hsl[1]
            }%　<:hsl_l:1184500903764566146> ${hsl[2]}%\n${hslCss}`,
            inline: true,
          },
          {
            name: 'hwb',
            value: `🏳️‍🌈 ${hwb[0]}°　⬜ ${hwb[1]}%　⬛ ${hwb[2]}%\n${hwbCss}`,
          },
          {
            name: 'xyz',
            value: `🇽 ${xyz[0]}　🇾 ${cmyk[1]}　🇿 ${xyz[2]}\n${xyzCss}`,
            inline: true,
          },
          {
            name: 'yiq',
            value: `🇾 ${yiq[0]}　🇮 ${yiq[1]}　🇶 ${yiq[2]}\n${yiqCss}`,
            inline: true,
          },
          {
            name: 'Android ARGB (android.graphics.Color)',
            value: `${androidNumber}${androidHex}`,
          },
          {
            name: 'cmy',
            value: `<:cmyk_c:1184522220995874847> ${cmy[0]} (${Math.round(
              cmy[0] * 100,
            )}%)　<:cmyk_m:1184522450306879548> ${cmy[1]} (${Math.round(
              cmy[1] * 100,
            )}%)　🟨 ${cmy[2]} (${Math.round(cmy[2] * 100)}%)\n${cmyCss}`,
          },
          {
            name: 'cmyk',
            value: `<:cmyk_c:1184522220995874847> ${cmyk[0] / 100} (${
              cmyk[0]
            }%)　<:cmyk_m:1184522450306879548> ${cmyk[1] / 100} (${
              cmyk[1]
            }%)　🟨 ${cmyk[2] / 100} (${cmyk[2]}%)　⬛ ${cmyk[3] / 100} (${
              cmyk[3]
            }%)\n${cmykCss}`,
          },
          {
            name: 'ansi',
            value: [
              `ansi16 \`\\x1b[${ansi16}m\``,
              `ansi256 fg \`\\x1b[38;5;${ansi256}m\``,
              `ansi256 bg \`\\x1b[48;5;${ansi256}m\``,
            ].join('\n'),
          },
        ],
      );

    await interaction.editReply({ embeds: [embed] });
  },
});
