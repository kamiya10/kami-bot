const { Colors, EmbedBuilder } = require("discord.js");
const logger = require("../Core/logger");
let distances;
const ongoingMsgids = {};
const magnitudeTW = ["極微", "極微", "微小", "微小", "輕微", "中等", "強烈", "重大", "極大"];
const magnitudeE = ["\\⚫", "\\⚫", "\\⚪", "\\🔵", "\\🟢", "\\🟡", "\\🟠", "\\🔴", "\\🛑"];
const depthTW = ["極淺層", "淺層", "中層", "深層"];
const depthE = ["\\🔴", "\\🟠", "\\🟡", "\\🟢"];
module.exports = {
	name  : "eew",
	event : "messageCreate",
	once  : false,
	/**
	 * @param {import("discord.js").Client} client
     * @param {import("discord.js").Message} message The created message
     */
	async execute(client, message) {
		if (message.channelId != "948508570138329098") return;
		try {
		/**
		 * @type {event}
		 */
			const event = JSON.parse(message.content);
			if (event.topic != "CWB_EEW") return;
			logger.debug(`${this.name} triggered`);

			const GuildSetting = await client.database.GuildDatabase.findAll({
				attributes: ["eew_channel", "eew_mention"],
			}).catch(() => void 0);
			const eewchannels = GuildSetting.filter(v => v.eew_channel != null).map(v => [v.eew_channel, v.eew_mention]);
			console.log(eewchannels);

			event.data.forEach(data => {

				const pt = new Date(message.createdTimestamp);
				const et = new Date(data.originTime);
				const relPos = calRelative(data.lon, data.lat);
				const intensity = calIntensity(distances, data.magnitude, data.depth).sort((a, b) => b.pga - a.pga).filter(v => v.value != 0);

				const depth = [30, 70, 300, 700];
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
							{ name: "發生時間", value: `${et.getHours() < 10 ? "0" : ""}${et.getHours()}:${et.getMinutes() < 10 ? "0" : ""}${et.getMinutes()}:${et.getSeconds() < 10 ? "0" : ""}${et.getSeconds()}`, inline: true },
							{ name: "位置", value: `> 經度 **東經 ${data.lon}**\n> 緯度 **北緯 ${data.lat}**\n> 約位在 **${relPos.g}政府${relPos.b}方 ${Math.round(relPos.d * 100) / 100} 公里**` },
							{ name: "預估震度", value: `${intensity[0].value >= 6 ? "**> 🏚️ 此地震可能會造成災害，勿驚慌、趴下、掩護、穩住。**" : data.magnitude >= 5.5 ? "**> 🚸 本次搖晃可能較多地區有感，請小心自身周邊安全。**" : ""}\n${intensity.map(v => `${v.pos}　**${v.label}**`).join("\n")}` },
						],
					)
					.setFooter({ text: "交通部中央氣象局", iconURL: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/ROC_Central_Weather_Bureau.svg/1200px-ROC_Central_Weather_Bureau.svg.png" }).setFooter({ text: `發布於 ${pt.getHours() < 10 ? "0" : ""}${pt.getHours()}:${pt.getMinutes() < 10 ? "0" : ""}${pt.getMinutes()}:${pt.getSeconds() < 10 ? "0" : ""}${pt.getSeconds()}` })
					.setTimestamp();


				if (data.type == "Alert")
					eewchannels.forEach(async v => {
						try {
							const ch = client.channels.cache.get(v[0]);
							if (ch) {
								const sent = await ch.send({ content: `⚠ 強震即時警報 ${v[1] ? ch.guild.roles.cache.get(v[1]) : ""}`, embeds: [embed] }).catch((e) => logger.error(`無法發送速報 ${client.channels.cache.get(v[0])} ${v[0]} ${e}`));
								ongoingMsgids[data.id] ??= [];
								ongoingMsgids[data.id].push(sent);
							}
						} catch (err) {
							console.error(err);
						}
					});
				else if (data.type == "Update")
					ongoingMsgids[data.id].forEach(async m => {
						m.edit({ embeds: [embed] });
					});
			});
		} catch (e) {
			console.error(e);
		}
	},
};

