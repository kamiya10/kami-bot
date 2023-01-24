/* eslint-disable no-inline-comments */
const ws_data = {
  type          : "trem-eq",
  time          : 1674210236831,
  timestamp     : 1674210236832,
  number        : 1,
  data_count    : 1,
  id            : 6643,
  report_id     : 68,
  list          : { "H-979-11336952-11": 0 },
  total_station : 72,
  alert         : false,
  cancel        : false,
  final         : false,
};
require("dotenv").config();
const { Client, Collection, Colors, EmbedBuilder, GatewayIntentBits, IntentsBitField, Message } = require("discord.js");
const logger = require("./Core/logger");

const c = new Client({ intents: [ GatewayIntentBits.Guilds] });
c.data = {
  rts_list     : new Collection(),
  rts_stations : new Collection([
    [
      "H-335-11339620-4",
      {
        Lat  : 24.929244,
        Long : 121.316823,
        PGA  : 4,
        Loc  : "桃園市 大溪區",
        area : "桃園市東部",
      },
    ],
    [
      "H-541-11370676-10",
      {
        Lat  : 23.8619697,
        Long : 120.7991229,
        PGA  : 10,
        Loc  : "南投縣 中寮鄉",
        area : "南投縣西部",
      },
    ],
    [
      "H-711-11334880-12",
      {
        Lat  : 22.980406,
        Long : 120.292724,
        PGA  : 12,
        Loc  : "臺南市 歸仁區",
        area : "臺南市南部",
      },
    ],
    [
      "H-979-11336952-11",
      {
        Lat  : 23.576693,
        Long : 121.362569,
        PGA  : 11,
        Loc  : "花蓮縣 萬榮鄉",
        area : "花蓮縣中部",
      },
    ],
    [
      "L-105-11343152-2",
      {
        Lat  : 25.0498006,
        Long : 121.5676974,
        PGA  : 2,
        Loc  : "臺北市 松山區",
        area : "臺北市南部",
      },
    ],
    [
      "L-110-13987576-2",
      {
        Lat  : 25.027934,
        Long : 121.556779,
        PGA  : 2,
        Loc  : "臺北市 信義區",
        area : "臺北市南部",
      },
    ],
    [
      "L-114-11334512-2",
      {
        Lat  : 25.0889189,
        Long : 121.600008,
        PGA  : 2,
        Loc  : "臺北市 內湖區",
        area : "臺北市北部",
      },
    ],
    [
      "L-201-11358232-2",
      {
        Lat  : 25.1377831,
        Long : 121.7759237,
        PGA  : 2,
        Loc  : "基隆市 信義區",
        area : "基隆市東部",
      },
    ],
    [
      "L-208-14312724-2",
      {
        Lat  : 25.225239,
        Long : 121.633467,
        PGA  : 2,
        Loc  : "新北市 金山區",
        area : "新北市北部",
      },
    ],
    [
      "L-220-14252376-1",
      {
        Lat  : 24.993284,
        Long : 121.45074,
        PGA  : 1,
        Loc  : "新北市 板橋區",
        area : "新北市西部",
      },
    ],
    [
      "L-220-11357184-1",
      {
        Lat  : 25.0233567,
        Long : 121.4648098,
        PGA  : 1,
        Loc  : "新北市 板橋區",
        area : "新北市西部",
      },
    ],
    [
      "L-231-11355624-2",
      {
        Lat  : 24.949921,
        Long : 121.5303298,
        PGA  : 2,
        Loc  : "新北市 新店區",
        area : "新北市西部",
      },
    ],
    [
      "L-235-15082012-2",
      {
        Lat  : 24.996221,
        Long : 121.503001,
        PGA  : 2,
        Loc  : "新北市 中和區",
        area : "新北市西部",
      },
    ],
    [
      "L-247-11420168-1",
      {
        Lat  : 25.0854366,
        Long : 121.4794893,
        PGA  : 1,
        Loc  : "新北市 蘆洲區",
        area : "新北市西部",
      },
    ],
    [
      "L-269-11341244-5",
      {
        Lat  : 24.651922,
        Long : 121.7166838,
        PGA  : 5,
        Loc  : "宜蘭縣 冬山鄉",
        area : "宜蘭縣北部",
      },
    ],
    [
      "L-269-11375964-5",
      {
        Lat  : 24.6558461,
        Long : 121.7698703,
        PGA  : 5,
        Loc  : "宜蘭縣 冬山鄉",
        area : "宜蘭縣北部",
      },
    ],
    [
      "L-269-11370996-5",
      {
        Lat  : 24.6323732,
        Long : 121.785422,
        PGA  : 5,
        Loc  : "宜蘭縣 冬山鄉",
        area : "宜蘭縣北部",
      },
    ],
    [
      "L-269-11362396-5",
      {
        Lat  : 24.6657641,
        Long : 121.769527,
        PGA  : 5,
        Loc  : "宜蘭縣 冬山鄉",
        area : "宜蘭縣北部",
      },
    ],
    [
      "L-300-14226992-4",
      {
        Lat  : 24.784577,
        Long : 120.988921,
        PGA  : 4,
        Loc  : "新竹市 東區",
        area : "新竹市東部",
      },
    ],
    [
      "L-304-14220884-4",
      {
        Lat  : 24.868087,
        Long : 120.992822,
        PGA  : 4,
        Loc  : "新竹縣 新豐鄉",
        area : "新竹縣西部",
      },
    ],
    [
      "L-324-14629688-1",
      {
        Lat  : 24.9508665,
        Long : 121.198205,
        PGA  : 1,
        Loc  : "桃園市 平鎮區",
        area : "桃園市中部",
      },
    ],
    [
      "L-325-13901208-4",
      {
        Lat  : 24.842932,
        Long : 121.184552,
        PGA  : 4,
        Loc  : "桃園市 龍潭區",
        area : "桃園市南部",
      },
    ],
    [
      "L-327-11343556-1",
      {
        Lat  : 24.9751421,
        Long : 121.1050857,
        PGA  : 1,
        Loc  : "桃園市 新屋區",
        area : "桃園市西部",
      },
    ],
    [
      "L-330-6662308-1",
      {
        Lat  : 25.003499,
        Long : 121.289971,
        PGA  : 1,
        Loc  : "桃園市 桃園區",
        area : "桃園市北部",
      },
    ],
    [
      "L-335-6392144-4",
      {
        Lat  : 24.929244,
        Long : 121.316823,
        PGA  : 4,
        Loc  : "桃園市 大溪區",
        area : "桃園市東部",
      },
    ],
    [
      "L-350-14815076-3",
      {
        Lat  : 24.7128505,
        Long : 120.9060164,
        PGA  : 3,
        Loc  : "苗栗縣 竹南鎮",
        area : "苗栗縣北部",
      },
    ],
    [
      "L-403-14771008-6",
      {
        Lat  : 24.1419977,
        Long : 120.6560449,
        PGA  : 6,
        Loc  : "臺中市 西區",
        area : "臺中市西部",
      },
    ],
    [
      "L-411-11364524-6",
      {
        Lat  : 24.1536095,
        Long : 120.7234213,
        PGA  : 6,
        Loc  : "臺中市 太平區",
        area : "臺中市西部",
      },
    ],
    [
      "L-412-6654540-6",
      {
        Lat  : 24.101805,
        Long : 120.69782,
        PGA  : 6,
        Loc  : "臺中市 大里區",
        area : "臺中市西部",
      },
    ],
    [
      "L-423-13898616-7",
      {
        Lat  : 24.243157,
        Long : 120.84444,
        PGA  : 7,
        Loc  : "臺中市 東勢區",
        area : "臺中市東部",
      },
    ],
    [
      "L-427-11366940-6",
      {
        Lat  : 24.2248973,
        Long : 120.6942385,
        PGA  : 6,
        Loc  : "臺中市 潭子區",
        area : "臺中市西部",
      },
    ],
    [
      "L-500-13993392-6",
      {
        Lat  : 24.087461,
        Long : 120.581721,
        PGA  : 6,
        Loc  : "彰化縣 彰化市",
        area : "彰化縣北部",
      },
    ],
    [
      "L-510-11353004-9",
      {
        Lat  : 23.9401358,
        Long : 120.5796522,
        PGA  : 9,
        Loc  : "彰化縣 員林市",
        area : "彰化縣中部",
      },
    ],
    [
      "L-515-11337240-6",
      {
        Lat  : 23.9995994,
        Long : 120.5954158,
        PGA  : 6,
        Loc  : "彰化縣 大村鄉",
        area : "彰化縣中部",
      },
    ],
    [
      "L-540-11340764-10",
      {
        Lat  : 23.8890212,
        Long : 120.6898776,
        PGA  : 10,
        Loc  : "南投縣 南投市",
        area : "南投縣西部",
      },
    ],
    [
      "L-541-15081076-10",
      {
        Lat  : 23.8619697,
        Long : 120.7991229,
        PGA  : 10,
        Loc  : "南投縣 中寮鄉",
        area : "南投縣西部",
      },
    ],
    [
      "L-600-11368592-9",
      {
        Lat  : 23.4688032,
        Long : 120.4603967,
        PGA  : 9,
        Loc  : "嘉義市 東區",
        area : "嘉義市東部",
      },
    ],
    [
      "L-600-7713716-9",
      {
        Lat  : 23.4860111,
        Long : 120.4299025,
        PGA  : 9,
        Loc  : "嘉義市 西區",
        area : "嘉義市西部",
      },
    ],
    [
      "L-603-11376580-9",
      {
        Lat  : 23.5889767,
        Long : 120.5501972,
        PGA  : 9,
        Loc  : "嘉義縣 梅山鄉",
        area : "嘉義縣北部",
      },
    ],
    [
      "L-603-11334772-9",
      {
        Lat  : 23.54409,
        Long : 120.577221,
        PGA  : 9,
        Loc  : "嘉義縣 梅山鄉",
        area : "嘉義縣北部",
      },
    ],
    [
      "L-604-11363084-9",
      {
        Lat  : 23.5196937,
        Long : 120.5476858,
        PGA  : 9,
        Loc  : "嘉義縣 竹崎鄉",
        area : "嘉義縣北部",
      },
    ],
    [
      "L-648-4832348-9",
      {
        Lat  : 23.796909,
        Long : 120.460155,
        PGA  : 9,
        Loc  : "雲林縣 西螺鎮",
        area : "雲林縣北部",
      },
    ],
    [
      "L-710-11361000-12",
      {
        Lat  : 23.0369726,
        Long : 120.2667299,
        PGA  : 12,
        Loc  : "臺南市 永康區",
        area : "臺南市南部",
      },
    ],
    [
      "L-710-6345688-12",
      {
        Lat  : 23.0277203,
        Long : 120.2492935,
        PGA  : 12,
        Loc  : "臺南市 永康區",
        area : "臺南市南部",
      },
    ],
    [
      "L-710-11373176-12",
      {
        Lat  : 22.9995656,
        Long : 120.2370402,
        PGA  : 12,
        Loc  : "臺南市 永康區",
        area : "臺南市南部",
      },
    ],
    [
      "L-710-11372876-12",
      {
        Lat  : 23.0068917,
        Long : 120.2726934,
        PGA  : 12,
        Loc  : "臺南市 永康區",
        area : "臺南市南部",
      },
    ],
    [
      "L-711-6732340-12",
      {
        Lat  : 22.980406,
        Long : 120.292724,
        PGA  : 12,
        Loc  : "臺南市 歸仁區",
        area : "臺南市南部",
      },
    ],
    [
      "L-711-14287896-12",
      {
        Lat  : 22.982954,
        Long : 120.277994,
        PGA  : 12,
        Loc  : "臺南市 歸仁區",
        area : "臺南市南部",
      },
    ],
    [
      "L-714-11334680-12",
      {
        Lat  : 23.1204692,
        Long : 120.4655845,
        PGA  : 12,
        Loc  : "臺南市 玉井區",
        area : "臺南市東部",
      },
    ],
    [
      "L-744-11360016-12",
      {
        Lat  : 23.0815742,
        Long : 120.2965775,
        PGA  : 12,
        Loc  : "臺南市 新市區",
        area : "臺南市中部",
      },
    ],
    [
      "L-806-14219088-15",
      {
        Lat  : 22.60759,
        Long : 120.326391,
        PGA  : 15,
        Loc  : "高雄市 前鎮區",
        area : "高雄市西部",
      },
    ],
    [
      "L-807-11372592-15",
      {
        Lat  : 22.6492505,
        Long : 120.3156877,
        PGA  : 15,
        Loc  : "高雄市 三民區",
        area : "高雄市西部",
      },
    ],
    [
      "L-807-11373784-15",
      {
        Lat  : 22.647157,
        Long : 120.333766,
        PGA  : 15,
        Loc  : "高雄市 三民區",
        area : "高雄市西部",
      },
    ],
    [
      "L-807-11360004-15",
      {
        Lat  : 22.6460614,
        Long : 120.2987757,
        PGA  : 15,
        Loc  : "高雄市 三民區",
        area : "高雄市西部",
      },
    ],
    [
      "L-811-4834840-15",
      {
        Lat  : 22.716929,
        Long : 120.299072,
        PGA  : 15,
        Loc  : "高雄市 楠梓區",
        area : "高雄市西部",
      },
    ],
    [
      "L-812-11336648-15",
      {
        Lat  : 22.566453,
        Long : 120.390229,
        PGA  : 15,
        Loc  : "高雄市 小港區",
        area : "高雄市西部",
      },
    ],
    [
      "L-814-11342740-15",
      {
        Lat  : 22.6875827,
        Long : 120.3389691,
        PGA  : 15,
        Loc  : "高雄市 仁武區",
        area : "高雄市西部",
      },
    ],
    [
      "L-826-11335736-15",
      {
        Lat  : 22.7255198,
        Long : 120.2583707,
        PGA  : 15,
        Loc  : "高雄市 梓官區",
        area : "高雄市西部",
      },
    ],
    [
      "L-830-11334780-15",
      {
        Lat  : 22.635866,
        Long : 120.360375,
        PGA  : 15,
        Loc  : "高雄市 鳳山區",
        area : "高雄市西部",
      },
    ],
    [
      "L-880-13986928-18",
      {
        Lat  : 23.5739652,
        Long : 119.5816697,
        PGA  : 18,
        Loc  : "澎湖縣 馬公市",
        area : "澎湖縣中部",
      },
    ],
    [
      "L-904-11336816-15",
      {
        Lat  : 22.7340716,
        Long : 120.498752,
        PGA  : 15,
        Loc  : "屏東縣 九如鄉",
        area : "屏東縣北部",
      },
    ],
    [
      "L-905-11342416-15",
      {
        Lat  : 22.8098939,
        Long : 120.5046655,
        PGA  : 15,
        Loc  : "屏東縣 里港鄉",
        area : "屏東縣北部",
      },
    ],
    [
      "L-909-13990268-15",
      {
        Lat  : 22.655226,
        Long : 120.531428,
        PGA  : 15,
        Loc  : "屏東縣 麟洛鄉",
        area : "屏東縣北部",
      },
    ],
    [
      "L-954-11370600-16",
      {
        Lat  : 22.7775874,
        Long : 121.1051312,
        PGA  : 16,
        Loc  : "臺東縣 卑南鄉",
        area : "臺東縣中部",
      },
    ],
    [
      "L-958-11423064-14",
      {
        Lat  : 23.1152961,
        Long : 121.2051193,
        PGA  : 14,
        Loc  : "臺東縣 池上鄉",
        area : "臺東縣北部",
      },
    ],
    [
      "L-958-11334672-14",
      {
        Lat  : 23.1246572,
        Long : 121.2166469,
        PGA  : 14,
        Loc  : "臺東縣 池上鄉",
        area : "臺東縣北部",
      },
    ],
    [
      "L-972-11334740-8",
      {
        Lat  : 24.165767,
        Long : 121.6533376,
        PGA  : 8,
        Loc  : "花蓮縣 秀林鄉",
        area : "花蓮縣北部",
      },
    ],
    [
      "L-973-11354488-8",
      {
        Lat  : 23.9701738,
        Long : 121.577659,
        PGA  : 8,
        Loc  : "花蓮縣 吉安鄉",
        area : "花蓮縣北部",
      },
    ],
    [
      "L-974-14638108-11",
      {
        Lat  : 23.9095435,
        Long : 121.5309024,
        PGA  : 11,
        Loc  : "花蓮縣 壽豐鄉",
        area : "花蓮縣中部",
      },
    ],
    [
      "L-975-11367144-11",
      {
        Lat  : 23.7455724,
        Long : 121.4575783,
        PGA  : 11,
        Loc  : "花蓮縣 鳳林鎮",
        area : "花蓮縣中部",
      },
    ],
    [
      "L-976-11343452-11",
      {
        Lat  : 23.6671203,
        Long : 121.4286207,
        PGA  : 11,
        Loc  : "花蓮縣 光復鄉",
        area : "花蓮縣中部",
      },
    ],
    [
      "L-978-11354012-11",
      {
        Lat  : 23.4941052,
        Long : 121.4463373,
        PGA  : 11,
        Loc  : "花蓮縣 瑞穗鄉",
        area : "花蓮縣南部",
      },
    ],
    [
      "L-978-11366504-11",
      {
        Lat  : 23.5121499,
        Long : 121.3571453,
        PGA  : 11,
        Loc  : "花蓮縣 瑞穗鄉",
        area : "花蓮縣南部",
      },
    ],
    [
      "L-978-11376196-11",
      {
        Lat  : 23.4632897,
        Long : 121.355128,
        PGA  : 11,
        Loc  : "花蓮縣 瑞穗鄉",
        area : "花蓮縣南部",
      },
    ],
    [
      "L-979-6759352-11",
      {
        Lat  : 23.576693,
        Long : 121.362569,
        PGA  : 11,
        Loc  : "花蓮縣 萬榮鄉",
        area : "花蓮縣中部",
      },
    ],
    [
      "L-981-11339360-14",
      {
        Lat  : 23.346639,
        Long : 121.344342,
        PGA  : 14,
        Loc  : "花蓮縣 玉里鎮",
        area : "花蓮縣南部",
      },
    ],
    [
      "L-981-11334552-14",
      {
        Lat  : 23.3329205,
        Long : 121.3190218,
        PGA  : 14,
        Loc  : "花蓮縣 玉里鎮",
        area : "花蓮縣南部",
      },
    ],
    [
      "H-000-13379360-1",
      {
        Lat  : 29.8108108,
        Long : 106.3944963,
        PGA  : 1,
        Loc  : "重庆市 北碚区",
        area : "重庆市中部",
      },
    ],
  ]) };

