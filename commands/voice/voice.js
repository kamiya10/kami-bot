const { ChannelType, Colors, GuildMember } = require("discord.js");
const { EmbedBuilder, SlashCommandBooleanOption, SlashCommandBuilder, SlashCommandChannelOption, SlashCommandIntegerOption, SlashCommandStringOption, SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder, bold, codeBlock, inlineCode } = require("@discordjs/builders");
const { KamiCommand } = require("../../classes/command");

/**
 * The /ping command.
 * @param {import("../../classes/client").KamiClient} client
 * @returns {KamiCommand}
 */
const voice = (client) => new KamiCommand({
  dev      : true,
  filePath : __filename,
  builder  : new SlashCommandBuilder()
    .setName("voice")
    .setDescription("Commands for temporary voice channels.")
    .addSubcommandGroup(new SlashCommandSubcommandGroupBuilder()
      .setName("server")
      .setDescription("Server configuration commands for temporary voice channels.")
      // /voice server setup
      .addSubcommand(new SlashCommandSubcommandBuilder()
        .setName("setup")
        .setDescription("Setup a temporary voice channel creator."))
      // /voice server add
      .addSubcommand(new SlashCommandSubcommandBuilder()
        .setName("add")
        .setDescription("Add a voice channel to be a temporary voice channel creator.")
        .addChannelOption(new SlashCommandChannelOption()
          .setName("channel")
          .setDescription("The channel to be a temporary voice channel creator.")
          .addChannelTypes(ChannelType.GuildVoice)
          .setRequired(true))
        .addChannelOption(new SlashCommandChannelOption()
          .setName("category")
          .setDescription("The category temporary voice channel should be created in.")
          .addChannelTypes(ChannelType.GuildCategory)
          .setRequired(true)))
      // /voice server remove
      .addSubcommand(new SlashCommandSubcommandBuilder()
        .setName("remove")
        .setDescription("Remove a voice channel from being a temporary voice channel creator.")
        .addChannelOption(new SlashCommandChannelOption()
          .setName("channel")
          .setDescription("The channel to remove from being a temporary voice channel creator.")
          .addChannelTypes(ChannelType.GuildVoice)
          .setRequired(true)))
      // /voice server info
      .addSubcommand(new SlashCommandSubcommandBuilder()
        .setName("info")
        .setDescription("Get currently configured temporary voice channel creators.")
        .addChannelOption(new SlashCommandChannelOption()
          .setName("channel")
          .setDescription("Show the specific temporary voice channel creator configuration.")
          .addChannelTypes(ChannelType.GuildVoice)))
      // /voice server name
      .addSubcommand(new SlashCommandSubcommandBuilder()
        .setName("name")
        .setDescription("Change the name of the template temporary voice channel.")
        .addStringOption(new SlashCommandStringOption()
          .setName("name")
          .setDescription("The new name of the temporary voice channel."))
        .addChannelOption(new SlashCommandChannelOption()
          .setName("channel")
          .setDescription("Make this setting only affects the specified channel creator.")
          .addChannelTypes(ChannelType.GuildVoice))
        .addBooleanOption(new SlashCommandBooleanOption()
          .setName("override")
          .setDescription("Override user preferences.")))
      // /voice server limit
      .addSubcommand(new SlashCommandSubcommandBuilder()
        .setName("limit")
        .setDescription("Change the user limit of the template temporary voice channel.")
        .addIntegerOption(new SlashCommandIntegerOption()
          .setName("limit")
          .setDescription("The new user limit of the temporary voice channel. (0 = Unlimited)")
          .setMinValue(0)
          .setMaxValue(99))
        .addChannelOption(new SlashCommandChannelOption()
          .setName("channel")
          .setDescription("Make this setting only affects the specified channel creator.")
          .addChannelTypes(ChannelType.GuildVoice))
        .addBooleanOption(new SlashCommandBooleanOption()
          .setName("override")
          .setDescription("Override user preferences.")))
      // /voice server bitrate
      .addSubcommand(new SlashCommandSubcommandBuilder()
        .setName("bitrate")
        .setDescription("Change the bitrate of the template temporary voice channel.")
        .addIntegerOption(new SlashCommandIntegerOption()
          .setName("bitrate")
          .setDescription("The new bitrate of the temporary voice channel. (In kbps)")
          .setMinValue(8)
          .setMaxValue(384))
        .addChannelOption(new SlashCommandChannelOption()
          .setName("channel")
          .setDescription("Make this setting only affects the specified channel creator.")
          .addChannelTypes(ChannelType.GuildVoice))
        .addBooleanOption(new SlashCommandBooleanOption()
          .setName("override")
          .setDescription("Override user preferences.")))
      // /voice server region
      .addSubcommand(new SlashCommandSubcommandBuilder()
        .setName("region")
        .setDescription("Change the region of the template temporary voice channel.")
        .addStringOption(new SlashCommandStringOption()
          .setName("region")
          .setDescription("The new region of the temporary voice channel.")
          .addChoices(...[
            { name: "Brazil", value: "brazil" },
            { name: "Hong Kong", value: "hongkong" },
            { name: "India", value: "india" },
            { name: "Japan", value: "japan" },
            { name: "Rotterdam", value: "rotterdam" },
            { name: "Russia", value: "russia" },
            { name: "Singapore", value: "singapore" },
            { name: "South Africa", value: "southafrica" },
            { name: "Sydney", value: "sydney" },
            { name: "US Central", value: "us-central" },
            { name: "US East", value: "us-east" },
            { name: "US South", value: "us-south" },
            { name: "US West", value: "us-west" },
          ]))
        .addChannelOption(new SlashCommandChannelOption()
          .setName("channel")
          .setDescription("Make this setting only affects the specified channel creator.")
          .addChannelTypes(ChannelType.GuildVoice))
        .addBooleanOption(new SlashCommandBooleanOption()
          .setName("override")
          .setDescription("Override user preferences."))),
    )
    // /voice name
    .addSubcommand(new SlashCommandSubcommandBuilder()
      .setName("name")
      .setDescription("Change the name of a temporary voice channel you owned.")
      .addStringOption(new SlashCommandStringOption()
        .setName("name")
        .setDescription("The new name of the temporary voice channel."))
      .addBooleanOption(new SlashCommandBooleanOption()
        .setName("default")
        .setDescription("Make this name as the server default name of the temporary voice channel on channel creation."))
      .addBooleanOption(new SlashCommandBooleanOption()
        .setName("global")
        .setDescription("Save the setting globally so it applies to all servers.")))
    // /voice limit
    .addSubcommand(new SlashCommandSubcommandBuilder()
      .setName("limit")
      .setDescription("Change the user limit of a temporary voice channel you owned.")
      .addIntegerOption(new SlashCommandIntegerOption()
        .setName("limit")
        .setDescription("The new user limit of the temporary voice channel. (0 = Unlimited)")
        .setMinValue(0)
        .setMaxValue(99))
      .addBooleanOption(new SlashCommandBooleanOption()
        .setName("default")
        .setDescription("Make this user limit as the server default limit of the temporary voice channel on channel creation."))
      .addBooleanOption(new SlashCommandBooleanOption()
        .setName("global")
        .setDescription("Save the setting globally so it applies to all servers.")))
    // /voice bitrate
    .addSubcommand(new SlashCommandSubcommandBuilder()
      .setName("bitrate")
      .setDescription("Change the bitrate of a temporary voice channel you owned.")
      .addIntegerOption(new SlashCommandIntegerOption()
        .setName("bitrate")
        .setDescription("The new bitrate of the temporary voice channel. (In kbps)")
        .setMinValue(8)
        .setMaxValue(384))
      .addBooleanOption(new SlashCommandBooleanOption()
        .setName("default")
        .setDescription("Make this bitrate as the server default of the temporary voice channel on channel creation."))
      .addBooleanOption(new SlashCommandBooleanOption()
        .setName("global")
        .setDescription("Save the setting globally so it applies to all servers.")))
    // /voice region
    .addSubcommand(new SlashCommandSubcommandBuilder()
      .setName("region")
      .setDescription("Change the region of a temporary voice channel you owned.")
      .addStringOption(new SlashCommandStringOption()
        .setName("region")
        .setDescription("The new region of the temporary voice channel.")
        .addChoices(...[
          { name: "Brazil", value: "brazil" },
          { name: "Hong Kong", value: "hongkong" },
          { name: "India", value: "india" },
          { name: "Japan", value: "japan" },
          { name: "Rotterdam", value: "rotterdam" },
          { name: "Russia", value: "russia" },
          { name: "Singapore", value: "singapore" },
          { name: "South Africa", value: "southafrica" },
          { name: "Sydney", value: "sydney" },
          { name: "US Central", value: "us-central" },
          { name: "US East", value: "us-east" },
          { name: "US South", value: "us-south" },
          { name: "US West", value: "us-west" },
        ]))
      .addBooleanOption(new SlashCommandBooleanOption()
        .setName("default")
        .setDescription("Make this region as the server default of the temporary voice channel on channel creation."))
      .addBooleanOption(new SlashCommandBooleanOption()
        .setName("global")
        .setDescription("Save the setting globally so it applies to all servers.")))
    .addSubcommand(new SlashCommandSubcommandBuilder()
      .setName("clear")
      .setDescription("Clear temporary voice channel settings.")
      .addStringOption(new SlashCommandStringOption()
        .setName("which")
        .setDescription("Choose which scope to clear.")
        .addChoices(...[
          { name: "Global", value: "global" },
          { name: "This server", value: "guild" },
          { name: "All", value: "all" },
        ])
        .setRequired(true))),
  async execute(interaction) {
    try {
      const embed = new EmbedBuilder()
        .setColor(Colors.Blue)
        .setDescription("✅");

      if (interaction.options.getSubcommandGroup(false)) {
        // /voice server [setup/info/add/remove/name/limit/bitrate/region]
        const guildVoiceData = client.database.guild(interaction.guild.id).voice;

        switch (interaction.options.getSubcommand(false)) {
          // /voice server setup
          case "setup": {

            break;
          }

          // /voice server info
          case "info": {

            break;
          }

          // /voice server add
          case "add": {
            const channel = interaction.options.getChannel("channel", true, [ChannelType.GuildVoice]);
            const category = interaction.options.getChannel("category", false, [ChannelType.GuildCategory]);

            if (!guildVoiceData[channel.id]) {
              guildVoiceData[channel.id] = {
                category        : category?.id || null,
                name            : null,
                nameOverride    : false,
                bitrate         : null,
                bitrateOverride : false,
                limit           : null,
                limitOverride   : false,
                region          : null,
                regionOverride  : false,
              };
            }

            break;
          }

          // /voice server remove
          case "remove": {
            const channel = interaction.options.getChannel("channel", true, [ChannelType.GuildVoice]);

            if (guildVoiceData[channel.id]) {
              delete guildVoiceData[channel.id];
            }

            break;
          }

          // /voice server name
          case "name": {
            const name = interaction.options.getString("name") || null;
            const channel = interaction.options.getChannel("channel", false, [ChannelType.GuildVoice]);
            const nameOverride = interaction.options.getBoolean("override", false) ?? false;

            if (channel) {
              if (channel.id in guildVoiceData) {
                guildVoiceData[channel.id].name = name;
                guildVoiceData[channel.id].nameOverride = nameOverride;
                embed
                  .setColor(Colors.Green)
                  .setDescription(`The default channel creation name has been ${name ? `set to ${bold(inlineCode(name))} ${nameOverride ? "and will override user settings" : ""}` : `${bold("cleared")}`} for ${channel}.`);
              } else {
                embed
                  .setColor(Colors.Red)
                  .setDescription("This channel is not a temporary voice channel creator.");
              }
            } else {
              guildVoiceData.global.name = name;
              embed
                .setColor(Colors.Green)
                .setDescription(`The default channel creation name has been ${name ? `set to ${bold(inlineCode(name))}` : `${bold("cleared")}`} for this server.`);
            }

            break;
          }

          // /voice server limit
          case "limit": {
            const limit = interaction.options.getInteger("limit") ?? null;
            const channel = interaction.options.getChannel("channel", false, [ChannelType.GuildVoice]);
            const limitOverride = interaction.options.getBoolean("override", false) ?? false;

            if (channel) {
              if (channel.id in guildVoiceData) {
                guildVoiceData[channel.id].limit = limit;
                guildVoiceData[channel.id].limitOverride = limitOverride;
                embed
                  .setColor(Colors.Green)
                  .setDescription(`The default channel creation user limit has been ${limit ? `set to ${bold(inlineCode(limit || "unlimited"))} ${limitOverride ? "and will override user settings" : ""}` : `${bold("cleared")}`} for ${channel}.`);
              } else {
                embed
                  .setColor(Colors.Red)
                  .setDescription("This channel is not a temporary voice channel creator.");
              }
            } else {
              guildVoiceData.global.limit = limit;
              embed
                .setColor(Colors.Green)
                .setDescription(`The default channel creation user limit has been ${limit ? `set to ${bold(inlineCode(limit || "unlimited"))}` : `${bold("cleared")}`} for this server.`);
            }

            break;
          }

          // /voice server bitrate
          case "bitrate": {
            const bitrate = interaction.options.getInteger("bitrate") ?? null;
            const channel = interaction.options.getChannel("channel", false, [ChannelType.GuildVoice]);
            const bitrateOverride = interaction.options.getBoolean("override", false) ?? false;

            if (channel) {
              if (channel.id in guildVoiceData) {
                guildVoiceData[channel.id].bitrate = bitrate;
                guildVoiceData[channel.id].bitrateOverride = bitrateOverride;
                embed
                  .setColor(Colors.Green)
                  .setDescription(`The default channel creation bitrate has been ${bitrate ? `set to ${bold(inlineCode(bitrate))} kbps ${bitrateOverride ? "and will override user settings" : ""}` : `${bold("cleared")}`} for ${channel}.`);
              } else {
                embed
                  .setColor(Colors.Red)
                  .setDescription("This channel is not a temporary voice channel creator.");
              }
            } else {
              guildVoiceData.global.bitrate = bitrate;
              embed
                .setColor(Colors.Green)
                .setDescription(`The default channel creation bitrate has been ${bitrate ? `set to ${bold(inlineCode(bitrate))} kbps` : `${bold("cleared")}`} for this server.`);
            }

            break;
          }

          // /voice server region
          case "region": {
            const region = interaction.options.getString("region") ?? null;
            const channel = interaction.options.getChannel("channel", false, [ChannelType.GuildVoice]);
            const regionOverride = interaction.options.getBoolean("override", false) ?? false;

            if (channel) {
              if (channel.id in guildVoiceData) {
                guildVoiceData[channel.id].region = region;
                guildVoiceData[channel.id].regionOverride = regionOverride;
                embed
                  .setColor(Colors.Green)
                  .setDescription(`The default channel creation region has been ${region ? `set to ${bold(inlineCode(region || "auto"))} ${regionOverride ? "and will override user settings" : ""}` : `${bold("cleared")}`} for ${channel}.`);
              } else {
                embed
                  .setColor(Colors.Red)
                  .setDescription("This channel is not a temporary voice channel creator.");
              }
            } else {
              guildVoiceData.global.region = region;
              embed
                .setColor(Colors.Green)
                .setDescription(`The default channel creation region has been ${region ? `set to ${bold(inlineCode(region || "auto"))}` : `${bold("cleared")}`} for this server.`);
            }

            break;
          }

          default:
            break;
        }

        await client.database.database.guild.write();

      } else if (interaction.member instanceof GuildMember) {
        // /voice [name/limit/bitrate/region]
        const userVoiceData = client.database.user(interaction.member.id).voice;
        const setAsDefault = interaction.options.getBoolean("default");
        const setAsGlobal = interaction.options.getBoolean("global");

        if (setAsDefault) {
          if (!userVoiceData[setAsGlobal ? "global" : interaction.guild.id]) {
            userVoiceData[setAsGlobal ? "global" : interaction.guild.id] = {
              name    : null,
              bitrate : null,
              limit   : null,
              region  : null,
            };
          }
        }

        const subcommand = interaction.options.getSubcommand(false);

        switch (subcommand) {
          // /voice name
          case "name": {
            const name = interaction.options.getString("name");

            if (setAsDefault) {
              userVoiceData[setAsGlobal ? "global" : interaction.guild.id].name = name;
              embed.setDescription(`Your defaul temporary voice channel name is now ${name ? inlineCode(name) : "cleared"}${setAsDefault ? setAsGlobal ? " for all servers." : " for this server" : ""}.`);
            } else if (client.states.voice.has(interaction.member.voice.channel.id)) {
              const channel = client.states.voice.get(interaction.member.voice.channel.id);

              if (channel.ownerId == interaction.member.id) {
                if (name) {
                  await interaction.member.voice.channel.setName(name);
                  embed
                    .setColor(Colors.Green)
                    .setDescription(`Channel name has been changed to ${bold(inlineCode(name))}.`);
                } else {
                  await interaction.member.voice.channel.setName(channel.defaultOptions.name);
                  embed
                    .setColor(Colors.Green)
                    .setDescription("Channel name has been reset.");
                }
              } else {
                embed
                  .setColor(Colors.Red)
                  .setDescription("You are not the owner of this temporary voice channel.");
              }
            } else {
              embed
                .setColor(Colors.Red)
                .setDescription("You must be in a tracked temporary voice channel to change its name.");
            }

            break;
          }

          // /voice limit
          case "limit": {
            const limit = interaction.options.getInteger("limit");

            if (setAsDefault) {
              userVoiceData[setAsGlobal ? "global" : interaction.guild.id].limit = limit;
              embed.setDescription(`Your defaul temporary voice channel user limit is now ${limit ? inlineCode(limit || "unlimited") : "cleared"}${setAsDefault ? setAsGlobal ? " for all servers." : " for this server" : ""}.`);
            } else if (client.states.voice.has(interaction.member.voice.channel.id)) {
              const channel = client.states.voice.get(interaction.member.voice.channel.id);

              if (channel.ownerId == interaction.member.id) {
                if (limit) {
                  await interaction.member.voice.channel.setUserLimit(limit);
                  embed
                    .setColor(Colors.Green)
                    .setDescription(`Channel user limit has been changed to ${bold(inlineCode(limit || "unlimited"))}.`);
                } else {
                  await interaction.member.voice.channel.setUserLimit(channel.defaultOptions.limit);
                  embed
                    .setColor(Colors.Green)
                    .setDescription("Channel user limit has been reset.");
                }
              } else {
                embed
                  .setColor(Colors.Red)
                  .setDescription("You are not the owner of this temporary voice channel.");
              }
            } else {
              embed
                .setColor(Colors.Red)
                .setDescription("You must be in a tracked temporary voice channel to change its user limit.");
            }

            break;
          }

          // /voice bitrate
          case "bitrate": {
            const bitrate = interaction.options.getInteger("bitrate");

            if (setAsDefault) {
              userVoiceData[setAsGlobal ? "global" : interaction.guild.id].bitrate = bitrate;
              embed.setDescription(`Your defaul temporary voice channel bitrate is now ${bitrate ? inlineCode(bitrate) : "cleared"}${setAsDefault ? setAsGlobal ? " for all servers." : " for this server" : ""}.`);
            } else if (client.states.voice.has(interaction.member.voice.channel.id)) {
              const channel = client.states.voice.get(interaction.member.voice.channel.id);

              if (channel.ownerId == interaction.member.id) {
                if (bitrate) {
                  await interaction.member.voice.channel.setBitrate(bitrate);
                  embed
                    .setColor(Colors.Green)
                    .setDescription(`Channel bitrate has been changed to ${bold(inlineCode(bitrate))}.`);
                } else {
                  await interaction.member.voice.channel.setBitrate(channel.defaultOptions.bitrate);
                  embed
                    .setColor(Colors.Green)
                    .setDescription("Channel bitrate has been reset.");
                }
              } else {
                embed
                  .setColor(Colors.Red)
                  .setDescription("You are not the owner of this temporary voice channel.");
              }
            } else {
              embed
                .setColor(Colors.Red)
                .setDescription("You must be in a tracked temporary voice channel to change its bitrate.");
            }

            break;
          }

          // /voice region
          case "region": {
            const region = interaction.options.getString("region");

            if (setAsDefault) {
              userVoiceData[setAsGlobal ? "global" : interaction.guild.id].region = region;
              embed.setDescription(`Your defaul temporary voice channel region is now ${region ? inlineCode(region) : "cleared"}${setAsDefault ? setAsGlobal ? " for all servers." : " for this server" : ""}.`);
            } else if (client.states.voice.has(interaction.member.voice.channel.id)) {
              const channel = client.states.voice.get(interaction.member.voice.channel.id);

              if (channel.ownerId == interaction.member.id) {
                if (region) {
                  await interaction.member.voice.channel.setRTCRegion(region);
                  embed
                    .setColor(Colors.Green)
                    .setDescription(`Channel region has been changed to ${bold(inlineCode(region))}.`);
                } else {
                  await interaction.member.voice.channel.setRTCRegion(channel.defaultOptions.region);
                  embed
                    .setColor(Colors.Green)
                    .setDescription("Channel bitrate has been reset.");
                }
              } else {
                embed
                  .setColor(Colors.Red)
                  .setDescription("You are not the owner of this temporary voice channel.");
              }
            } else {
              embed
                .setColor(Colors.Red)
                .setDescription("You must be in a tracked temporary voice channel to change its region.");
            }

            break;
          }

          // /voice clear
          case "clear": {
            const scope = interaction.options.getString("scope");

            switch (scope) {
              case "global": {
                delete userVoiceData.global;
                embed.setDescription("Your **global** defaul temporary voice channel settings have been cleared.");

                break;
              }

              case "guild": {
                if (userVoiceData[interaction.guild.id]) {
                  delete userVoiceData[interaction.guild.id];
                }

                embed.setDescription("Your defaul temporary voice channel settings for **this server** have been cleared.");

                break;
              }

              case "all": {
                delete client.database.user(interaction.member.id).voice;
                embed.setDescription("All your defaul temporary voice channel settings have been cleared.");

                break;
              }

              default: {
                break;
              }
            }

            break;
          }

          default:
            break;
        }

        if (setAsDefault || subcommand == "clear") {
          await client.database.database.user.write();
        }
      }

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      const embed = new EmbedBuilder()
        .setColor(Colors.Red)
        .setTitle("🛑 Uncaught Exception")
        .setDescription(`Error stack:\n${codeBlock("ansi", error.stack)}`);
      await interaction.editReply({ embeds: [embed] });
    }
  },
});
module.exports = voice;
