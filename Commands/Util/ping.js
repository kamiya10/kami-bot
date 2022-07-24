module.exports.run = async (CommandEvent) => {
	try {
		const interval = CommandEvent.isInteraction
			? CommandEvent.command.options.getInteger("間隔") != null
				? CommandEvent.command.options.getInteger("間隔") * 1000
				: 2000
			: 2000;
		const attempt = CommandEvent.isInteraction
			? CommandEvent.command.options.getInteger("次數") != null
				? CommandEvent.command.options.getInteger("次數")
				: 10
			: 10;

		if (interval > 10000 || interval < 1000) throw "ERR_INVAILD_PARAMETER@INTERVAL";
		if (attempt > 10 || attempt < 1) throw "ERR_INVAILD_PARAMETER@ATTEMPT";

		const times = [CommandEvent.mi.createdTimestamp];
		const latencytimes = [];
		const roundtriptimes = [];
		const heartbeattimes = [];
		const roundtripMessage = CommandEvent.isInteraction
			? await CommandEvent.mi.editReply({ content: "很痛不要敲啦 .·´¯\\`(>▂<)´¯\\`·. ", fetchReply: true })
			: await CommandEvent.mi.reply({ content: "很痛不要敲啦 .·´¯\\`(>▂<)´¯\\`·. ", fetchReply: true });
		times.push(roundtripMessage.createdTimestamp);

		for (let i = 0; i < attempt; i++) {
			const roundtrip = Math.abs(times[i + 1] - times[i] - (interval * ((i < 2) ? 0 : 1)));
			roundtriptimes.push(roundtrip);

			const latency = Math.abs(Date.now() - times[i] - (interval * ((i < 1) ? 0 : (i < 2) ? 1 : 2)));
			latencytimes.push(latency);

			const latencyAPI = Math.round(roundtripMessage.client.ws.ping);
			heartbeattimes.push(latencyAPI);

			const status = latency >= 1000 ? "❌" : latency >= 600 ? "🔴" : latency >= 300 ? "🟠" : latency >= 150 ? "🟡" : "🟢";
			const statusAPI = latencyAPI >= 2000 ? "❌" : latencyAPI >= 1000 ? "🔴" : latencyAPI >= 500 ? "🟠" : latencyAPI >= 250 ? "🟡" : "🟢";
			const statusTrip = roundtrip >= 1000 ? "❌" : roundtrip >= 600 ? "🔴" : roundtrip >= 300 ? "🟠" : roundtrip >= 150 ? "🟡" : "🟢";

			const a1 = roundtriptimes.map(String);
			const static1 = maxMinAvg(roundtriptimes);
			a1.push(`**${a1.pop()}**`);
			const a2 = latencytimes.map(String);
			const static2 = maxMinAvg(latencytimes);
			a2.push(`**${a2.pop()}**`);
			const a3 = heartbeattimes.map(String);
			const static3 = maxMinAvg(heartbeattimes);
			a3.push(`**${a3.pop()}**`);

			const embed = new Discord.MessageEmbed()
				.setColor(getColorForPercentage(Math.abs(((latency + latencyAPI + roundtrip) / 3) / 750)))
				.setTitle("⏳ 延遲測量")
				.setDescription(`測量 \`${attempt}\`次，每次間隔 \`${interval / 1000}\` 秒`)
				.addField("目前", `🛫 ${statusTrip} 一圈 **${roundtrip}ms**\n🕛 ${status} 延遲 **${latency}ms**\n💓 ${statusAPI} 心跳 **${latencyAPI}ms**`);

			if (attempt > 1)
				embed
					.addField("一圈 (Roundtrip)", a1.join(" | ") + " (ms)" + `\n最低: **${static1[0]}ms** | 最高: **${static1[1]}ms** | 平均: **${static1[2]}ms**`)
					.addField("延遲 (Latency)", a2.join(" | ") + " (ms)" + `\n最低: **${static2[0]}ms** | 最高: **${static2[1]}ms** | 平均: **${static2[2]}ms**`)
					.addField("心跳 (API Heartbeat)", a3.join(" | ") + " (ms)" + `\n最低: **${static3[0]}ms** | 最高: **${static3[1]}ms** | 平均: **${static3[2]}ms**`)
					.setTimestamp();

			if (i < attempt - 1 && attempt > 1)
				embed.setFooter("測量中...");
			else
				embed.setFooter("已停止測量");

			const edited = CommandEvent.isInteraction
				? await CommandEvent.mi.editReply({ content: "很痛不要敲啦 .·´¯`(>▂<)´¯`·. ", embeds: [embed] })
				: await roundtripMessage.edit({ content: "很痛不要敲啦 .·´¯`(>▂<)´¯`·. ", embeds: [embed] });

			times.push(edited.editedTimestamp);
			await new Promise(r => setTimeout(r, interval));
		}
		return;
	} catch (e) {
		let embed;
		if (e == "ERR_INVAILD_PARAMETER@INTERVAL")
			embed = new Discord.MessageEmbed()
				.setColor(CommandEvent.client.colors.error)
				.setTitle(CommandEvent.client.embedStat.error)
				.setDescription("測量間隔必須介於 1 ~ 10")
				.setFooter(e);

		if (e == "ERR_INVAILD_PARAMETER@ATTEMPT")
			embed = new Discord.MessageEmbed()
				.setColor(CommandEvent.client.colors.error)
				.setTitle(CommandEvent.client.embedStat.error)
				.setDescription("測量次數必須介於 1 ~ 10")
				.setFooter(e);

		if (!embed) {
			embed = new Discord.MessageEmbed()
				.setColor(CommandEvent.client.colors.error)
				.setTitle(CommandEvent.client.embedStat.error)
				.setDescription(`發生了預料之外的錯誤：\`${e.toString()}\``)
				.setFooter("ERR_UNCAUGHT_EXCEPTION");
			console.error(e);
		}

		CommandEvent.isInteraction
			? await CommandEvent.mi.editReply({ embeds: [embed], allowedMentions: { repliedUser: true } }).catch(() => {})
			: await CommandEvent.mi.reply({ embeds: [embed], allowedMentions: { repliedUser: true } }).catch(() => {});
		return;
	}
};

module.exports.help = {
	name    : "ping",
	desc    : "敲機器人",
	options : [
		{
			name        : "次數",
			description : "測量次數，最多 10 次",
			type        : "INTEGER",
			required    : false
		},
		{
			name        : "間隔",
			description : "每次測量的間隔，最長 10 秒，單位：秒",
			type        : "INTEGER",
			required    : false
		}
	],
	exam: [ "", "/`次數:`3 `間隔:`10" ]
};

const percentColors = [
	{ pct: 0.0, color: { r: 0x00, g: 0xff, b: 0 } },
	{ pct: 0.5, color: { r: 0xff, g: 0xff, b: 0 } },
	{ pct: 1.0, color: { r: 0xff, g: 0x00, b: 0 } } ];

const getColorForPercentage = function (pct) {
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

function maxMinAvg(arr) {
	let max = arr[0];
	let min = arr[0];
	let sum = arr[0];
	if (arr.length > 1)
		for (let i = 1; i < arr.length; i++) {
			if (arr[i] > max)
				max = arr[i];

			if (arr[i] < min)
				min = arr[i];

			sum = sum + arr[i];
		}
	return [ min, max, Math.round(sum / arr.length) ];
}