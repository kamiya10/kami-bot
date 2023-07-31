const { Colors, EmbedBuilder, SlashCommandBuilder, SlashCommandIntegerOption, SlashCommandStringOption, SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder, TimestampStyles, time } = require("discord.js");
const { TrainType } = require("../../API/tdx");
const { cache } = require("../../Core/cache");

const trainIcon = (type, number) => {
  if ([TrainType.FastLocalTrain, TrainType.FastLocalTrain].includes(type))
    if ([
      1006, 1007, 1038,
      2005, 2007, 2008, 2013, 2015, 2016, 2028, 2036, 2037, 2042, 2046,
      3001, 3005, 3018, 3021, 3023, 3028, 3029, 3033, 3035, 3038,
      4003, 4006, 4007, 4017, 4019, 4021, 4022, 4024, 4026, 4027, 4028, 4029, 4030, 4032, 4033, 4035, 4037, 4039, 4048, 4050,
    ].includes(+number))
      return "https://upload.cc/i1/2023/07/29/dRfwxC.png";

  return {
    [TrainType.TarokoExpress]               : "https://upload.cc/i1/2023/07/29/KTaG7f.png",
    [TrainType.PuyumaExpress]               : "https://upload.cc/i1/2023/07/29/UOu76B.png",
    [TrainType.TzeChiangLimitedExpress]     : "https://upload.cc/i1/2023/07/29/OBUdL3.png",
    [TrainType.LocalTrain]                  : "https://upload.cc/i1/2023/07/29/40Hy9e.png",
    [TrainType.FastLocalTrain]              : "https://upload.cc/i1/2023/07/29/40Hy9e.png",
    [TrainType.TzeChiangLimitedExpress3000] : "https://upload.cc/i1/2023/07/29/A4QfTt.png",
  }[type];
};

const handleTimetableCommands
=

/**
 * @param {import("discord.js").ChatInputCommandInteraction} interaction
 */
(interaction) => {
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
      const number = interaction.options.getInteger("number");
      const timetable = timetables.TrainTimetables.find(v => v.TrainInfo.TrainNo == number);
      const pages = timetable.StopTimes.reduce((acc, item, index) => {
        const chunkIndex = Math.floor(index / 10);

        if (!acc[chunkIndex])
          acc[chunkIndex] = [];

        acc[chunkIndex].push(item);
        return acc;
      }, []);

      const embed = new EmbedBuilder()
        .setColor(Colors.Blue)
        .setAuthor({ name: `${timetable.TrainInfo.TrainNo} ${timetable.TrainInfo.TrainTypeName.Zh_tw}` })
        .setThumbnail(trainIcon(timetable.TrainInfo.TrainTypeCode, timetable.TrainInfo.TrainNo))
        .setTitle(`${timetable.TrainInfo.StartingStationName.Zh_tw} ➡️ ${timetable.TrainInfo.EndingStationName.Zh_tw}`)
        .setDescription(timetable.TrainInfo.Note)
        .addFields({
          name  : "時刻表",
          value : pages[0].map(v => `<:TRA:1134700741479628900> \`${v.ArrivalTime}\` ${v.StationName.Zh_tw} \`${v.DepartureTime}\``).join("\n"),
        });

      interaction.editReply({ embeds: [embed] });
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
    .addSubcommandGroup(new SlashCommandSubcommandGroupBuilder()
      .setName("timetable")
      .setNameLocalization("zh-TW", "時刻表")
      .setDescription("Train Timetable query")
      .setDescriptionLocalization("zh-TW", "查詢火車時刻表")
      .addSubcommand(new SlashCommandSubcommandBuilder()
        .setName("route")
        .setNameLocalization("zh-TW", "依起驛站")
        .setDescription("Query timetable by Time Period")
        .setDescriptionLocalization("zh-TW", "依起驛站查詢火車時刻表")
        .addStringOption(new SlashCommandStringOption()
          .setName("departure")
          .setNameLocalization("zh-TW", "出發站")
          .setDescription("Departuring Station")
          .setDescriptionLocalization("zh-TW", "列車出發站")
          .setAutocomplete(true)
          .setRequired(true))
        .addStringOption(new SlashCommandStringOption()
          .setName("arrival")
          .setNameLocalization("zh-TW", "抵達站")
          .setDescription("Arrival Station")
          .setDescriptionLocalization("zh-TW", "列車抵達站")
          .setAutocomplete(true)
          .setRequired(true)))
      .addSubcommand(new SlashCommandSubcommandBuilder()
        .setName("station")
        .setNameLocalization("zh-TW", "依車站")
        .setDescription("Query timetable by Station")
        .setDescriptionLocalization("zh-TW", "依車站查詢火車時刻表")
        .addStringOption(new SlashCommandStringOption()
          .setName("station")
          .setNameLocalization("zh-TW", "車站")
          .setDescription("Station")
          .setDescriptionLocalization("zh-TW", "車站")
          .setAutocomplete(true)
          .setRequired(true)))
      .addSubcommand(new SlashCommandSubcommandBuilder()
        .setName("number")
        .setNameLocalization("zh-TW", "依車次")
        .setDescription("Query timetable by Train Number")
        .setDescriptionLocalization("zh-TW", "依車次查詢火車時刻表")
        .addIntegerOption(new SlashCommandIntegerOption()
          .setName("number")
          .setNameLocalization("zh-TW", "車次")
          .setDescription("Train Number")
          .setDescriptionLocalization("zh-TW", "列車車次")
          .setRequired(true)))),
  defer     : true,
  ephemeral : false,
  global    : false,

  /**
   *
   * @param {import("discord.js").ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    if (!cache.get("trainTimetable")) {
      const data = await interaction.client.tdx.TRA.getGeneralTimetable();
      cache("trainTimetable", data, Date.now() + 12 * 60 * 60 * 1000);
    }

    switch (interaction.options.getSubcommandGroup()) {
      case "timetable": {
        handleTimetableCommands(interaction);
        break;
      }

      default:
        break;
    }
  },
};