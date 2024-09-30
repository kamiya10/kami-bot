/* eslint-disable no-irregular-whitespace */
// @ts-check

import {
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
    .setNameLocalizations($at('slash:color.NAME'))
    .setDescription('Converts a color into many forms.')
    .setDescriptionLocalizations($at('slash:color.DESC'))
    .setContexts(InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel)
    .addStringOption(new SlashCommandStringOption()
      .setName('color')
      .setNameLocalizations($at('slash:color.OPTIONS.color.NAME'))
      .setDescription('The color to convert. Accepts hex colors, rgb, hsl, hsv, cmyk, or named. Omit to get a random color.')
      .setDescriptionLocalizations($at('slash:color.OPTIONS.color.DESC'))),
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
            value: `\`\`\`js\n0x${
              isOpaque ? hex : hex8
            }\`\`\`\n\`\`\`css\n#${
              isOpaque ? hex.toUpperCase() : hex8.toUpperCase()
            }\`\`\`\n\`\`\`css\n#${isOpaque ? hex : hex8}\`\`\``,
            inline: true,
          },
          {
            name: 'decimal',
            value: `\`\`\`js\n${
              isOpaque ? Number(`0x${hex}`) : Number(`0x${hex8}`)
            }\`\`\`\n\`\`\`\nDecimal(${
              isOpaque ? Number(`0x${hex}`) : Number(`0x${hex8}`)
            })\`\`\``,
            inline: true,
          },
          {
            name: isOpaque ? 'rgb' : 'rgba',
            value: `🟥 ${rgb.r} (${rgbPercentage.r})　🟩 ${rgb.g} (${
              rgbPercentage.g
            })　🟦 ${rgb.b} (${rgbPercentage.b})\n\`\`\`css\n${
              isOpaque ? 'rgb' : 'rgba'
            }(${rgb.r}, ${rgb.g}, ${rgb.b}${
              !isOpaque ? `, ${rgb.a}` : ''
            })\`\`\`\n\`\`\`css\nrgb(${rgb.r} ${rgb.g} ${rgb.b}${
              !isOpaque ? ` / ${rgb.a}` : ''
            })\`\`\``,
          },
          {
            name: 'hsv',
            value: `🏳️‍🌈 ${hsv[0]}°　<:hsv_s:1184500143567945778> ${
              hsv[1]
            }%　<:hsv_v:1184500676227764266> ${hsv[2]}%\n\`\`\`css\n${
              isOpaque ? 'hsv' : 'hsva'
            }(${hsv[0]}deg, ${hsv[1]}%, ${hsv[2]}%${
              !isOpaque ? `, ${rgb.a}` : ''
            })\`\`\`\n\`\`\`css\nhsv(${hsv[0]}deg ${hsv[1]}% ${hsv[2]}%${
              !isOpaque ? ` / ${rgb.a}` : ''
            })\`\`\``,
            inline: true,
          },
          {
            name: 'hsl',
            value: `🏳️‍🌈 ${hsl[0]}°　<:hsl_s:1184501512999800843> ${
              hsl[1]
            }%　<:hsl_l:1184500903764566146> ${hsl[2]}%\n\`\`\`css\n${
              isOpaque ? 'hsl' : 'hsla'
            }(${hsl[0]}deg, ${hsl[1]}%, ${hsl[2]}%${
              !isOpaque ? `, ${rgb.a}` : ''
            })\`\`\`\n\`\`\`css\nhsl(${hsl[0]}deg ${hsl[1]}% ${hsl[2]}%${
              !isOpaque ? ` / ${rgb.a}` : ''
            })\`\`\``,
            inline: true,
          },
          {
            name: 'hwb',
            value: `🏳️‍🌈 ${hwb[0]}°　⬜ ${hwb[1]}%　⬛ ${
              hwb[2]
            }%\n\`\`\`css\n${isOpaque ? 'hwb' : 'hwba'}(${hwb[0]}deg, ${
              hwb[1]
            }%, ${hwb[2]}%${
              !isOpaque ? `, ${rgb.a}` : ''
            })\`\`\`\n\`\`\`css\nhwb(${hwb[0]}deg ${hwb[1]}% ${hwb[2]}%${
              !isOpaque ? ` / ${rgb.a}` : ''
            })\`\`\``,
          },
          {
            name: 'xyz',
            value: `🇽 ${xyz[0]}　🇾 ${cmyk[1]}　🇿 ${xyz[2]}\n\`\`\`css\n${
              isOpaque ? 'xyz' : 'xyza'
            }(${xyz[0]}, ${xyz[1]}, ${xyz[2]}${
              !isOpaque ? `, ${rgb.a}` : ''
            })\`\`\``,
            inline: true,
          },
          {
            name: 'yiq',
            value: `🇾 ${yiq[0]}　🇮 ${yiq[1]}　🇶 ${yiq[2]}\n\`\`\`css\n${
              isOpaque ? 'yiq' : 'yiqa'
            }(${yiq[0]}, ${yiq[1]}, ${yiq[2]}${
              !isOpaque ? `, ${rgb.a}` : ''
            })\`\`\``,
            inline: true,
          },
          {
            name: 'Android ARGB (android.graphics.Color)',
            value: `\`\`\`js\n${Number(
              `0x${hex8.slice(6)}${hex}`,
            )}\`\`\`\n\`\`\`js\n0x${hex8
              .slice(6)
              .toUpperCase()}${hex.toUpperCase()}\`\`\`\n\`\`\`js\n0x${hex8.slice(
              6,
            )}${hex}\`\`\``,
          },
          {
            name: 'cmy',
            value: `<:cmyk_c:1184522220995874847> ${cmy[0]} (${Math.round(
              cmy[0] * 100,
            )}%)　<:cmyk_m:1184522450306879548> ${cmy[1]} (${Math.round(
              cmy[1] * 100,
            )}%)　🟨 ${cmy[2]} (${Math.round(
              cmy[2] * 100,
            )}%)\n\`\`\`css\ncmy(${cmy[0]}%, ${cmy[1]}%, ${
              cmy[2]
            }%)\`\`\`\n\`\`\`css\ncmy(${cmy[0]}% ${cmy[1]}% ${
              cmy[2]
            }%)\`\`\``,
          },
          {
            name: 'cmyk',
            value: `<:cmyk_c:1184522220995874847> ${cmyk[0] / 100} (${
              cmyk[0]
            }%)　<:cmyk_m:1184522450306879548> ${cmyk[1] / 100} (${
              cmyk[1]
            }%)　🟨 ${cmyk[2] * 100} (${cmyk[2]}%)　⬛ ${cmyk[3] / 100} (${
              cmyk[3]
            }%)\n\`\`\`css\ncmyk(${cmyk[0]}%, ${cmyk[1]}%, ${cmyk[2]}%, ${
              cmyk[3]
            }%)\`\`\`\n\`\`\`css\ncmyk(${cmyk[0]}% ${cmyk[1]}% ${
              cmyk[2]
            }% ${cmyk[3]}%)\`\`\``,
          },
          {
            name: 'ansi',
            value: `ansi16 \`${ansi16}\`\nansi256 \`${ansi256}\``,
          },
        ],
      );

    await interaction.editReply({ embeds: [embed] });
  },
});
