import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  CategoryChannel,
  ChannelType,
  Colors,
  ComponentType,
  EmbedBuilder,
  GuildMember,
  PermissionFlagsBits,
  SlashCommandBooleanOption,
  SlashCommandBuilder,
  SlashCommandChannelOption,
  SlashCommandIntegerOption,
  SlashCommandStringOption,
  SlashCommandSubcommandBuilder,
  SlashCommandSubcommandGroupBuilder,
  VoiceChannel,
  bold,
  codeBlock,
  inlineCode,
} from "discord.js";
import { $at } from "@/classes/utils";
import { t as $t } from "i18next";
import { ExecutionResultType } from "@/commands";

import type {
  CacheType,
  ChatInputCommandInteraction,
  Collection,
} from "discord.js";
import type { GuildVoiceSettings } from "@/databases/GuildDatabase";
import type { KamiClient } from "@/classes/client";
import type { KamiCommand } from "@/commands";

const voiceRegionChoices = [
  {
    value: "brazil",
    name: "Brazil",
    name_localizations: $at("slash:voice.region.CHOICES.brazil"),
  },
  {
    value: "hongkong",
    name: "Hong Kong",
    name_localizations: $at("slash:voice.region.CHOICES.hongkong"),
  },
  {
    value: "india",
    name: "India",
    name_localizations: $at("slash:voice.region.CHOICES.india"),
  },
  {
    value: "japan",
    name: "Japan",
    name_localizations: $at("slash:voice.region.CHOICES.japan"),
  },
  {
    value: "rotterdam",
    name: "Rotterdam",
    name_localizations: $at("slash:voice.region.CHOICES.rotterdam"),
  },
  {
    value: "russia",
    name: "Russia",
    name_localizations: $at("slash:voice.region.CHOICES.russia"),
  },
  {
    value: "singapore",
    name: "Singapore",
    name_localizations: $at("slash:voice.region.CHOICES.singapore"),
  },
  {
    value: "southafrica",
    name: "South Africa",
    name_localizations: $at("slash:voice.region.CHOICES.southafrica"),
  },
  {
    value: "sydney",
    name: "Sydney",
    name_localizations: $at("slash:voice.region.CHOICES.sydney"),
  },
  {
    value: "us-central",
    name: "US Central",
    name_localizations: $at("slash:voice.region.CHOICES.us_central"),
  },
  {
    value: "us-east",
    name: "US East",
    name_localizations: $at("slash:voice.region.CHOICES.us_east"),
  },
  {
    value: "us-south",
    name: "US South",
    name_localizations: $at("slash:voice.region.CHOICES.us_south"),
  },
  {
    value: "us-west",
    name: "US West",
    name_localizations: $at("slash:voice.region.CHOICES.us_west"),
  },
];

const settingClearChoices = [
  {
    value: "global",
    name: "Global",
    name_localizations: $at("slash:voice.clear.CHOICES.global"),
  },
  {
    value: "guild",
    name: "This server",
    name_localizations: $at("slash:voice.clear.CHOICES.guild"),
  },
  {
    value: "all",
    name: "All",
    name_localizations: $at("slash:voice.clear.CHOICES.all"),
  },
];

const ChannelIcons = {
  [ChannelType.GuildAnnouncement]: "📢",
  [ChannelType.GuildCategory]: "📁",
  [ChannelType.GuildForum]: "💬",
  [ChannelType.GuildMedia]: "🖼️",
  [ChannelType.GuildStageVoice]: "🎤",
  [ChannelType.GuildText]: "#️⃣",
  [ChannelType.GuildVoice]: "🔊",
};

const requiredPermissions = [
  PermissionFlagsBits.ManageChannels,
  PermissionFlagsBits.MoveMembers,
] as const;

const voiceChannelTypes = [ChannelType.GuildVoice, ChannelType.GuildStageVoice];