const pos = {
	"新北市" : [25.012237110305012, 121.46554242078619],
	"高雄市" : [22.621174886556354, 120.31179463854724],
	"臺中市" : [24.161830990964003, 120.64686265021332],
	"臺北市" : [25.037539431241900, 121.56442807553141],
	"桃園縣" : [24.992903262814142, 121.30105700649230],
	"臺南市" : [22.992215332700230, 120.18502754419917],
	"彰化縣" : [24.075555838608253, 120.54450599226247],
	"屏東縣" : [22.683024233681977, 120.48791425466109],
	"雲林縣" : [23.699223405254763, 120.52632890427346],
	"苗栗縣" : [24.564840342079552, 120.82074102555394],
	"嘉義縣" : [23.458817458558897, 120.29281199733045],
	"新竹縣" : [24.826849972216451, 121.01290369735855],
	"南投縣" : [23.902639949799163, 120.69050909733934],
	"宜蘭縣" : [24.730714284115326, 121.76310566852065],
	"新竹市" : [24.806721959909336, 120.96896621279882],
	"基隆市" : [25.131783970754260, 121.74445819736491],
	"花蓮縣" : [23.991330632393886, 121.61981036948745],
	"嘉義市" : [23.481245850575352, 120.45358694928314],
	"臺東縣" : [22.755575135655306, 121.15033782296055],
	"金門縣" : [24.436893075221580, 118.31870465676900],
	"澎湖縣" : [23.570004104100342, 119.56638097986993],
	"連江縣" : [26.157798573764861, 119.95192319072953],
};

function calRelative(lon, lat) {
	distances = Object.keys(pos).map(k => caldistance(pos[k][0], pos[k][1], lat, lon));
	const d = Math.min(...distances);
	const g = Object.keys(pos)[distances.indexOf(d)];
	const bd = calBearing(pos[g][0], pos[g][1], lat, lon);
	const b = getBearing(bd);
	return { g, b, d };
}

function caldistance(lat1, lon1, lat2, lon2) {
	const p = 0.017453292519943295;
	const c = Math.cos;
	const a = 0.5 - c((lat2 - lat1) * p) / 2 +
              c(lat1 * p) * c(lat2 * p) *
              (1 - c((lon2 - lon1) * p)) / 2;

	return 12742 * Math.asin(Math.sqrt(a));
}

const intenses = [0, 1, 2, 3, 4, 5, 5.5, 6, 6.5, 7];
const intensesTW = { 0: "\\⚫０級", 1: "\\⚪１級", 2: "\\🔵２級", 3: "\\🟢３級", 4: "\\🟡４級", 5: "\\🟠５弱", 5.5: "\\🟤５強", 6: "\\🔴６弱", 6.5: "\\🟣６強", 7: "\\🛑７級" };
/**
 * @param {number[]} distance
 * @param {number} magnitude
 * @param {number} depth
 */
function calIntensity(distance, magnitude, depth) {
	const PGAs = distance.map(v => PGA(magnitude, v, depth));
	return PGAs.map((v, index) => {
		let i = [0.8, 2.5, 8.0, 25, 80, 140, 250, 440, 800];
		i.push(v);
		i = i.sort((a, b) => a - b);
		const value = intenses[i.indexOf(v)];
		return { pos: Object.keys(pos)[index], value, pga: v, label: intensesTW[value] };
	});
}

function calBearing(startLat, startLng, destLat, destLng) {
	startLat = toRadians(startLat);
	startLng = toRadians(startLng);
	destLat = toRadians(destLat);
	destLng = toRadians(destLng);

	const y = Math.sin(destLng - startLng) * Math.cos(destLat);
	const x = Math.cos(startLat) * Math.sin(destLat) -
		Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);
	let brng = Math.atan2(y, x);
	brng = toDegrees(brng);
	return (brng + 360) % 360;
}

const bears = [	"北", "北北東", "東北", "東北東", "東", "東南東", "東南", "南南東", "南", "南南西", "西南", "西南西", "西", "西北西", "西北", "北北西", "北"];
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

function PGA(magnitude, dist, depth) {
	return 1.657 * Math.exp(1.533 * magnitude) * (((dist ** 2 + depth ** 2) ** (1 / 2)) ** -1.607);
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
