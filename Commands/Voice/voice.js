const { ActionRowBuilder, ChannelType, Colors, ComponentType, EmbedBuilder, SelectMenuBuilder, SlashCommandBooleanOption, SlashCommandBuilder, SlashCommandChannelOption, SlashCommandIntegerOption, SlashCommandStringOption, SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder, SlashCommandUserOption } = require("discord.js");
const GuildDatabaseModel = require("../../Model/GuildDatabaseModel");
const UserDatabaseModel = require("../../Model/UserDatabaseModel");
const censor = require("discord-censor");

const emoji = [
  "1️⃣",
  "2️⃣",
  "3️⃣",
  "4️⃣",
  "5️⃣",
  "6️⃣",
  "7️⃣",
  "8️⃣",
  "9️⃣",
  "🔟",
  "<:eleven:889461885701873685>",
  "<:twelve:889461885928366110>",
  "<:thirteen:889461885936762881>",
  "<:fourteen:889461886075166720>",
  "<:fifteen:889461886679146536>",
  "<:sixteen:889461885798318130>",
  "<:seventeen:889461886515576853>",
  "<:eighteen:889461886733668352>",
  "<:nineteen:889461886536515615>",
  "<:twenty:889461886565888021>",
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("voice")
    .setDescription("設定自動語音頻道")
    .addSubcommand(new SlashCommandSubcommandBuilder()
      .setName("名稱")
      .setDescription("設定頻道名稱")
      .addStringOption(new SlashCommandStringOption()
        .setName("名稱")
        .setDescription("要設定的名稱，輸入 serverDefault 來使用伺服器預設。{user.displayName} 顯示名稱，{user.name} 使用者名稱，{user.tag} 使用者標籤"))
      .addBooleanOption(new SlashCommandBooleanOption()
        .setName("預設")
        .setDescription("設為預設")))
    .addSubcommand(new SlashCommandSubcommandBuilder()
      .setName("人數上限")
      .setDescription("設定頻道人數上限")
      .addIntegerOption(new SlashCommandIntegerOption()
        .setName("人數上限")
        .setDescription("要設定的人數上限（0：無限制）")
        .setMaxValue(99)
        .setMinValue(0))
      .addBooleanOption(new SlashCommandBooleanOption()
        .setName("預設")
        .setDescription("設為預設")))
    .addSubcommand(new SlashCommandSubcommandBuilder()
      .setName("位元率")
      .setDescription("設定頻道位元率")
      .addIntegerOption(new SlashCommandIntegerOption()
        .setName("位元率")
        .setDescription("要設定的位元率（單位：kbps）")
        .setMinValue(0)
        .setRequired(true))
      .addBooleanOption(new SlashCommandBooleanOption()
        .setName("預設")
        .setDescription("設為預設")))
    .addSubcommand(new SlashCommandSubcommandBuilder()
      .setName("靜音")
      .setDescription("靜音頻道內成員")
      .addUserOption(new SlashCommandUserOption()
        .setName("成員")
        .setDescription("要靜音的成員")
        .setRequired(true))
      .addBooleanOption(new SlashCommandBooleanOption()
        .setName("狀態")
        .setDescription("靜音狀態")))
    .addSubcommandGroup(new SlashCommandSubcommandGroupBuilder()
      .setName("伺服器設定")
      .setDescription("（管理員）相關伺服器設定")
      .addSubcommand(new SlashCommandSubcommandBuilder()
        .setName("資訊")
        .setDescription("顯示所有已設定自動語音頻道設定"))
      .addSubcommand(new SlashCommandSubcommandBuilder()
        .setName("新增")
        .setDescription("將頻道新增到自動語音頻道列表")
        .addChannelOption(new SlashCommandChannelOption()
          .setName("頻道")
          .setDescription("要新增到自動語音頻道列表的語音頻道")
          .addChannelTypes(ChannelType.GuildVoice)
          .setRequired(true))
        .addChannelOption(new SlashCommandChannelOption()
          .setName("類別")
          .setDescription("語音頻道要創在的類別")
          .addChannelTypes(ChannelType.GuildCategory)
          .setRequired(true)))
      .addSubcommand(new SlashCommandSubcommandBuilder()
        .setName("自動新增")
        .setDescription("讓機器人幫你創建一個自動語音頻道"))
      .addSubcommand(new SlashCommandSubcommandBuilder()
        .setName("刪除")
        .setDescription("將頻道從自動語音頻道列表中刪除")
        .addChannelOption(new SlashCommandChannelOption()
          .setName("頻道")
          .setDescription("要刪除的自動語音頻道（頻道本身不會被刪除）")
          .addChannelTypes(ChannelType.GuildVoice)
          .setRequired(true)))
      .addSubcommand(new SlashCommandSubcommandBuilder()
        .setName("設定")
        .setDescription("設定個別自動語音頻道")
        .addChannelOption(new SlashCommandChannelOption()
          .setName("頻道")
          .setDescription("要設定的自動語音頻道")
          .addChannelTypes(ChannelType.GuildVoice))
        .addChannelOption(new SlashCommandChannelOption()
          .setName("類別")
          .setDescription("設定自動語音頻道創頻道要創在哪一個類別下")
          .addChannelTypes(ChannelType.GuildCategory))
        .addStringOption(new SlashCommandStringOption()
          .setName("名稱")
          .setDescription("設定伺服器自動語音頻道名稱。{user.displayName} 顯示名稱，{user.name} 使用者名稱，{user.tag} 使用者標籤"))
        .addIntegerOption(new SlashCommandIntegerOption()
          .setName("人數上限")
          .setDescription("設定伺服器自動語音頻道人數上限（0：無上限）")
          .setMaxValue(99)
          .setMinValue(0))
        .addIntegerOption(new SlashCommandIntegerOption()
          .setName("位元率")
          .setDescription("設定伺服器自動語音頻道位元率（單位：kbps）")
          .setMinValue(0))
        .addBooleanOption(new SlashCommandBooleanOption()
          .setName("覆蓋設定")
          .setDescription("覆蓋現有設定")))),
  defer: true,

  /**
   * @param {import("discord.js").ChatInputCommandInteraction<import("discord.js").Interaction>} interaction
   */
  async execute(interaction) {
    const placeholder = {
      "{user.displayName}" : interaction.member.displayName,
      "{user.name}"        : interaction.user.username,
      "{user.tag}"         : interaction.user.tag,
    };

    try {
      const voice = new EmbedBuilder();
      const GuildSettings = interaction.client.database.GuildDatabase.get(interaction.guild.id);
      const UserSettings = interaction.client.database.UserDatabase.get(interaction.member.id);

      if (!GuildSettings)
        await interaction.client.database.GuildDatabase.set(interaction.guild.id, GuildDatabaseModel());

      if (!UserSettings)
        await interaction.client.database.UserDatabase.set(interaction.member.id, UserDatabaseModel());


      const sc = interaction.options.getSubcommand();

      if (interaction.options.getSubcommandGroup(false) == "伺服器設定") {
        if (!interaction.memberPermissions.has("Administrator")) throw { message: "ERR_PERMISSION_DENIED" };

        switch (sc) {
          case "資訊": {
            const pages = [];
            voice
              .setAuthor({ name: `自動語音頻道 | ${interaction.guild.name}`, iconURL: interaction.guild.iconURL({ dynamic: true }) })
              .setColor(Colors.Blue);

            if (GuildSettings?.voice?.length)
              GuildSettings?.voice.forEach(

                /**
								 * @param {{ creator: string, category: string, channelSettings: { name: string, bitrate: number, limit: number } }} v
								 * @param {number} i Index
								 */
                (v, i) => {
                  const DEFAULT_CHANNEL_NAME = "{user.displayName} 的房間";
                  let finalName = (v.channelSettings.name ? v.channelSettings.name : DEFAULT_CHANNEL_NAME).replace(/{.+}/g, all => placeholder[all] || all);

                  if (censor.check(finalName)) finalName = censor.censor(finalName);

                  const chsetting = [];

                  chsetting.push(`頻道名稱 │ \`${v.channelSettings.name ? v.channelSettings.name : "未設定"}\``);

                  if (v.channelSettings.name) chsetting.push(`　　預設 | ${DEFAULT_CHANNEL_NAME}`);
                  chsetting.push(`　　預覽 │ ${finalName}`);
                  chsetting.push(`　位元率 │ **${v.channelSettings.bitrate}** kbps`);
                  chsetting.push(`人數上限 │ ${v.channelSettings.limit ? `**${v.channelSettings.limit}** 人` : "`無限制`"}`);

                  const embed = new EmbedBuilder(voice.data);
                  embed
                    .setFields(
                      ...[
                        { name: "建立語音頻道", value: `\`${v.creator}\` <#${v.creator}>` },
                        { name: "語音頻道類別", value: v.category ? `\`${v.category}\` <#${v.category}>` : "`未設定語音頻道類別`" },
                        { name: "頻道設定", value: chsetting.join("\n") },
                      ],
                    )
                    .setFooter({ text: `${i + 1} / ${GuildSettings?.voice.length}` })
                    .setTimestamp();
                  pages.push(embed);
                });
            else
              pages.push(voice.setDescription("這個伺服器尚未設定自動語音頻道"));

            if (pages.length > 1) {
              const ar = new ActionRowBuilder()
                .addComponents(new SelectMenuBuilder()
                  .addOptions(
                    GuildSettings?.voice.map(

                      /**
											 * @param {{ creator: string, category: string, channelSettings: { name: string, bitrate: number, limit: number } }} v
											 * @param {number} i Index
											 */
                      (v, i) => (
                        {
                          label       : `#${interaction.guild.channels.cache.get(v.creator).name}`,
                          value       : `${i}`,
                          default     : !i,
                          description : v.creator,
                          emoji       : emoji[i],
                        }),
                    ))
                  .setCustomId("kami_voice_paginator"));
              const sent = await interaction.editReply({ embeds: [pages[0]], components: [ar] });
              const filter = (i) => i.customId === "kami_voice_paginator" && i.user.id === interaction.user.id;

              const controller = sent.createMessageComponentCollector({ filter, idle: 60_000, componentType: ComponentType.SelectMenu });
              controller.on("collect", async inter => {
                const aru = new ActionRowBuilder()
                  .addComponents(new SelectMenuBuilder()
                    .addOptions(
                      GuildSettings?.voice.map(

                        /**
												 * @param {{ creator: string, category: string, channelSettings: { name: string, bitrate: number, limit: number } }} v
												 * @param {number} i Index
												 */
                        (v, i) => (
                          {
                            label       : `#${interaction.guild.channels.cache.get(v.creator).name}`,
                            value       : `${i}`,
                            default     : i == inter.values[0],
                            description : v.creator,
                            emoji       : emoji[i],
                          }
                        ),
                      ))
                    .setCustomId("kami_voice_paginator"));
                await inter.update({ embeds: [pages[+inter.values[0]]], components: [aru] });
              });
              controller.on("end", async reason => {
                if (reason == "idle")
                  await sent.editReply({ embeds: new EmbedBuilder(sent.embeds[0].data).setFooter({ text: "互動已逾時" }), components: [] });
              });
            } else {
              await interaction.editReply({ embeds: [pages[0]] });
            }

            break;
          }

          case "新增": {
            const vch = interaction.options.getChannel("頻道");
            const cch = interaction.options.getChannel("類別");

            if (GuildSettings?.voice) {
              if (GuildSettings?.voice.filter(v => v.creator == vch.id).length)
                throw { message: "ERR_ALREADY_EXISTED" };

              GuildSettings?.voice.push({
                creator         : vch.id,
                category        : cch?.id || "",
                channelSettings : {
                  name    : "",
                  bitrate : 64,
                  limit   : 0,
                },
              });

              await interaction.client.database.GuildDatabase.save();
            } else {
              interaction.client.database.GuildDatabase.set(
                interaction.guild.id,
                GuildDatabaseModel(
                  [
                    {
                      creator         : vch.id,
                      category        : cch?.id || "",
                      channelSettings : {
                        name    : "",
                        bitrate : 64,
                        limit   : 0,
                      },
                    },
                  ],
                ),
              );
            }

            voice
              .setColor(Colors.Green)
              .setTitle("✅ 成功")
              .setDescription(`已將 ${vch} 新增到自動語音頻道列表`);
            await interaction.editReply({ embeds: [voice] });
            break;
          }

          case "自動新增": {
            throw { message: "ERR_NOT_IMPLEMENTED" };
          }

          case "刪除": {
            const vch = interaction.options.getChannel("頻道");

            if (GuildSettings?.voice?.length) {
              const indexToDelete = GuildSettings.voice.map(v => v.creator).indexOf(vch.id);

              if (indexToDelete == -1)
                throw { message: "ERR_NOT_EXIST" };

              GuildSettings.voice.splice(indexToDelete, 1);
              await interaction.client.database.GuildDatabase.save();

              voice
                .setColor(Colors.Green)
                .setTitle("✅ 成功")
                .setDescription(`已將 ${vch} 從自動語音頻道列表中刪除`);
              await interaction.editReply({ embeds: [voice] });
            } else {
              throw { message: "ERR_NOT_EXIST" };
            }

            break;
          }

          case "設定":
            throw { message: "ERR_NOT_IMPLEMENTED" };

          default:
            break;
        }
      } else {
        if (!interaction.member.voice.channel) throw { message: "ERR_NOT_IN_VOICE" };

        if (!interaction.client.watchedChanels.has(interaction.member.voice.channelId)) throw { message: "ERR_NOT_WATCHED" };

        if (interaction.client.watchedChanels.get(interaction.member.voice.channelId).master != interaction.member.id) throw { message: "ERR_NOT_MASTER" };

        switch (sc) {
          case "名稱": {
            const name = interaction.options.getString("名稱");
            const defa = interaction.options.getBoolean("預設");

            const setting = GuildSettings.voice.find(o => o.creator == interaction.client.watchedChanels.get(interaction.member.voice.channelId).creator);

            let finalName = name != undefined
              ? name.replace(/{.+}/g, all => placeholder[all] || all)
              : UserSettings?.voice_name
                ? UserSettings.voice_name.replace(/{.+}/g, all => placeholder[all] || all)
                : setting?.channelSettings?.name
                  ? setting.channelSettings.name.replace(/{.+}/g, all => placeholder[all] || all)
                  : `${interaction.member.displayName} 的房間`;

            if (censor.check(finalName)) finalName = censor.censor(finalName);

            if (defa) {
              UserSettings.voice_name = name;
              await interaction.client.database.UserDatabase.save();
            }

            await interaction.member.voice.channel.setName(finalName);
            interaction.editReply({ embeds: [] });
            break;
          }

          case "人數上限": {
            const limit = interaction.options.getInteger("人數上限");
            const defa = interaction.options.getBoolean("預設");

            const setting = GuildSettings.voice.find(o => o.creator == interaction.client.watchedChanels.get(interaction.member.voice.channelId).creator);

            const finalLimit = limit != undefined
              ? limit
              : setting.channelSettings.limit != undefined
                ? setting.channelSettings.limit
                : 0;

            if (defa) {
              UserSettings.voice_limit = limit != undefined ? limit : null;
              await interaction.client.database.UserDatabase.save();
            }

            await interaction.member.voice.channel.setUserLimit(finalLimit);
            break;
          }

          case "位元率":
            throw { message: "ERR_NOT_IMPLEMENTED" }; case "靜音": {
            const member = interaction.options.getMember("成員");
            let muted = interaction.options.getBoolean("狀態");
            const permission = [];

            interaction.member.voice.channel.permissionOverwrites.cache.forEach(

              /**
							 * @param {import("discord.js").PermissionOverwrites} v
							 * @param {string} id
							 */
              (v, id) => {
                let allow, deny;

                if (id == member.id) {
                  if (muted == undefined)
                    muted = !v.deny.has("Speak");

                  if (muted) {
                    if (!v.deny.has("Speak")) deny = v.deny.add("Speak");

                    if (v.allow.has("Speak")) allow = v.allow.remove("Speak");
                  } else {
                    if (v.deny.has("Speak")) deny = v.deny.remove("Speak");

                    if (!v.allow.has("Speak")) allow = v.allow.add("Speak");
                  }
                } else {
                  allow = v.allow;
                  deny = v.deny;
                }

                permission.push({ id, allow, deny });
              });

            if (!interaction.member.voice.channel.permissionOverwrites.cache.has(member.id))
              permission.push({ id: member.id, deny: 1n << 21n });

            await interaction.member.voice.channel.permissionOverwrites.set(permission);

            if (member.voice.channelId == interaction.member.voice.channelId)
              await member.voice.setChannel(member.voice.channel);

            break;
          }

          default:
            break;
        }
      }

    } catch (e) {
      const errCase = {
        ERR_VOICE_ALREADY_EXISTED : "這個頻道已經設定為自動語音頻道了",
        ERR_VOICE_NOT_EXIST       : "這個頻道未設定為自動語音頻道",
        ERR_PERMISSION_DENIED     : "你沒有權限這麼做",
        ERR_NOT_IN_VOICE          : "你必須在語音頻道才能使用這個指令",
        ERR_NOT_WATCHED           : "這個頻道不是自動語音頻道",
        ERR_NOT_MASTER            : "你不是這個頻道的主人",
        ERR_NOT_IMPLEMENTED       : "功能尚未完成",
      }[e.message];

      const embed = new EmbedBuilder()
        .setColor(Colors.Red)
        .setTitle("❌ 錯誤");

      if (!errCase) {
        embed.setDescription(`發生了預料之外的錯誤：\`${e.message}\``)
          .setFooter({ text: "ERR_UNCAUGHT_EXCEPTION" });
        console.error(e);
      } else {
        embed.setDescription(errCase)
          .setFooter({ text: e.message });
      }

      (this.defer)
        ? await interaction.editReply({ embeds: [embed], allowedMentions: { repliedUser: true } })
        : await interaction.editReply({ embeds: [embed], allowedMentions: { repliedUser: true } });
    }
  },
};