const handleSetupProgress =
  /**
   * @param {ChatInputCommandInteraction<CacheType>} interaction
   * @param {KamiClient} client
   * @param {Record<string, GuildVoiceSettings>} guildVoiceData
   */
  async (
    interaction: ChatInputCommandInteraction<CacheType>,
    client: KamiClient,
    guildVoiceData: Record<string, GuildVoiceSettings>,
  ) => {
    const permissions = interaction.guild?.members.me?.permissions;
    const permissionEmbed = new EmbedBuilder();

    if (!permissions) {
      permissionEmbed
        .setColor(Colors.Red)
        .setDescription(
          `Insufficient Permissions. (Missing ${requiredPermissions.join(" ")})`,
        );

      await interaction.editReply({ embeds: [permissionEmbed] });

      return;
    } else if (!permissions.has(requiredPermissions)) {
      permissionEmbed
        .setColor(Colors.Red)
        .setDescription(
          `Insufficient Permissions. (Missing ${permissions
            .missing(requiredPermissions)
            .join(" ")})`,
        );

      await interaction.editReply({ embeds: [permissionEmbed] });

      return;
    }

    const lastCategory = (
      interaction.guild.channels.cache.filter(
        (ch) => ch instanceof CategoryChannel,
      ) as Collection<string, CategoryChannel>
    )
      .sort((a, b) => b.position - a.position)
      .first();

    const diffTree = [];

    if (lastCategory instanceof CategoryChannel) {
      const lastCategoryChildren = lastCategory.children.cache.sort(
        (a, b) =>
          ((a.position + 1) << (voiceChannelTypes.includes(a.type) ? 8 : 0)) -
          ((b.position + 2) << (voiceChannelTypes.includes(b.type) ? 8 : 0)),
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
            .map((v, i, a) => `${i == a.length - 1 ? "   └" : "   ├"} ${v}`),
        );
      }
    }

    diffTree.push("+ Temporary Voice Channels\n+  └ 🔊 Create Channel");

    const confirmationEmbed = new EmbedBuilder()
      .setColor(Colors.Blue)
      .setDescription(
        "Doing this will create a category channel and a voice channel to your server. Do you want to proceed?\nThis can be undone by deleting the created channels.",
      )
      .addFields({
        name: "Diff Changes",
        value: codeBlock("diff", diffTree.join("\n")),
      });

    const actions = new ActionRowBuilder<ButtonBuilder>().setComponents(
      new ButtonBuilder()
        .setStyle(ButtonStyle.Primary)
        .setCustomId("cancel")
        .setLabel("Cancel"),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setCustomId("proceed")
        .setLabel("Proceed"),
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

      if (decision.customId == "cancel") {
        await decision.update({
          embeds: [
            new EmbedBuilder()
              .setColor(Colors.Blue)
              .setDescription(
                "Temporary Voice Channel Setup has been cancelled.",
              ),
          ],
          components: [],
        });

        setTimeout(() => void sent.delete(), 5000);
        return;
      }

      const progressEmbed = new EmbedBuilder()
        .setColor(Colors.Yellow)
        .setDescription("Setting up Temporary Voice Channel...");

      await decision.update({ embeds: [progressEmbed], components: [] });

      const category = await interaction.guild.channels.create({
        name: "Temporary Voice Channel",
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
        name: "Create Channel",
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

      await client.database.database.guild.write();

      const doneEmbed = new EmbedBuilder()
        .setColor(Colors.Green)
        .setDescription(
          "Temporary Voice Channel has been added to the server.",
        );

      await decision.editReply({ embeds: [doneEmbed], components: [] });
    } catch (error) {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.Blue)
            .setDescription(
              "Temporary Voice Channel Setup has timed out.\nPlease try again. </voice server setup:1157680405907001487>",
            ),
        ],
        components: [],
      });

      setTimeout(() => void sent.delete(), 5000);
    }
  };

/**
 * The /ping command.
 * @param {KamiClient} client
 * @returns {KamiCommand}
 */
