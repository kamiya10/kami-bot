const {
  ActionRowBuilder,
  AutocompleteInteraction,
  ButtonBuilder,
  ButtonStyle,
  Collection,
  Colors,
  ComponentType,
  EmbedBuilder,
  SlashCommandBuilder,
  SlashCommandIntegerOption,
  SlashCommandNumberOption,
  SlashCommandStringOption,
  SlashCommandSubcommandBuilder,
  SlashCommandSubcommandGroupBuilder,
  TimestampStyles,
  time,
} = require("discord.js");
const {
  TrainDirectionName,
  TrainType,
  TrainTypeName,
} = require("../../API/tdx");
const { cache } = require("../../Core/cache");

const trainIcon = (type, number) => {
  if ([TrainType.FastLocalTrain, TrainType.FastLocalTrain].includes(type))
    if (
      [
        1006, 1007, 1038, 2005, 2007, 2008, 2013, 2015, 2016, 2028, 2036, 2037,
        2042, 2046, 3001, 3005, 3018, 3021, 3023, 3028, 3029, 3033, 3035, 3038,
        4003, 4006, 4007, 4017, 4019, 4021, 4022, 4024, 4026, 4027, 4028, 4029,
        4030, 4032, 4033, 4035, 4037, 4039, 4048, 4050,
      ].includes(+number)
    )
      return "https://upload.cc/i1/2023/07/29/dRfwxC.png";

  return {
    [TrainType.TarokoExpress]: "https://upload.cc/i1/2023/07/29/KTaG7f.png",
    [TrainType.PuyumaExpress]: "https://upload.cc/i1/2023/07/29/UOu76B.png",
    [TrainType.TzeChiangLimitedExpress]:
      "https://upload.cc/i1/2023/07/29/OBUdL3.png",
    [TrainType.LocalTrain]: "https://upload.cc/i1/2023/07/29/40Hy9e.png",
    [TrainType.FastLocalTrain]: "https://upload.cc/i1/2023/07/29/40Hy9e.png",
    [TrainType.TzeChiangLimitedExpress3000]:
      "https://upload.cc/i1/2023/07/29/A4QfTt.png",
  }[type];
};

const facilityIcon = (trainInfo) => {
  const str = [];

  if (trainInfo.Note.includes("跨日"))
    str.push("<:TRA_crossday:1135723683684560987> 跨日列車");

  if (trainInfo.Note.includes("自由座"))
    str.push("<:TRA_freeseat:1135590263620907060> 自由座");

  if (trainInfo.Note.includes("騰雲座艙"))
    str.push("<:TRA_bussiness:1135585152706289734> 騰雲座艙");

  if (trainInfo.TrainTypeCode == TrainType.PuyumaExpress)
    str.push("<:TRA_table:1135584917921738772> 桌型座");

  if (trainInfo.DiningFlag)
    str.push("<:TRA_lunchbox:1135584866843496649> 訂便當服務");

  if (trainInfo.DailyFlag || trainInfo.Note.includes("每日行駛"))
    str.push("<:TRA_everyday:1135580865276153896> 每日列車");

  if (trainInfo.Note.includes("親子車廂"))
    str.push("<:TRA_parenting:1135581088488624158> 親子車廂");

  if (trainInfo.BikeFlag)
    str.push("<:TRA_bicycle:1135585523109478401> 可載運自行車");

  if (trainInfo.BreastFeedFlag)
    str.push("<:TRA_nursing:1135581420895604919> 哺(集)乳室");

  if (trainInfo.WheelChairFlag)
    str.push("<:TRA_wheelchair:1135581477409656914> 身障旅客專用座位");

  return str.join("\n");
};

const handleTrainNumberAutocomplete = async (interaction) => {
  const timetables = cache.get("trainTimetable");
  const focused = interaction.options.getFocused(true);

  if (!timetables) return;

  const choice = timetables.TrainTimetables.map((v) => ({
    name: `${v.TrainInfo.TrainNo}次 ${v.TrainInfo.TripHeadSign} ${TrainTypeName[v.TrainInfo.TrainTypeCode]}`,
    value: v.TrainInfo.TrainNo,
  }))
    .filter((v) => v.name.includes(focused.value))
    .slice(0, 25);
  await interaction.respond(choice);
};

