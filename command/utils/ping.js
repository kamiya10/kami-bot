const Discord = require("discord.js");
const functions = require("../../function/loader");

/**
 *
 * @param {Discord.Message} message
 * @param {number} heartbeat
 * @returns
 */
async function ping(message, heartbeat, client) {

	try {
		functions.log.command(message, client, ping.prop.name);
		const latency = Date.now() - message.createdTimestamp;
		const latencyAPI = Math.round(heartbeat);
		const status = latency >= 1000 ? "❌" : latency >= 600 ? "🔴" : latency >= 300 ? "🟠" : latency >= 150 ? "🟡" : "🟢";
		const statusAPI = latencyAPI >= 2000 ? "❌" : latencyAPI >= 1000 ? "🔴" : latencyAPI >= 500 ? "🟠" : latencyAPI >= 250 ? "🟡" : "🟢";

		const roundtripMessage = await message.reply("Pong!", { allowedMentions: { repliedUser: false } });
		const roundtrip = roundtripMessage.createdTimestamp - message.createdTimestamp;
		const statusTrip = roundtrip >= 1000 ? "❌" : roundtrip >= 600 ? "🔴" : roundtrip >= 300 ? "🟠" : roundtrip >= 150 ? "🟡" : "🟢";
		const embed = new Discord.MessageEmbed()
			.setColor(getColorForPercentage(Math.abs(((latency+latencyAPI+roundtrip)/3)/750)))
			.setDescription(`🛫 ${statusTrip} 一圈 **${roundtrip}ms**\n🕛 ${status} 延遲 **${latency}ms**\n💓 ${statusAPI} 心跳 **${latencyAPI}ms**`);
		await roundtripMessage.edit(embed);
		return;
	} catch(e) {
		await message.reply(`發生了預料外的錯誤 \`${e.toString()}\``);
		return console.error(e);
	}
}
ping.prop = {
	name  : "ping",
	desc  : "測試機器人延遲",
	args  : [],
	exam  : [""],
	guild : false
};
module.exports = ping;

const percentColors = [
	{ pct: 0.0, color: { r: 0x00, g: 0xff, b: 0 } },
	{ pct: 0.5, color: { r: 0xff, g: 0xff, b: 0 } },
	{ pct: 1.0, color: { r: 0xff, g: 0x00, b: 0 } } ];

const getColorForPercentage = function (pct) {
	console.log(pct);
	if (pct > 1) return "#ff0000";
	// eslint-disable-next-line no-var
	for (var i = 1; i < percentColors.length - 1; i++)
		if (pct < percentColors[i].pct)
			break;

	const lower = percentColors[i - 1];
	const upper = percentColors[i];
	const range = upper.pct - lower.pct;
	const rangePct = (pct - lower.pct) / range;
	const pctLower = 1 - rangePct;
	const pctUpper = rangePct;
	const color = {
		r : Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper),
		g : Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper),
		b : Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper)
	};
	function hexColour(c) {
		if (c < 256) {
			let output = Math.abs(c).toString(16);
			if (output.length == 1) output = "0" + output;
			return output;
		}
		return 0;
	}
	return "#" + hexColour(color.r) + hexColour(color.g) + hexColour(color.b);
};