export default {
  data: new SlashCommandBuilder()
    .setName("voice")
    .setNameLocalizations($at("slash:voice.NAME"))
    .setDescription("Commands for temporary voice channels.")
    .setDescriptionLocalizations($at("slash:voice.DESC"))
    .addSubcommandGroup(new SlashCommandSubcommandGroupBuilder()
      .setName("server")
      .setNameLocalizations($at("slash:voice.server.NAME"))
      .setDescription("Server configuration commands for temporary voice channels.")
      .setDescriptionLocalizations($at("slash:voice.server.DESC"))
          
    // /voice server setup
      .addSubcommand(new SlashCommandSubcommandBuilder()
        .setName("setup")
        .setNameLocalizations($at("slash:voice.server.setup.NAME"))
        .setDescription("Setup a temporary voice channel creator.")
        .setDescriptionLocalizations($at("slash:voice.server.setup.DESC")))

    // /voice server add
      .addSubcommand(new SlashCommandSubcommandBuilder()
        .setName("add")
        .setNameLocalizations($at("slash:voice.server.add.NAME"))
        .setDescription("Add a voice channel to be a temporary voice channel creator.")
        .setDescriptionLocalizations($at("slash:voice.server.add.DESC"))
        .addChannelOption(new SlashCommandChannelOption()
          .setName("channel")
          .setNameLocalizations($at("slash:voice.server.add.OPTIONS.channel.NAME"))
          .setDescription("The channel to be a temporary voice channel creator.")
          .setDescriptionLocalizations($at("slash:voice.server.add.OPTIONS.channel.DESC"))
          .addChannelTypes(ChannelType.GuildVoice)
          .setRequired(true))
        .addChannelOption(new SlashCommandChannelOption()
          .setName("category")
          .setNameLocalizations($at("slash:voice.server.add.OPTIONS.category.NAME"))
          .setDescription("The category temporary voice channel should be created in.")
          .setDescriptionLocalizations($at("slash:voice.server.add.OPTIONS.category.DESC"))
          .addChannelTypes(ChannelType.GuildCategory)
          .setRequired(true)))

    // /voice server remove
      .addSubcommand(new SlashCommandSubcommandBuilder()
        .setName("remove")
        .setNameLocalizations($at("slash:voice.server.remove.NAME"))
        .setDescription("Remove a voice channel from being a temporary voice channel creator.")
        .setDescriptionLocalizations($at("slash:voice.server.remove.DESC"))
        .addChannelOption(new SlashCommandChannelOption()
          .setName("channel")
          .setNameLocalizations($at("slash:voice.server.remove.OPTIONS.channel.NAME"))
          .setDescription("The channel to remove from being a temporary voice channel creator.")
          .setDescriptionLocalizations($at("slash:voice.server.remove.OPTIONS.channel.DESC"))
          .addChannelTypes(ChannelType.GuildVoice)
          .setRequired(true)))

    // /voice server info
      .addSubcommand(new SlashCommandSubcommandBuilder()
        .setName("info")
        .setNameLocalizations($at("slash:voice.server.info.NAME"))
        .setDescription("Get currently configured temporary voice channel creators.")
        .setDescriptionLocalizations($at("slash:voice.server.info.DESC"))
        .addChannelOption(new SlashCommandChannelOption()
          .setName("channel")
          .setNameLocalizations($at("slash:voice.server.info.OPTIONS.channel.NAME"))
          .setDescription("Show the specific temporary voice channel creator configuration.")
          .setDescriptionLocalizations($at("slash:voice.server.info.OPTIONS.channel.DESC"))
          .addChannelTypes(ChannelType.GuildVoice)))

    // /voice server name
      .addSubcommand(new SlashCommandSubcommandBuilder()
        .setName("name")
        .setNameLocalizations($at("slash:voice.name.OPTIONS.name.NAME"))
        .setDescription("Change the name of the template temporary voice channel.")
        .setDescriptionLocalizations($at("slash:voice.server.name.DESC"))
        .addStringOption(new SlashCommandStringOption()
          .setName("name")
          .setNameLocalizations($at("slash:voice.name.OPTIONS.name.NAME"))
          .setDescription("The new name of the temporary voice channel.")
          .setDescriptionLocalizations($at("slash:voice.name.OPTIONS.name.DESC")))
        .addChannelOption(new SlashCommandChannelOption()
          .setName("channel")
          .setNameLocalizations($at("slash:voice.server.OPTIONS.default.NAME"))
          .setDescription("Make this setting only affects the specified channel creator.")
          .setDescriptionLocalizations($at("slash:voice.server.OPTIONS.default.DESC"))
          .addChannelTypes(ChannelType.GuildVoice))
        .addBooleanOption(new SlashCommandBooleanOption()
          .setName("override")
          .setNameLocalizations($at("slash:voice.server.OPTIONS.override.NAME"))
          .setDescription("Override user preferences.")
          .setDescriptionLocalizations($at("slash:voice.server.OPTIONS.override.DESC"))))
                  
    // /voice server limit
      .addSubcommand(new SlashCommandSubcommandBuilder()
        .setName("limit")
        .setNameLocalizations($at("slash:voice.limit.NAME"))
        .setDescription("Change the user limit of the template temporary voice channel.")
        .setDescriptionLocalizations($at("slash:voice.server.limit.DESC"))
        .addIntegerOption(new SlashCommandIntegerOption()
          .setName("limit")
          .setNameLocalizations($at("slash:voice.limit.OPTIONS.limit.NAME"))
          .setDescription("The new user limit of the temporary voice channel. (0 = Unlimited)")
          .setDescriptionLocalizations($at("slash:voice.limit.OPTIONS.limit.DESC"))
          .setMinValue(0)
          .setMaxValue(99))
        .addChannelOption(new SlashCommandChannelOption()
          .setName("channel")
          .setNameLocalizations($at("slash:voice.server.OPTIONS.default.NAME"))
          .setDescription("Make this setting only affects the specified channel creator.")
          .setDescriptionLocalizations($at("slash:voice.server.OPTIONS.default.DESC"))
          .addChannelTypes(ChannelType.GuildVoice))
        .addBooleanOption(new SlashCommandBooleanOption()
          .setName("override")
          .setNameLocalizations($at("slash:voice.server.OPTIONS.override.NAME"))
          .setDescription("Override user preferences.")
          .setDescriptionLocalizations($at("slash:voice.server.OPTIONS.override.DESC"))))
                
    // /voice server bitrate
      .addSubcommand(new SlashCommandSubcommandBuilder()
        .setName("bitrate")
        .setNameLocalizations($at("slash:voice.bitrate.OPTIONS.bitrate.NAME"))
        .setDescription("Change the bitrate of the template temporary voice channel.")
        .setDescriptionLocalizations($at("slash:voice.server.bitrate.DESC"))
        .addIntegerOption(new SlashCommandIntegerOption()
          .setName("bitrate")
          .setNameLocalizations($at("slash:voice.bitrate.OPTIONS.bitrate.NAME"))
          .setDescription("The new bitrate of the temporary voice channel. (In kbps)")
          .setDescriptionLocalizations($at("slash:voice.bitrate.OPTIONS.bitrate.DESC"))
          .setMinValue(8)
          .setMaxValue(384))
        .addChannelOption(new SlashCommandChannelOption()
          .setName("channel")
          .setNameLocalizations($at("slash:voice.server.OPTIONS.default.NAME"))
          .setDescription("Make this setting only affects the specified channel creator.")
          .setDescriptionLocalizations($at("slash:voice.server.OPTIONS.default.DESC"))
          .addChannelTypes(ChannelType.GuildVoice))
        .addBooleanOption(new SlashCommandBooleanOption()
          .setName("override")
          .setNameLocalizations($at("slash:voice.server.OPTIONS.override.NAME"))
          .setDescription("Override user preferences.")
          .setDescriptionLocalizations($at("slash:voice.server.OPTIONS.override.DESC"))))
          
    // /voice server region
      .addSubcommand(new SlashCommandSubcommandBuilder()
        .setName("region")
        .setNameLocalizations($at("slash:voice.region.OPTIONS.region.NAME"))
        .setDescription("Change the region of the template temporary voice channel.")
        .setDescriptionLocalizations($at("slash:voice.server.region.DESC"))
        .addStringOption(new SlashCommandStringOption()
          .setName("region")
          .setNameLocalizations($at("slash:voice.region.OPTIONS.region.NAME"))
          .setDescription("The new region of the temporary voice channel.")
          .setDescriptionLocalizations($at("slash:voice.region.OPTIONS.region.DESC"))
          .addChoices(...voiceRegionChoices))
        .addChannelOption(new SlashCommandChannelOption()
          .setName("channel")
          .setNameLocalizations($at("slash:voice.server.OPTIONS.default.NAME"))
          .setDescription("Make this setting only affects the specified channel creator.")
          .setDescriptionLocalizations($at("slash:voice.server.OPTIONS.default.DESC"))
          .addChannelTypes(ChannelType.GuildVoice))
        .addBooleanOption(new SlashCommandBooleanOption()
          .setName("override")
          .setNameLocalizations($at("slash:voice.server.OPTIONS.override.NAME"))
          .setDescription("Override user preferences.")
          .setDescriptionLocalizations($at("slash:voice.server.OPTIONS.override.DESC")))))
      
  // /voice name
    .addSubcommand(new SlashCommandSubcommandBuilder()
      .setName("name")
      .setNameLocalizations($at("slash:voice.name.NAME"))
      .setDescription("Change the name of a temporary voice channel you owned.")
      .setDescriptionLocalizations($at("slash:voice.name.DESC"))
      .addStringOption(new SlashCommandStringOption()
        .setName("name")
        .setNameLocalizations($at("slash:voice.name.OPTIONS.name.NAME"))
        .setDescription("The new name of the temporary voice channel.")
        .setDescriptionLocalizations($at("slash:voice.name.OPTIONS.name.DESC")))
      .addBooleanOption(new SlashCommandBooleanOption()
        .setName("default")
        .setNameLocalizations($at("slash:voice.OPTIONS.default.NAME"))
        .setDescription("Make this name as the server default name of the temporary voice channel on channel creation.")
        .setDescriptionLocalizations($at("slash:voice.OPTIONS.default.DESC")))
      .addBooleanOption(new SlashCommandBooleanOption()
        .setName("global")
        .setNameLocalizations($at("slash:voice.OPTIONS.global.NAME"))
        .setDescription("Save the setting globally so it applies to all servers.")
        .setDescriptionLocalizations($at("slash:voice.OPTIONS.global.DESC"))))
      
  // /voice limit
    .addSubcommand(new SlashCommandSubcommandBuilder()
      .setName("limit")
      .setNameLocalizations($at("slash:voice.limit.NAME"))
      .setDescription("Change the user limit of a temporary voice channel you owned.")
      .setDescriptionLocalizations($at("slash:voice.limit.DESC"))
      .addIntegerOption(new SlashCommandIntegerOption()
        .setName("limit")
        .setNameLocalizations($at("slash:voice.limit.OPTIONS.limit.NAME"))
        .setDescription("The new user limit of the temporary voice channel. (0 = Unlimited)")
        .setDescriptionLocalizations($at("slash:voice.limit.OPTIONS.limit.DESC"))
        .setMinValue(0)
        .setMaxValue(99))
      .addBooleanOption(new SlashCommandBooleanOption()
        .setName("default")
        .setNameLocalizations($at("slash:voice.OPTIONS.default.NAME"))
        .setDescription("Make this user limit as the server default limit of the temporary voice channel on channel creation.")
        .setDescriptionLocalizations($at("slash:voice.OPTIONS.default.DESC")))
      .addBooleanOption(new SlashCommandBooleanOption()
        .setName("global")
        .setNameLocalizations($at("slash:voice.OPTIONS.global.NAME"))
        .setDescription("Save the setting globally so it applies to all servers.")
        .setDescriptionLocalizations($at("slash:voice.OPTIONS.global.DESC"))))
      
  // /voice bitrate
    .addSubcommand(new SlashCommandSubcommandBuilder()
      .setName("bitrate")
      .setNameLocalizations($at("slash:voice.bitrate.NAME"))
      .setDescription("Change the bitrate of a temporary voice channel you owned.")
      .setDescriptionLocalizations($at("slash:voice.bitrate.DESC"))
      .addIntegerOption(new SlashCommandIntegerOption()
        .setName("bitrate")
        .setNameLocalizations($at("slash:voice.bitrate.OPTIONS.bitrate.NAME"))
        .setDescription("The new bitrate of the temporary voice channel. (In kbps)")
        .setDescriptionLocalizations($at("slash:voice.bitrate.OPTIONS.bitrate.DESC"))
        .setMinValue(8)
        .setMaxValue(384))
      .addBooleanOption(new SlashCommandBooleanOption()
        .setName("default")
        .setNameLocalizations($at("slash:voice.OPTIONS.default.NAME"))
        .setDescription("Make this bitrate as the server default of the temporary voice channel on channel creation.")
        .setDescriptionLocalizations($at("slash:voice.OPTIONS.default.DESC")))
      .addBooleanOption(new SlashCommandBooleanOption()
        .setName("global")
        .setNameLocalizations($at("slash:voice.OPTIONS.global.NAME"))
        .setDescription("Save the setting globally so it applies to all servers.")
        .setDescriptionLocalizations($at("slash:voice.OPTIONS.global.DESC"))))
              
  // /voice region
    .addSubcommand(new SlashCommandSubcommandBuilder()
      .setName("region")
      .setNameLocalizations($at("slash:voice.region.NAME"))
      .setDescription("Change the region of a temporary voice channel you owned.")
      .setDescriptionLocalizations($at("slash:voice.region.DESC"))
      .addStringOption(new SlashCommandStringOption()
        .setName("region")
        .setNameLocalizations($at("slash:voice.region.OPTIONS.region.NAME"))
        .setDescription("The new region of the temporary voice channel.")
        .setDescriptionLocalizations($at("slash:voice.region.OPTIONS.region.DESC"))
        .addChoices(...voiceRegionChoices))
      .addBooleanOption(new SlashCommandBooleanOption()
        .setName("default")
        .setNameLocalizations($at("slash:voice.OPTIONS.default.NAME"))
        .setDescription("Make this region as the server default of the temporary voice channel on channel creation.")
        .setDescriptionLocalizations($at("slash:voice.OPTIONS.default.DESC")))
      .addBooleanOption(new SlashCommandBooleanOption()
        .setName("global")
        .setNameLocalizations($at("slash:voice.OPTIONS.global.NAME"))
        .setDescription("Save the setting globally so it applies to all servers.")
        .setDescriptionLocalizations($at("slash:voice.OPTIONS.global.DESC"))))
      
  // /voice clear
    .addSubcommand(new SlashCommandSubcommandBuilder()
      .setName("clear")
      .setNameLocalizations($at("slash:voice.clear.NAME"))
      .setDescription("Clear temporary voice channel settings.")
      .setDescriptionLocalizations($at("slash:voice.clear.DESC"))
      .addStringOption(new SlashCommandStringOption()
        .setName("which")
        .setNameLocalizations($at("slash:voice.clear.OPTIONS.which.NAME"))
        .setDescription("Choose which scope to clear.")
        .setDescriptionLocalizations($at("slash:voice.clear.OPTIONS.which.DESC"))
        .addChoices(...settingClearChoices)
        .setRequired(true))),
  defer: true,
  ephemeral: true,
  global: true,
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setAuthor({
        name: $t("header:voice", {
          lng: interaction.locale,
          0: interaction.guild.name,
        }),
        iconURL: interaction.guild.iconURL() ?? "",
      })
      .setColor(Colors.Blue)
      .setDescription("✅");

    if (interaction.options.getSubcommandGroup(false)) {
      // /voice server [setup/info/add/remove/name/limit/bitrate/region]
      const guildVoiceData = this.database.guild(
        interaction.guild.id,
      ).voice;

      switch (interaction.options.getSubcommand(false)) {
        // /voice server setup
        case "setup": {
          await handleSetupProgress(interaction, this, guildVoiceData);
          return;
        }

        // /voice server info
        case "info": {
          break;
        }

        // /voice server add
        case "add": {
          const channel = interaction.options.getChannel("channel", true, [
            ChannelType.GuildVoice,
          ]);
          const category = interaction.options.getChannel(
            "category",
            false,
            [ChannelType.GuildCategory],
          );

          if (!guildVoiceData[channel.id]) {
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
          }

          break;
        }

        // /voice server remove
        case "remove": {
          const channel = interaction.options.getChannel("channel", true, [
            ChannelType.GuildVoice,
          ]);

          if (guildVoiceData[channel.id]) {
            delete guildVoiceData[channel.id];
          }

          break;
        }

        // /voice server name
        case "name": {
          const name = interaction.options.getString("name") || null;
          const channel = interaction.options.getChannel("channel", false, [
            ChannelType.GuildVoice,
          ]);
          const nameOverride =
                interaction.options.getBoolean("override", false) ?? false;

          if (channel) {
            if (channel.id in guildVoiceData) {
              guildVoiceData[channel.id].name = name;
              guildVoiceData[channel.id].nameOverride = nameOverride;
              embed
                .setColor(Colors.Green)
                .setDescription(
                  `The default channel creation name has been ${
                    name
                      ? `set to ${bold(inlineCode(name))} ${
                        nameOverride
                          ? "and will override user settings"
                          : ""
                      }`
                      : `${bold("cleared")}`
                  } for ${channel.toString()}.`,
                );
            } else {
              embed
                .setColor(Colors.Red)
                .setDescription(
                  "This channel is not a temporary voice channel creator.",
                );
            }
          } else {
            guildVoiceData["global"].name = name;
            embed
              .setColor(Colors.Green)
              .setDescription(
                `The default channel creation name has been ${
                  name
                    ? `set to ${bold(inlineCode(name))}`
                    : `${bold("cleared")}`
                } for this server.`,
              );
          }

          break;
        }

        // /voice server limit
        case "limit": {
          const limit = interaction.options.getInteger("limit") ?? null;
          const channel = interaction.options.getChannel("channel", false, [
            ChannelType.GuildVoice,
          ]);
          const limitOverride =
                interaction.options.getBoolean("override", false) ?? false;

          if (channel) {
            if (channel.id in guildVoiceData) {
              guildVoiceData[channel.id].limit = limit;
              guildVoiceData[channel.id].limitOverride = limitOverride;
              embed
                .setColor(Colors.Green)
                .setDescription(
                  `The default channel creation user limit has been ${
                    limit
                      ? `set to ${bold(
                        inlineCode(`${limit || "unlimited"}`),
                      )} ${
                        limitOverride
                          ? "and will override user settings"
                          : ""
                      }`
                      : `${bold("cleared")}`
                  } for ${channel.toString()}.`,
                );
            } else {
              embed
                .setColor(Colors.Red)
                .setDescription(
                  "This channel is not a temporary voice channel creator.",
                );
            }
          } else {
            guildVoiceData["global"].limit = limit;
            embed
              .setColor(Colors.Green)
              .setDescription(
                `The default channel creation user limit has been ${
                  limit
                    ? `set to ${bold(
                      inlineCode(`${limit || "unlimited"}`),
                    )}`
                    : `${bold("cleared")}`
                } for this server.`,
              );
          }

          break;
        }

        // /voice server bitrate
        case "bitrate": {
          const bitrate = interaction.options.getInteger("bitrate") ?? null;
          const channel = interaction.options.getChannel(
            "channel",
            false,
            [ChannelType.GuildVoice],
          );
          const bitrateOverride = interaction.options.getBoolean("override", false) ?? false;

          if (channel) {
            if (channel.id in guildVoiceData) {
              guildVoiceData[channel.id].bitrate = bitrate;
              guildVoiceData[channel.id].bitrateOverride = bitrateOverride;
              embed
                .setColor(Colors.Green)
                .setDescription(
                  `The default channel creation bitrate has been ${
                    bitrate
                      ? `set to ${bold(inlineCode(`${bitrate} kbps`))} ${
                        bitrateOverride
                          ? "and will override user settings"
                          : ""
                      }`
                      : `${bold("cleared")}`
                  } for ${channel.toString()}.`,
                );
            } else {
              embed
                .setColor(Colors.Red)
                .setDescription(
                  "This channel is not a temporary voice channel creator.",
                );
            }
          } else {
            guildVoiceData["global"].bitrate = bitrate;
            embed
              .setColor(Colors.Green)
              .setDescription(
                `The default channel creation bitrate has been ${
                  bitrate
                    ? `set to ${bold(inlineCode(`${bitrate} kbps`))}`
                    : `${bold("cleared")}`
                } for this server.`,
              );
          }

          break;
        }

        // /voice server region
        case "region": {
          const region = interaction.options.getString("region") ?? null;
          const channel = interaction.options.getChannel("channel", false, [
            ChannelType.GuildVoice,
          ]);
          const regionOverride =
                interaction.options.getBoolean("override", false) ?? false;

          if (channel) {
            if (channel.id in guildVoiceData) {
              guildVoiceData[channel.id].region = region;
              guildVoiceData[channel.id].regionOverride = regionOverride;
              embed
                .setColor(Colors.Green)
                .setDescription(
                  `The default channel creation region has been ${
                    region
                      ? `set to ${bold(inlineCode(region || "auto"))} ${
                        regionOverride
                          ? "and will override user settings"
                          : ""
                      }`
                      : `${bold("cleared")}`
                  } for ${channel.toString()}.`,
                );
            } else {
              embed
                .setColor(Colors.Red)
                .setDescription(
                  "This channel is not a temporary voice channel creator.",
                );
            }
          } else {
            guildVoiceData["global"].region = region;
            embed
              .setColor(Colors.Green)
              .setDescription(
                `The default channel creation region has been ${
                  region
                    ? `set to ${bold(inlineCode(region || "auto"))}`
                    : `${bold("cleared")}`
                } for this server.`,
              );
          }

          break;
        }

        default:
          break;
      }

      await this.database.database.guild.write();
    } else if (interaction.member instanceof GuildMember) {
      // /voice [name/limit/bitrate/region]
      const userVoiceData = this.database.user(
        interaction.member.id,
      ).voice;
      const setAsDefault = interaction.options.getBoolean("default");
      const setAsGlobal = interaction.options.getBoolean("global");

      if (setAsDefault) {
        if (
          !userVoiceData[setAsGlobal ? "global" : interaction.guild.id]
        ) {
          userVoiceData[setAsGlobal ? "global" : interaction.guild.id] = {
            name: null,
            bitrate: null,
            limit: null,
            region: null,
          };
        }
      }

      const subcommand = interaction.options.getSubcommand(false);
      const memberIsInTrackedVoiceChannel =
            interaction.member.voice.channel instanceof VoiceChannel &&
            this.states.voice.has(interaction.member.voice.channel.id);

      switch (subcommand) {
        // /voice name
        case "name": {
          const name = interaction.options.getString("name");

          if (setAsDefault) {
            userVoiceData[
              setAsGlobal ? "global" : interaction.guild.id
            ].name = name;
            embed.setDescription(
              `Your defaul temporary voice channel name is now ${
                name ? inlineCode(name) : "cleared"
              }${
                setAsDefault
                  ? setAsGlobal
                    ? " for all servers."
                    : " for this server"
                  : ""
              }.`,
            );
          } else if (
            interaction.member.voice.channel &&
                this.states.voice.has(interaction.member.voice.channel.id)
          ) {
            const channel = this.states.voice.get(
              interaction.member.voice.channel.id,
            )!;

            if (channel.ownerId == interaction.member.id) {
              if (name) {
                await interaction.member.voice.channel.setName(name);
                embed
                  .setColor(Colors.Green)
                  .setDescription(
                    `Channel name has been changed to ${bold(
                      inlineCode(name),
                    )}.`,
                  );
              } else {
                await interaction.member.voice.channel.setName(
                  channel.defaultOptions.name,
                );
                embed
                  .setColor(Colors.Green)
                  .setDescription("Channel name has been reset.");
              }
            } else {
              embed
                .setColor(Colors.Red)
                .setDescription(
                  "You are not the owner of this temporary voice channel.",
                );
            }
          } else {
            embed
              .setColor(Colors.Red)
              .setDescription(
                "You must be in a tracked temporary voice channel to change its name.",
              );
          }

          break;
        }

        // /voice limit
        case "limit": {
          const limit = interaction.options.getInteger("limit");

          if (setAsDefault) {
            userVoiceData[
              setAsGlobal ? "global" : interaction.guild.id
            ].limit = limit;
            embed.setDescription(
              `Your defaul temporary voice channel user limit is now ${
                limit ? inlineCode(`${limit || "unlimited"}`) : "cleared"
              }${
                setAsDefault
                  ? setAsGlobal
                    ? " for all servers."
                    : " for this server"
                  : ""
              }.`,
            );
          } else if (memberIsInTrackedVoiceChannel) {
            const channel = this.states.voice.get(
              interaction.member.voice.channel!.id,
            )!;

            if (channel.ownerId == interaction.member.id) {
              if (limit) {
                await interaction.member.voice.channel!.setUserLimit(limit);
                embed
                  .setColor(Colors.Green)
                  .setDescription(
                    `Channel user limit has been changed to ${bold(
                      inlineCode(`${limit || "unlimited"}`),
                    )}.`,
                  );
              } else {
                await interaction.member.voice.channel!.setUserLimit(
                  channel.defaultOptions.limit,
                );
                embed
                  .setColor(Colors.Green)
                  .setDescription("Channel user limit has been reset.");
              }
            } else {
              embed
                .setColor(Colors.Red)
                .setDescription(
                  "You are not the owner of this temporary voice channel.",
                );
            }
          } else {
            embed
              .setColor(Colors.Red)
              .setDescription(
                "You must be in a tracked temporary voice channel to change its user limit.",
              );
          }

          break;
        }

        // /voice bitrate
        case "bitrate": {
          const bitrate = interaction.options.getInteger("bitrate");

          if (setAsDefault) {
            userVoiceData[
              setAsGlobal ? "global" : interaction.guild.id
            ].bitrate = bitrate;
            embed.setDescription(
              `Your defaul temporary voice channel bitrate is now ${
                bitrate ? inlineCode(`${bitrate} kbps`) : "cleared"
              }${
                setAsDefault
                  ? setAsGlobal
                    ? " for all servers."
                    : " for this server"
                  : ""
              }.`,
            );
          } else if (
            this.states.voice.has(interaction.member.voice.channel!.id)
          ) {
            const channel = this.states.voice.get(
              interaction.member.voice.channel!.id,
            )!;

            if (channel.ownerId == interaction.member.id) {
              if (bitrate) {
                await interaction.member.voice.channel!.setBitrate(bitrate);
                embed
                  .setColor(Colors.Green)
                  .setDescription(
                    `Channel bitrate has been changed to ${bold(
                      inlineCode(`${bitrate} kbps`),
                    )}.`,
                  );
              } else {
                await interaction.member.voice.channel!.setBitrate(
                  channel.defaultOptions.bitrate,
                );
                embed
                  .setColor(Colors.Green)
                  .setDescription("Channel bitrate has been reset.");
              }
            } else {
              embed
                .setColor(Colors.Red)
                .setDescription(
                  "You are not the owner of this temporary voice channel.",
                );
            }
          } else {
            embed
              .setColor(Colors.Red)
              .setDescription(
                "You must be in a tracked temporary voice channel to change its bitrate.",
              );
          }

          break;
        }

        // /voice region
        case "region": {
          const region = interaction.options.getString("region");

          if (setAsDefault) {
            userVoiceData[
              setAsGlobal ? "global" : interaction.guild.id
            ].region = region;
            embed.setDescription(
              `Your defaul temporary voice channel region is now ${
                region ? inlineCode(region) : "cleared"
              }${
                setAsDefault
                  ? setAsGlobal
                    ? " for all servers."
                    : " for this server"
                  : ""
              }.`,
            );
          } else if (memberIsInTrackedVoiceChannel) {
            const channel = this.states.voice.get(
              interaction.member.voice.channel!.id,
            )!;

            if (channel.ownerId == interaction.member.id) {
              if (region) {
                await interaction.member.voice.channel!.setRTCRegion(
                  region,
                );
                embed
                  .setColor(Colors.Green)
                  .setDescription(
                    `Channel region has been changed to ${bold(
                      inlineCode(region),
                    )}.`,
                  );
              } else {
                await interaction.member.voice.channel!.setRTCRegion(
                  channel.defaultOptions.region,
                );
                embed
                  .setColor(Colors.Green)
                  .setDescription("Channel bitrate has been reset.");
              }
            } else {
              embed
                .setColor(Colors.Red)
                .setDescription(
                  "You are not the owner of this temporary voice channel.",
                );
            }
          } else {
            embed
              .setColor(Colors.Red)
              .setDescription(
                "You must be in a tracked temporary voice channel to change its region.",
              );
          }

          break;
        }

        // /voice clear
        case "clear": {
          const scope = interaction.options.getString("scope");

          switch (scope) {
            case "global": {
              userVoiceData.global = this.database.user.default.voice.global;
              embed.setDescription(
                "Your **global** defaul temporary voice channel settings have been cleared.",
              );

              break;
            }

            case "guild": {
              if (userVoiceData[interaction.guild.id]) {
                delete userVoiceData[interaction.guild.id];
              }

              embed.setDescription(
                "Your defaul temporary voice channel settings for **this server** have been cleared.",
              );

              break;
            }

            case "all": {
              this.database.user(interaction.member.id).voice = this.database.user.default.voice;

              embed.setDescription(
                "All your defaul temporary voice channel settings have been cleared.",
              );

              break;
            }

            default: {
              break;
            }
          }

          break;
        }

        default: {
          break;
        }
      }

      if (setAsDefault || subcommand == "clear") {
        await this.database.database.user.write();
      }
    }


    return Promise.resolve({
      type: ExecutionResultType.SingleSuccess,
      payload: { embeds: [embed] }, 
    });
  },
} satisfies KamiCommand;