const handleTrackDepartureAutocomplete = async (interaction) => {
  const timetables = cache.get("trainTimetable");
  const timetable = timetables.TrainTimetables.find(
    (v) => v.TrainInfo.TrainNo == interaction.options.getString("number"),
  );

  if (!timetable) return;

  const focused = interaction.options.getFocused(true);
  const choice = timetable.StopTimes.map((v) => ({
    name: `${v.StopSequence}. ${v.StationName.Zh_tw} ${v.StationID}`,
    value: v.StationID,
  }))
    .filter((v) => !focused.value || v.name.includes(focused.value))
    .slice(0, 25);
  await interaction.respond(choice);
};

const handleTrackArrivalAutocomplete =
  /**
   *
   * @param {AutocompleteInteraction} interaction
   */
  async (interaction) => {
    const timetables = cache.get("trainTimetable");

    /**
     * @type {import("../../API/tdx").TrainTimetable}
     */
    const timetable = timetables.TrainTimetables.find(
      (v) => v.TrainInfo.TrainNo == interaction.options.getString("number"),
    );

    if (!timetable) return;

    const focused = interaction.options.getFocused(true);
    const departure = interaction.options.getString("departure");

    if (!departure) return;

    const choice = timetable.StopTimes.map((v) => ({
      name: `${v.StopSequence}. ${v.StationName.Zh_tw} ${v.StationID}`,
      value: v.StationID,
      sequence: v.StopSequence,
    }))
      .reduce(
        (acc, v, i, a) => (
          i > a.findIndex((val) => val.value == departure) && acc.push(v), acc
        ),
        [],
      )
      .filter((v) => !focused.value || v.name.includes(focused.value))
      .slice(0, 25);
    await interaction.respond(choice);
  };

