const {
  ActionRowBuilder,
  ChannelType,
  Colors,
  ComponentType,
  EmbedBuilder,
  PermissionFlagsBits,
  SelectMenuBuilder,
  SlashCommandBooleanOption,
  SlashCommandBuilder,
  SlashCommandChannelOption,
  SlashCommandIntegerOption,
  SlashCommandRoleOption,
  SlashCommandSubcommandBuilder,
  StringSelectMenuBuilder,
} = require("discord.js");
const GuildDatabaseModel = require("../../Model/GuildDatabaseModel");
const formatEarthquake = require("../../Functions/formatEarthquake");
const styles = [
  "精簡",
  "標準",
  "標準（大報告圖）",
  "詳細",
  "詳細（多欄位）",
  "進階",
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("earthquake")
    .setNameLocalization("zh-TW", "地震報告")
    .setDescription("Earthquake Reports")
    .setDescriptionLocalization("zh-TW", "查詢地震報告")
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("lookup")
        .setNameLocalization("zh-TW", "查看")
        .setDescription("View earthquake reports.")
        .setDescriptionLocalization("zh-TW", "查看地震報告")
        .addIntegerOption(
          new SlashCommandIntegerOption()
            .setName("style")
            .setNameLocalization("zh-TW", "樣式")
            .setDescription("Display style of the earthquake report.")
            .setDescriptionLocalization("zh-TW", "地震報告樣式")
            .addChoices(
              ...[
                {
                  name: "Simple",
                  name_localizations: { "zh-TW": "精簡" },
                  value: 0,
                },
                {
                  name: "Standard",
                  name_localizations: { "zh-TW": "標準" },
                  value: 1,
                },
                {
                  name: "Standard (Large Report Image)",
                  name_localizations: { "zh-TW": "標準（大報告圖）" },
                  value: 2,
                },
                {
                  name: "Detailed",
                  name_localizations: { "zh-TW": "詳細" },
                  value: 3,
                },
                {
                  name: "Detailed (Multi-field)",
                  name_localizations: { "zh-TW": "詳細（多欄位）" },
                  value: 4,
                },
                {
                  name: "Advanced",
                  name_localizations: { "zh-TW": "進階" },
                  value: 5,
                },
              ],
            ),
        ),
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("report")
        .setNameLocalization("zh-TW", "推播")
        .setDescription("Earthquake report push settings.")
        .setDescriptionLocalization("zh-TW", "地震報告推播設定")
        .addChannelOption(
          new SlashCommandChannelOption()
            .setName("channel")
            .setNameLocalization("zh-TW", "頻道")
            .setDescription("The channel earthquake reports should be sent to.")
            .setDescriptionLocalization("zh-TW", "要發送地震報告的頻道")
            .addChannelTypes(
              ChannelType.GuildText,
              ChannelType.GuildAnnouncement,
            ),
        )
        .addIntegerOption(
          new SlashCommandIntegerOption()
            .setName("style")
            .setNameLocalization("zh-TW", "樣式")
            .setDescription("Display style of the earthquake report.")
            .setDescriptionLocalization("zh-TW", "地震報告樣式")
            .addChoices(
              ...[
                {
                  name: "Simple",
                  name_localizations: { "zh-TW": "精簡" },
                  value: 0,
                },
                {
                  name: "Standard",
                  name_localizations: { "zh-TW": "標準" },
                  value: 1,
                },
                {
                  name: "Standard (Large Report Image)",
                  name_localizations: { "zh-TW": "標準（大報告圖）" },
                  value: 2,
                },
                {
                  name: "Detailed",
                  name_localizations: { "zh-TW": "詳細" },
                  value: 3,
                },
                {
                  name: "Detailed (Multi-field)",
                  name_localizations: { "zh-TW": "詳細（多欄位）" },
                  value: 4,
                },
                {
                  name: "Advanced",
                  name_localizations: { "zh-TW": "進階" },
                  value: 5,
                },
              ],
            ),
        )
        .addBooleanOption(
          new SlashCommandBooleanOption()
            .setName("unnumbered")
            .setNameLocalization("zh-TW", "無編號報告")
            .setDescription(
              "Whether unnumbered earthquake reports should be sent.",
            )
            .setDescriptionLocalization("zh-TW", "是否推播無編號地震報告"),
        ),
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("rts")
        .setNameLocalization("zh-TW", "地震檢知")
        .setDescription(
          "(Experimental) Realtime shaking detection, data provided by ExpTech.",
        )
        .setDescriptionLocalization(
          "zh-TW",
          "（實驗性功能）即時地震檢知，資料由 ExpTech 提供",
        )
        .addChannelOption(
          new SlashCommandChannelOption()
            .setName("channel")
            .setNameLocalization("zh-TW", "頻道")
            .setDescription("The channel RTS Detections should be sent to.")
            .setDescriptionLocalization("zh-TW", "要發送即時地震檢知的頻道")
            .addChannelTypes(ChannelType.GuildText),
        )
        .addRoleOption(
          new SlashCommandRoleOption()
            .setName("mention")
            .setNameLocalization("zh-TW", "提及")
            .setDescription("The role to ping when RTS Detections are sent.")
            .setDescriptionLocalization(
              "zh-TW",
              "發送即時地震檢知時提及的身分組",
            ),
        )
        .addBooleanOption(
          new SlashCommandBooleanOption()
            .setName("alert")
            .setNameLocalization("zh-TW", "警報")
            .setDescription("Send the detection only when it is alerted.")
            .setDescriptionLocalization("zh-TW", "只在警報時發送訊息"),
        ),
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("eew")
        .setNameLocalization("zh-TW", "強震即時警報")
        .setDescription("Earthquake Early Warning push setting.")
        .setDescriptionLocalization("zh-TW", "強震即時警報推播設定")
        .addChannelOption(
          new SlashCommandChannelOption()
            .setName("channel")
            .setNameLocalization("zh-TW", "頻道")
            .setDescription(
              "The channel Earthquake Early Warnings should be sent to.",
            )
            .setDescriptionLocalization("zh-TW", "要發送強震即時警報的頻道")
            .addChannelTypes(ChannelType.GuildText),
        )
        .addRoleOption(
          new SlashCommandRoleOption()
            .setName("mention")
            .setNameLocalization("zh-TW", "提及")
            .setDescription(
              "The role to ping when Earthquake Early Warnings are sent.",
            )
            .setDescriptionLocalization(
              "zh-TW",
              "發送強震即時警報時提及的身分組",
            ),
        ),
    ),
  defer: true,
  ephemeral: false,
  global: true,

  /**
   * @param {import("discord.js").ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    try {
      if (!interaction.client.database.GuildDatabase.has(interaction.guild.id))
        interaction.client.database.GuildDatabase.set(
          interaction.guild.id,
          GuildDatabaseModel(),
        );

      const GuildSetting = interaction.client.database.GuildDatabase.get(
        interaction.guild.id,
      );
      const sc = interaction.options.getSubcommand(false) || undefined;

      const bypass = interaction.user.id == process.env.OWNER_ID;

      switch (sc) {
        case "lookup": {
          const style = interaction.options.getInteger("style") ?? 5;

          if (
            !interaction.client.data.quake_data ||
            !interaction.client.data.quake_data
          ) {
            await interaction.editReply({
              embeds: [
                new EmbedBuilder()
                  .setColor(Colors.Blue)
                  .setDescription(
                    "<a:loading:849794359083270144> 正在初始化資料，請稍後。（約需 `<一分鐘`）",
                  ),
              ],
            });

            while (true)
              if (
                interaction.client.data.quake_data &&
                interaction.client.data.quake_data_s
              )
                break;
          }

          let messagedata = formatEarthquake(
            interaction.client.data.quake_data_all[0],
            style,
          );
          let reports = new StringSelectMenuBuilder()
            .setCustomId("report")
            .setOptions(
              interaction.client.data.quake_data_all
                .slice(0, 20)
                .map((v, index) => ({
                  label: `${v.EarthquakeNo % 1000 == 0 ? "小地區有感地震" : v.EarthquakeNo}`,
                  value: `${index}`,
                  description: v.ReportContent,
                  default: index == 0,
                })),
            );
          messagedata.components.push(
            new ActionRowBuilder({ components: [reports] }),
          );

          /**
           * @type {import("discord.js").Message}
           */
          const sent = await interaction.editReply(messagedata);
          const filter = (i) => i.user.id === interaction.user.id;

          const collector = sent.createMessageComponentCollector({
            filter,
            time: 5 * 60000,
            componentType: ComponentType.StringSelect,
          });
          collector.on("collect", async (i) => {
            reports = reports.setOptions(
              interaction.client.data.quake_data_all
                .slice(0, 20)
                .map((v, index) => ({
                  label: `${v.EarthquakeNo % 1000 == 0 ? "小地區有感地震" : v.EarthquakeNo}`,
                  value: `${index}`,
                  description: v.ReportContent,
                  default: index == i.values[0],
                })),
            );
            messagedata = formatEarthquake(
              interaction.client.data.quake_data_all[i.values[0]],
              style,
            );
            messagedata.components.push(
              new ActionRowBuilder({ components: [reports] }),
            );
            await i.update(messagedata);
          });

          break;
        }

        case "report": {
          if (
            !interaction.memberPermissions.has(
              PermissionFlagsBits.Administrator,
            ) &&
            !bypass
          )
            throw { message: "ERR_PERMISSION_DENIED" };
          const channel = interaction.options.getChannel("channel");
          const style = interaction.options.getInteger("style");
          const small = interaction.options.getBoolean("unnumbered");

          if (channel)
            if (
              !channel
                .permissionsFor(interaction.guild.members.me)
                .has([
                  PermissionFlagsBits.SendMessages,
                  PermissionFlagsBits.EmbedLinks,
                ])
            )
              throw { message: "ERR_MISSING_PERMISSION" };

          let desc = "";

          if (channel) desc += `已將 **${channel}** 設為地震報告推播頻道`;
          else desc += "已關閉地震報告推播功能";

          if (channel && style != undefined)
            desc += `，報告樣式為 **${styles[style]}** `;

          if (channel) desc += `且 **${small ? "" : "不"}傳送** 無編號地震報告`;
          desc += "。";

          GuildSetting.quake_channel = channel?.id || null;
          GuildSetting.quake_style = style;
          GuildSetting.quake_small = small;

          await interaction.client.database.GuildDatabase.save();

          const embed = new EmbedBuilder()
            .setColor(Colors.Green)
            .setDescription(desc)
            .setTitle("✅ 成功");

          await interaction.editReply({ embeds: [embed] });
          break;
        }

        case "rts": {
          if (
            !interaction.memberPermissions.has(
              PermissionFlagsBits.Administrator,
            ) &&
            !bypass
          )
            throw { message: "ERR_PERMISSION_DENIED" };
          const channel = interaction.options.getChannel("channel");
          const mention = interaction.options.getRole("mention");
          const alert = interaction.options.getBoolean("alert");

          if (channel)
            if (
              !channel
                .permissionsFor(interaction.guild.members.me)
                .has([
                  PermissionFlagsBits.SendMessages,
                  PermissionFlagsBits.EmbedLinks,
                ])
            )
              throw { message: "ERR_MISSING_PERMISSION" };

          let desc = "";

          if (channel) desc += `已將 **${channel}** 設為即時地震檢知頻道`;
          else desc += "已關閉即時地震檢知功能";

          if (channel && mention != undefined)
            desc += `，並將在 **${alert ? "警報" : "檢知"}** 發佈時提及 **${mention}**`;
          desc += "。";

          GuildSetting.rts_channel = channel?.id || null;
          GuildSetting.rts_mention = mention?.id || null;
          GuildSetting.rts_alert = alert || null;

          await interaction.client.database.GuildDatabase.save();

          const embed = new EmbedBuilder()
            .setColor(Colors.Green)
            .setDescription(desc)
            .setTitle("✅ 成功");

          await interaction.editReply({ embeds: [embed] });
          break;
        }

        case "eew": {
          if (
            !interaction.memberPermissions.has(
              PermissionFlagsBits.Administrator,
            ) &&
            !bypass
          )
            throw { message: "ERR_PERMISSION_DENIED" };
          const channel = interaction.options.getChannel("channel");
          const mention = interaction.options.getRole("mention");

          if (channel)
            if (
              !channel
                .permissionsFor(interaction.guild.members.me)
                .has([
                  PermissionFlagsBits.SendMessages,
                  PermissionFlagsBits.EmbedLinks,
                ])
            )
              throw { message: "ERR_MISSING_PERMISSION" };

          let desc = "";

          if (channel) desc += `已將 **${channel}** 設為強震即時警報頻道`;
          else desc += "已關閉強震即時警報功能";

          if (channel && mention != undefined)
            desc += `，並將在警報發佈時提及 **${mention}**`;
          desc += "。";

          GuildSetting.eew_channel = channel?.id || null;
          GuildSetting.eew_mention = mention?.id;

          await interaction.client.database.GuildDatabase.save();

          const embed = new EmbedBuilder()
            .setColor(Colors.Green)
            .setDescription(desc)
            .setTitle("✅ 成功");

          await interaction.editReply({ embeds: [embed] });
          break;
        }
      }
    } catch (e) {
      const errCase = {
        ERR_PERMISSION_DENIED: "你沒有權限這麼做",
        ERR_MISSING_PERMISSION: "我沒有權限在這個頻道傳送訊息",
      }[e.message];

      const embed = new EmbedBuilder().setColor(Colors.Red).setTitle("❌ 錯誤");

      if (!errCase) {
        embed
          .setDescription(`發生了預料之外的錯誤：\`${e.message}\``)
          .setFooter({ text: "ERR_UNCAUGHT_EXCEPTION" });
        console.error(e);
      } else {
        embed.setDescription(errCase).setFooter({ text: e.message });
      }

      this.defer
        ? await interaction.editReply({
            embeds: [embed],
            allowedMentions: { repliedUser: true },
          })
        : await interaction.editReply({
            embeds: [embed],
            allowedMentions: { repliedUser: true },
          });
    }
  },
};