c.login(process.env.KAMI_TOKEN);

const test_channels
= [
  "990348130224599040", // exptech
  "949333369869701230", // 火柴
  "927820595712909353", // 黑科技喵喵
];

const intensesTW = [
  "\\⚫０級",
  "\\⚪１級",
  "\\🔵２級",
  "\\🟢３級",
  "\\🟡４級",
  "\\🟠５弱",
  "\\🟤５強",
  "\\🔴６弱",
  "\\🟣６強",
  "\\🛑７級",
];

const embed_cache = {};

module.exports = {
  name  : "rts",
  event : "rts",
  once  : false,

  /**
   *
   * @param {Client} client
   * @param {data} data
   */
  execute(client, data) {
    if (!data.data_count || !Object.keys(data.list).length) return;
    console.debug("called");

    if (!client.data.rts_list.has(data.id))
      client.data.rts_list.set(data.id, new Collection());

    const embed = new EmbedBuilder()
      .setAuthor({ name: "地震檢知" })
      .setFooter({ text: "⚠ 測試訊息 ⚠ 此為實驗性功能，即時資料由 ExpTech 探索科技提供。", iconURL: "https://upload.cc/i1/2023/01/16/mtKV7B.png" });

    embed
      .setColor(data.cancel ? Colors.LightGrey : data.alert ? Colors.Red : Colors.Orange)
      .setDescription(`${data.final ? "\\⚫已停止追蹤" : "\\📡 追蹤中"}`)
      .addFields({
        name  : "發布狀態",
        value : `${data.cancel ? "**已取消**" : data.final ? "**最終報**" : `第 **${data.number}** 報`} （接收於 <t:${~~(data.timestamp / 1000)}:f>）`,
      });

    if (data.data_count > 10) {
      const ids = Object.keys(data.list);
      const int = {};

      for (let i = 0; i < ids.length; i++)
        if (data.list[ids[i]] > int[client.data.rts_stations.get(ids[i]).area])
          int[client.data.rts_stations.get(ids[i]).area] = data.list[ids[i]];

      embed.addFields({
        name  : "各地最大測得震度",
        value : Object.keys(int)
          .map(area => ({ name: area, intensity: int[area] }))
          .sort((a, b) => b.intensity - a.intensity)
          .map(area => `${area.name} ${intensesTW[area.intensity]}`)
          .join("\n"),
      });
    } else {
      embed.addFields({
        name  : "各地最大測得震度",
        value : Object.keys(data.list)
          .map(id => ({ name: client.data.rts_stations.get(id).Loc, intensity: data.list[id] }))
          .sort((a, b) => b.intensity - a.intensity)
          .map(area => `${area.name} ${intensesTW[area.intensity]}`)
          .join("\n"),
      });
    }

    if (!embed_cache[data.id]) {
      embed_cache[data.id] = {
        embed,
        update : true,
        end    : false,
        timer  : setInterval(() => {
          if (embed_cache[data.id].update) {
            for (const channelID of test_channels) {

              /**
               * @type {import("discord.js").Message}
               */
              const message = client.data.rts_list.get(data.id).get(channelID);

              console.debug("message", message);

              if (message) {
                if (message instanceof Message)
                  message.edit({ embeds: [embed_cache[data.id].embed] }).catch(console.error);
                else
                  message.then(m => m.edit({ embeds: [embed_cache[data.id].embed] }).catch(console.error));
              } else {

                /**
                 * @type {import("discord.js").TextChannel}
                 */
                const channel = client.channels.cache.get(channelID);

                const sent = channel.send({ embeds: [embed_cache[data.id].embed] }).catch(console.error);
                client.data.rts_list.get(data.id).set(channelID, sent);
                sent.then(v => client.data.rts_list.get(data.id).set(channelID, v));
              }
            }

            embed_cache[data.id].update = false;
            console.debug("rts updated");
          }

          if (embed_cache[data.id].end) {
            clearInterval(embed_cache[data.id].timer);
            setTimeout(() => {
              for (const channelID of test_channels) {

                /**
                 * @type {import("discord.js").Message}
                 */
                const message = client.data.rts_list.get(data.id).get(channelID);

                if (message) message.delete();
              }

              client.data.rts_list.delete(data.id);
            }, 10000).unref();

            delete embed_cache[data.id];
          }
        }, 1500),
      };
    } else {
      embed_cache[data.id].embed = embed;
      embed_cache[data.id].update = true;

      if (data.cancel || data.final) embed_cache[data.id].end = true;
    }
  },
};

c.on("ready", () => {
  module.exports.execute(c, ws_data);
});

/**
* @typedef {object} data
* @property {string} type
* @property {number} format
* @property {number} time 第一站觸發時間
* @property {number} timestamp 發送時間
* @property {number} number 報數
* @property {number} data_count 資料數
* @property {number} id 檢知編號
* @property {number} report_id 檢知報告 id
* @property {Record<string, number} list 測站震度
* @property {number} total_station 測站總數
* @property {boolean} alert 警報
* @property {boolean} cancel 取消
* @property {boolean} final 最終報
*/