const handleTimetableCommands =
  /**
   * @param {import("discord.js").ChatInputCommandInteraction} interaction
   */
  async (interaction) => {
    /**
     * @type {import("../../API/tdx").Timetable}
     */
    const timetables = cache.get("trainTimetable");

    switch (interaction.options.getSubcommand()) {
      case "route": {
        break;
      }

      case "station": {
        break;
      }

      case "number": {
        const number = interaction.options.getString("number");
        const timetable = timetables.TrainTimetables.find(
          (v) => v.TrainInfo.TrainNo == number,
        );

        let pageIndex = 0;
        const pages = timetable.StopTimes.reduce((acc, item, index, arr) => {
          item.isOriginatingStation = index == 0;
          item.isTerminalStation = index == arr.length - 1;

          const chunkIndex = Math.floor(index / 15);

          if (!acc[chunkIndex]) acc[chunkIndex] = [];

          acc[chunkIndex].push(item);
          return acc;
        }, []).map((page) =>
          page
            .map(
              (v) =>
                `<:TRA:1134700741479628900> ${v.isOriginatingStation ? "**始發站**" : `\`${v.ArrivalTime}\``} ${v.StationName.Zh_tw} ${v.isTerminalStation ? "**終點站**" : `\`${v.DepartureTime}\``}`,
            )
            .join("\n"),
        );

        const baseEmbed = new EmbedBuilder()
          .setColor(Colors.Blue)
          .setAuthor({
            name: `${timetable.TrainInfo.TrainNo} ${TrainTypeName[timetable.TrainInfo.TrainTypeCode]}`,
          })
          .setThumbnail(
            trainIcon(
              timetable.TrainInfo.TrainTypeCode,
              timetable.TrainInfo.TrainNo,
            ),
          )
          .setTitle(
            `${timetable.TrainInfo.StartingStationName.Zh_tw} → ${timetable.TrainInfo.EndingStationName.Zh_tw}`,
          )
          .setDescription(`${timetable.TrainInfo.Note}`)
          .addFields([
            {
              name: "車次",
              value: `${timetable.TrainInfo.TrainNo}`,
              inline: true,
            },
            {
              name: "車種",
              value: `${timetable.TrainInfo.TrainTypeName.Zh_tw}`,
              inline: true,
            },
            {
              name: "方向",
              value: `${TrainDirectionName[timetable.TrainInfo.Direction]}`,
              inline: true,
            },
            {
              name: "始發站",
              value: `${timetable.StopTimes[0].StationName.Zh_tw} ${timetable.StopTimes[0].StationName.En}\n預計 ${timetable.StopTimes[0].DepartureTime} 發車`,
              inline: true,
            },
            {
              name: "終點站",
              value: `${timetable.StopTimes.at(-1).StationName.Zh_tw} ${timetable.StopTimes.at(-1).StationName.En}\n預計 ${timetable.StopTimes.at(-1).ArrivalTime} 抵達`,
              inline: true,
            },
            {
              name: "服務",
              value: facilityIcon(timetable.TrainInfo),
              inline: true,
            },
          ]);

        const paginator = (index) =>
          new ActionRowBuilder().setComponents([
            new ButtonBuilder()
              .setCustomId("first-page")
              .setStyle(ButtonStyle.Secondary)
              .setEmoji("⏮️")
              .setDisabled(index < 1),
            new ButtonBuilder()
              .setCustomId("prev-page")
              .setStyle(ButtonStyle.Secondary)
              .setEmoji("◀️")
              .setDisabled(index < 1),
            new ButtonBuilder()
              .setCustomId("current-page")
              .setStyle(ButtonStyle.Secondary)
              .setLabel(`${pageIndex + 1} / ${pages.length}`)
              .setDisabled(true),
            new ButtonBuilder()
              .setCustomId("next-page")
              .setStyle(ButtonStyle.Secondary)
              .setEmoji("▶️")
              .setDisabled(index > pages.length - 2),
            new ButtonBuilder()
              .setCustomId("last-page")
              .setStyle(ButtonStyle.Secondary)
              .setEmoji("⏭️")
              .setDisabled(index > pages.length - 2),
          ]);

        const sent = await interaction.editReply({
          embeds: [
            new EmbedBuilder(baseEmbed.data).addFields({
              name: "時刻表",
              value: pages[0],
            }),
          ],
          components: [paginator(pageIndex)],
        });

        const collector = sent.createMessageComponentCollector({
          componentType: ComponentType.Button,
        });

        collector.on("collect", async (ci) => {
          switch (ci.customId) {
            case "first-page":
              pageIndex = 0;
              break;
            case "prev-page":
              pageIndex--;
              break;
            case "next-page":
              pageIndex++;
              break;
            case "last-page":
              pageIndex = pages.length - 1;
              break;

            default:
              break;
          }

          await ci.update({
            embeds: [
              new EmbedBuilder(baseEmbed.data).addFields({
                name: "時刻表",
                value: pages[pageIndex],
              }),
            ],
            components: [paginator(pageIndex)],
          });
        });
        break;
      }

      default:
        break;
    }
  };

module.exports = {
  data: new SlashCommandBuilder()
    .setName("tra")
    .setNameLocalization("zh-TW", "臺鐵")
    .setDescription("TRA commands")
    .setDescriptionLocalization("zh-TW", "臺鐵指令")
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("track")
        .setNameLocalization("zh-TW", "追蹤")
        .setDescription("Track a train.")
        .setDescriptionLocalization("zh-TW", "追蹤列車進度")
        .addStringOption(
          new SlashCommandStringOption()
            .setName("number")
            .setNameLocalization("zh-TW", "車次")
            .setDescription("Select the number of the train.")
            .setDescriptionLocalization("zh-TW", "選擇列車車次")
            .setAutocomplete(true)
            .setRequired(true),
        )
        .addStringOption(
          new SlashCommandStringOption()
            .setName("departure")
            .setNameLocalization("zh-TW", "出發站")
            .setDescription("Select the departure station.")
            .setDescriptionLocalization("zh-TW", "選擇列車出發站")
            .setAutocomplete(true)
            .setRequired(true),
        )
        .addStringOption(
          new SlashCommandStringOption()
            .setName("arrival")
            .setNameLocalization("zh-TW", "抵達站")
            .setDescription("Select the arrival station.")
            .setDescriptionLocalization("zh-TW", "選擇列車抵達站")
            .setAutocomplete(true)
            .setRequired(true),
        ),
    )
    .addSubcommandGroup(
      new SlashCommandSubcommandGroupBuilder()
        .setName("timetable")
        .setNameLocalization("zh-TW", "時刻表")
        .setDescription("Train Timetable query.")
        .setDescriptionLocalization("zh-TW", "查詢火車時刻表")
        .addSubcommand(
          new SlashCommandSubcommandBuilder()
            .setName("route")
            .setNameLocalization("zh-TW", "依起驛站")
            .setDescription("Query timetable by Time Period")
            .setDescriptionLocalization("zh-TW", "依起驛站查詢火車時刻表")
            .addStringOption(
              new SlashCommandStringOption()
                .setName("departure")
                .setNameLocalization("zh-TW", "出發站")
                .setDescription("Departuring Station")
                .setDescriptionLocalization("zh-TW", "列車出發站")
                .setAutocomplete(true)
                .setRequired(true),
            )
            .addStringOption(
              new SlashCommandStringOption()
                .setName("arrival")
                .setNameLocalization("zh-TW", "抵達站")
                .setDescription("Arrival Station")
                .setDescriptionLocalization("zh-TW", "列車抵達站")
                .setAutocomplete(true)
                .setRequired(true),
            ),
        )
        .addSubcommand(
          new SlashCommandSubcommandBuilder()
            .setName("station")
            .setNameLocalization("zh-TW", "依車站")
            .setDescription("Query timetable by Station")
            .setDescriptionLocalization("zh-TW", "依車站查詢火車時刻表")
            .addStringOption(
              new SlashCommandStringOption()
                .setName("station")
                .setNameLocalization("zh-TW", "車站")
                .setDescription("Station")
                .setDescriptionLocalization("zh-TW", "車站")
                .setAutocomplete(true)
                .setRequired(true),
            ),
        )
        .addSubcommand(
          new SlashCommandSubcommandBuilder()
            .setName("number")
            .setNameLocalization("zh-TW", "依車次")
            .setDescription("Query timetable by Train Number")
            .setDescriptionLocalization("zh-TW", "依車次查詢火車時刻表")
            .addStringOption(
              new SlashCommandStringOption()
                .setName("number")
                .setNameLocalization("zh-TW", "車次")
                .setDescription("Train Number")
                .setDescriptionLocalization("zh-TW", "列車車次")
                .setAutocomplete(true)
                .setRequired(true),
            ),
        ),
    ),
  defer: true,
  ephemeral: false,
  global: false,

  /**
   * @param {import("discord.js").AutocompleteInteraction} interaction
   */
  async autoComplete(interaction) {
    if (!cache.get("trainTimetable")) {
      const data = await interaction.client.tdx.TRA.getGeneralTimetable();
      cache("trainTimetable", data, Date.now() + 12 * 60 * 60 * 1000);
    }

    const focused = interaction.options.getFocused(true);

    switch (focused.name) {
      case "number":
        await handleTrainNumberAutocomplete(interaction);
        break;
      case "departure":
        await handleTrackDepartureAutocomplete(interaction);
        break;
      case "arrival":
        await handleTrackArrivalAutocomplete(interaction);
        break;
      default:
        interaction.respond([]);
    }
  },

  /**
   * @param {import("discord.js").ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    if (!cache.get("trainTimetable")) {
      const data = await interaction.client.tdx.TRA.getGeneralTimetable();
      cache("trainTimetable", data, Date.now() + 12 * 60 * 60 * 1000);
    }

    switch (interaction.options.getSubcommandGroup()) {
      case "timetable": {
        await handleTimetableCommands(interaction);
        break;
      }

      default:
        break;
    }
  },
};
