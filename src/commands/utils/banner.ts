// @ts-check

import {
  Colors,
  EmbedBuilder,
  GuildMember,
  ImageFormat,
  SlashCommandBooleanOption,
  SlashCommandBuilder,
  SlashCommandUserOption,
  codeBlock,
  hyperlink,
} from "discord.js";
import { t as $t } from "i18next";

import { $at } from "@/classes/utils";
import { KamiCommand } from "@/classes/command";
import { Logger } from "@/classes/logger";

/**
 * The /banner command.
 * @returns {KamiCommand}
 */
export default (): KamiCommand =>
  new KamiCommand({
    dev: true,
    filePath: import.meta.url,
    builder: new SlashCommandBuilder()
      .setName("banner")
      .setNameLocalizations($at("slash:banner.NAME"))
      .setDescription("Get the banner of a member.")
      .setDescriptionLocalizations($at("slash:banner.DESC"))
      .setDMPermission(false)
      .addUserOption(
        new SlashCommandUserOption()
          .setName("member")
          .setNameLocalizations($at("slash:banner.OPTIONS.member.NAME"))
          .setDescription("The member to get the banner of.")
          .setDescriptionLocalizations($at("slash:banner.OPTIONS.member.DESC"))
      )
      .addBooleanOption(
        new SlashCommandBooleanOption()
          .setName("server")
          .setNameLocalizations($at("slash:banner.OPTIONS.server.NAME"))
          .setDescription("Get the server specific banner.")
          .setDescriptionLocalizations($at("slash:banner.OPTIONS.server.DESC"))
      ),
    async execute(interaction) {
      try {
        const member =
          interaction.options.getMember("member") ?? interaction.member;

        const urls = <Record<ImageFormat, string>>{};
        const embed = new EmbedBuilder();

        if (member instanceof GuildMember) {
          embed.setAuthor({
            name: $t("header:banner", {
              lng: interaction.locale,
              0: member.displayName,
            }),
            iconURL: member.displayAvatarURL(),
          });

          await member.fetch(true);

          if (member.user.banner) {
            embed.setImage(member.user.bannerURL({ size: 256 })!);
            urls.jpeg = member.user.bannerURL({
              extension: ImageFormat.JPEG,
              size: 4096,
              forceStatic: false,
            })!;
            urls.png = member.user.bannerURL({
              extension: ImageFormat.PNG,
              size: 4096,
              forceStatic: false,
            })!;
            urls.webp = member.user.bannerURL({
              extension: ImageFormat.WebP,
              size: 4096,
              forceStatic: false,
            })!;
            urls.gif = member.user.bannerURL({
              extension: ImageFormat.GIF,
              size: 4096,
            })!;

            embed
              .setColor(Colors.Blue)
              .setDescription(
                `**Image Formats:**\n${(["JPEG", "PNG", "WebP", "GIF"] as const)
                  .map((format) => hyperlink(format, urls[ImageFormat[format]]))
                  .join("🔸")}`
              );
          } else {
            embed
              .setColor(Colors.Red)
              .setDescription("❌ This member has no banner.");
          }
        } else {
          embed.setColor(Colors.Red).setDescription("❌ Member not found.");
        }

        await interaction.editReply({ embeds: [embed] });
      } catch (error) {
        if (error instanceof Error) {
          Logger.error(error);
          const embed = new EmbedBuilder()
            .setColor(Colors.Red)
            .setTitle("🛑 Uncaught Exception")
            .setDescription(
              `Error stack:\n${codeBlock("ansi", error.stack ?? "")}`
            );
          await interaction.editReply({ embeds: [embed] });
        }
      }
    },
  });
