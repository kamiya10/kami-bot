const { Colors, EmbedBuilder } = require("discord.js");
const logger = require("../Core/logger");
let distances;
const pos = require("../locations.json");
const ongoingMsgIds = {};
const isMessageAllSent = {};
const magnitudeTW = [
  "極微",
  "極微",
  "微小",
  "微小",
  "輕微",
  "中等",
  "強烈",
  "重大",
  "極大",
];
const magnitudeE = [
  "\\⚫",
  "\\⚫",
  "\\⚪",
  "\\🔵",
  "\\🟢",
  "\\🟡",
  "\\🟠",
  "\\🔴",
  "\\🛑",
];
const depthTW = [
  "極淺層",
  "淺層",
  "中層",
  "深層",
];
const depthE = [
  "\\🔴",
  "\\🟠",
  "\\🟡",
  "\\🟢",
];
module.exports = {
  name  : "eew",
  event : "messageCreate",
  once  : false,

  /**
	 * @param {import("discord.js").Client} client
   * @param {import("discord.js").Message} message The created message
   */
  execute(client, message) {
    if (message.channelId != "948508570138329098") return;

    if (message.author.id == client.user.id) return;

    try {

      /**
			 * @type {event}
			 */
      const event = JSON.parse(message.content);

      if (event.topic != "CWA_EEW") return;
      logger.debug(`${this.name} triggered`);

      const GuildSetting = client.database.GuildDatabase.getAll(["eew_channel", "eew_mention"]);
      const eewchannels = Object.keys(GuildSetting).filter(v => GuildSetting[v].eew_channel != null).map(v => [GuildSetting[v].eew_channel, GuildSetting[v].eew_mention]);

      event.data.forEach(data => {
        const pt = new Date(message.createdTimestamp);
        const et = new Date(data.originTime);

        const expected = {};

        for (const city in pos) {
          expected[city] ??= {};

          for (const town in pos[city]) {
            expected[city][town] ??= {};
            const loc = pos[city][town];
            const distance = twoSideDistance(
              caldistance(
                { lat: loc[1], lon: loc[2] },
                { lat: data.lat, lon: data.lon },
              ),
              data.depth,
            );
            expected[city][town].pga = pga(
              data.magnitude,
              distance,
              loc[3] ?? 1,
            );
            expected[city][town].location = `${city} ${town}`;
            expected[city][town].int = pgaToIntensity(expected[city][town].pga);
            expected[city][town].intString = intensityToString(expected[city][town].int);
            expected[city][town].distance = distance;
          }
        }

        // console.log(expected);

        const nearest = getNearest(expected);
        const max = getMaxIntensity(expected);
        const maxAll = getAllMaxIntensity(expected);

        const relPos = calRelative(data.lon, data.lat);

        const depth = [
          30,
          70,
          300,
          700,
        ];
        depth.push(data.depth);
        const depthI = depth.sort((a, b) => a - b).indexOf(data.depth);
        const magnitudeI = ~~data.magnitude;

        const embed = new EmbedBuilder()
          .setColor(Colors.Red)
          .setAuthor({ name: "強震即時警報", iconURL: "https://i.imgur.com/qIxk1H1.png" })
          .setDescription(`[${data.id}] 第 ${data.no} 報`)
          .setFields(
            ...[
              { name: "規模", value: `${magnitudeE[magnitudeI]} 芮氏 **${data.magnitude}** \`(${magnitudeTW[magnitudeI]})\``, inline: true },
              { name: "深度", value: `${depthE[depthI]} **${data.depth}** 公里 \`(${depthTW[depthI]})\``, inline: true },
              { name: "發生時間", value: `<t:${~~(et.getTime() / 1000)}:T>（<t:${~~(et.getTime() / 1000)}:R>）`, inline: true },
              { name: "最大震度", value: `${max.location} **${max.intString}**`, inline: true },
              { name: "最靠近震央", value: `${nearest.location} **${nearest.intString}**`, inline: true },
              { name: "震央位置", value: `> 經度 **東經 ${data.lon}**\n> 緯度 **北緯 ${data.lat}**\n> 約位在 **${relPos.g}政府${relPos.b}方 ${Math.round(relPos.d * 100) / 100} 公里**` },
              { name: "預估震度", value: `${max.int >= 7 ? "**> 🏚️ 此地震可能會造成災害，勿驚慌、趴下、掩護、穩住。**" : data.magnitude >= 5.5 ? "**> 🚸 本次搖晃可能較多地區有感，請小心自身周邊安全。**" : ""}\n${Object.keys(maxAll).map(k => ({ text: `${k} **${maxAll[k].intString}**`, pga: maxAll[k].pga })).sort((a, b) => b.pga - a.pga).map(v => v.text).join("\n")}` },
            ],
          )
          .setImage("https://upload.cc/i1/2022/11/30/6DOluI.png")
          .setFooter({ text: "交通部中央氣象局", iconURL: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/ROC_Central_Weather_Bureau.svg/1200px-ROC_Central_Weather_Bureau.svg.png" }).setFooter({ text: `發布於 ${pt.getHours() < 10 ? "0" : ""}${pt.getHours()}:${pt.getMinutes() < 10 ? "0" : ""}${pt.getMinutes()}:${pt.getSeconds() < 10 ? "0" : ""}${pt.getSeconds()}` })
          .setTimestamp();

        if (data.type == "Alert") {
          eewchannels.forEach(async v => {
            try {
              isMessageAllSent[data.id] = false;

              /**
               * @type {import("discord.js").TextChannel}
               */
              const ch = client.channels.cache.get(v[0]);

              if (ch) {
                const sent = await ch.send({ content: `⚠ 強震即時警報 ${v[1] ? ch.guild.roles.cache.get(v[1]) : ""}`, embeds: [embed], ...(v[1] ? { allowedMentions: { roles: [v[1]] }, parse: ["roles"] } : {}) }).catch((e) => logger.error(`無法發送速報 #${client.channels.cache.get(v[0]).name} ${v[0]} ${e}`));
                ongoingMsgIds[data.id] ??= [];
                ongoingMsgIds[data.id].push(sent);
              }
            } catch (err) {
              console.error(err);
            }
          });
          isMessageAllSent[data.id] = true;
        } else if (data.type == "Update") {
          while (true)
            if (isMessageAllSent[data.id]) {
              ongoingMsgIds[data.id].forEach(async m => {
                try {
                  await m.edit({ embeds: [embed] });
                } catch (err) {
                  console.error(err);
                }
              });
              break;
            }
        }
      });
    } catch (e) {
      if (!e.message.startsWith("Unexpected token"))
        console.error(e);
    }
  },
};

const gov = {
  新北市 : [25.012237110305012, 121.46554242078619],
  高雄市 : [22.621174886556354, 120.31179463854724],
  臺中市 : [24.161830990964003, 120.64686265021332],
  臺北市 : [25.037539431241900, 121.56442807553141],
  桃園縣 : [24.992903262814142, 121.30105700649230],
  臺南市 : [22.992215332700230, 120.18502754419917],
  彰化縣 : [24.075555838608253, 120.54450599226247],
  屏東縣 : [22.683024233681977, 120.48791425466109],
  雲林縣 : [23.699223405254763, 120.52632890427346],
  苗栗縣 : [24.564840342079552, 120.82074102555394],
  嘉義縣 : [23.458817458558897, 120.29281199733045],
  新竹縣 : [24.826849972216451, 121.01290369735855],
  南投縣 : [23.902639949799163, 120.69050909733934],
  宜蘭縣 : [24.730714284115326, 121.76310566852065],
  新竹市 : [24.806721959909336, 120.96896621279882],
  基隆市 : [25.131783970754260, 121.74445819736491],
  花蓮縣 : [23.991330632393886, 121.61981036948745],
  嘉義市 : [23.481245850575352, 120.45358694928314],
  臺東縣 : [22.755575135655306, 121.15033782296055],
  金門縣 : [24.436893075221580, 118.31870465676900],
  澎湖縣 : [23.570004104100342, 119.56638097986993],
  連江縣 : [26.157798573764861, 119.95192319072953],
};

function calRelative(lon, lat) {
  distances = Object.keys(gov).map(k => caldistance({ lat: gov[k][0], lon: gov[k][1] }, { lat, lon }));
  const d = Math.min(...distances);
  const g = Object.keys(gov)[distances.indexOf(d)];
  const bd = calBearing(gov[g][0], gov[g][1], lat, lon);
  const b = getBearing(bd);
  return { g, b, d };
}

function caldistance({ lat: lat1, lon: lon1 }, { lat: lat2, lon: lon2 }) {
  const p = 0.017453292519943295;
  const c = Math.cos;
  const a = 0.5 - c((lat2 - lat1) * p) / 2
            + c(lat1 * p) * c(lat2 * p)
            * (1 - c((lon2 - lon1) * p)) / 2;

  return 12742 * Math.asin(Math.sqrt(a));
}

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

/**
 * @param {number[]} distance
 * @param {number} magnitude
 * @param {number} depth
 */
/*
function calIntensity(distance, magnitude, depth) {
	const PGAs = distance.map(v => PGA(magnitude, v, depth));
	return PGAs.map((v, index) => {
		const value = intenses[0.8, 2.5, 8.0, 25, 80, 140, 250, 440, 800, v].sort((a, b) => a - b).indexOf(v);
		return { pos: Object.keys(gov)[index], value, pga: v, label: intensesTW[value] };
	});
}
*/
function pgaToIntensity(pga) {
  return [
    0.8,
    2.5,
    8.0,
    25,
    80,
    140,
    250,
    440,
    800,
    pga,
  ].sort((a, b) => a - b).indexOf(pga);
}

function intensityToString(intensity) {
  return intensesTW[intensity];
}

function calBearing(startLat, startLng, destLat, destLng) {
  startLat = toRadians(startLat);
  startLng = toRadians(startLng);
  destLat = toRadians(destLat);
  destLng = toRadians(destLng);

  const y = Math.sin(destLng - startLng) * Math.cos(destLat);
  const x = Math.cos(startLat) * Math.sin(destLat)
		- Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);
  let brng = Math.atan2(y, x);
  brng = toDegrees(brng);
  return (brng + 360) % 360;
}

const bears = [
  "北",
  "北北東",
  "東北",
  "東北東",
  "東",
  "東南東",
  "東南",
  "南南東",
  "南",
  "南南西",
  "西南",
  "西南西",
  "西",
  "西北西",
  "西北",
  "北北西",
  "北",
];

function getBearing(degree) {
  let deg = [
    // 0 北
    11.25,
    // 1 北北東
    33.75,
    // 2 東北
    56.25,
    // 3 東北東
    78.75,
    // 4 東
    101.25,
    // 5 東南東
    123.75,
    // 6 東南
    146.25,
    // 7 南南東
    168.75,
    // 8 南
    191.25,
    // 9 南南西
    213.75,
    // 10 西南
    236.25,
    // 11 西南西
    258.75,
    // 12 西
    281.25,
    // 13 西北西
    303.75,
    // 14 西北
    326.25,
    // 15 北北西
    348.75,
    // 16 北
  ];
  deg.push(degree);
  deg = deg.sort((a, b) => a - b);
  return bears[deg.indexOf(degree)];
}


function toRadians(degrees) {
  return degrees * Math.PI / 180;
}

function toDegrees(radians) {
  return radians * 180 / Math.PI;
}

/**
* @typedef {object} event
* @property {string} topic
* @property {data[]} data
*/

/**
* @typedef {object} data
* @property {string} id
* @property {number} no
* @property {string} type
* @property {string} originTime
* @property {number} magnitude
* @property {number} depth
* @property {number} lat
* @property {number} lon
*/

const getNearest = (expected) => {
  const all = [];
  for (const city in expected)
    for (const town in expected[city])
      all.push(expected[city][town]);
  return all.sort((a, b) => a.distance - b.distance)[0];
};

const getAllMaxIntensity = (expected) => {
  const all = {};

  for (const city in expected) {
    all[city] ??= [];
    for (const town in expected[city])
      all[city].push(expected[city][town]);
    all[city] = all[city].sort((a, b) => b.pga - a.pga)[0];
  }

  return all;
};

const getMaxIntensity = (expected) => {
  const all = [];
  for (const city in expected)
    for (const town in expected[city])
      all.push(expected[city][town]);
  return all.sort((a, b) => b.pga - a.pga)[0];
};

const twoSideDistance = (side1, side2) => (side1 ** 2 + side2 ** 2) ** 0.5;

const pga = (magnitde, distance, siteEffect = 1) => (1.657 * Math.exp(1.533 * magnitde) * (distance ** -1.607) * siteEffect).toFixed(3);
