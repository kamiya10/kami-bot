const fetch = require("node-fetch").default;
const formatEarthquake = require("../Functions/formatEarthquake");
const logger = require("../Core/logger");

module.exports = {
	name  : "newEarthquake",
	event : "newEarthquake",
	once  : false,
	/**
    * @param {import("discord.js").Client<boolean>} client
    * @param {Earthquake} earthquake
    */
	async execute(client, earthquake) {
		logger.debug(`${this.name} triggered`);

		// check image is accessable
		await new Promise((resolve) => {
			const time = new Date(earthquake.earthquakeInfo.originTime);
			const timecode = ""
				+ time.getFullYear()
				+ (time.getMonth() + 1 < 10 ? "0" : "") + (time.getMonth() + 1)
				+ (time.getDate() < 10 ? "0" : "") + time.getDate()
				+ (time.getHours() < 10 ? "0" : "") + time.getHours()
				+ (time.getMinutes() < 10 ? "0" : "") + time.getMinutes()
				+ (time.getSeconds() < 10 ? "0" : "") + time.getSeconds();
			const cwb_image =
				"https://www.cwb.gov.tw/Data/earthquake/img/EC"
				+ (earthquake.earthquakeNo == 111000 ? "L" : "")
				+ (earthquake.earthquakeNo == 111000 ? timecode : timecode.slice(4, timecode.length - 2))
				+ (earthquake.earthquakeInfo.magnitude.magnitudeValue * 10)
				+ (earthquake.earthquakeNo == 111000 ? "" : earthquake.earthquakeNo.toString().substring(3))
				+ "_H.png";
			const checker = (retryCount = 0) => {
				fetch(cwb_image, { method: "GET" }).then(async res => {
					if (res.ok) {
						const buf = await res.buffer();
						if (buf.byteLength > 0)
							resolve(true);
					} else setTimeout(checker, 8000, retryCount + 1);
				}).catch(() => setTimeout(checker, 8000, retryCount + 1));
			};

			checker();
		});


		console.log(earthquake);
		const GuildSetting = await client.database.GuildDatabase.findAll({
			attributes: ["quake_channel", "quake_small", "quake_style"],
		}).catch(() => void 0);
		const channels = GuildSetting.filter(v => v.quake_channel != null).map(v => [v.quake_channel, v.quake_style]);
		console.log(channels);
		if (channels?.length)
			channels.forEach(async ch => {
				try {
					await client.channels.cache.get(ch[0])?.send(formatEarthquake(earthquake, ch[1])).catch(() => void 0);
				} catch (e) {
					console.error(e);
				}
			});
	},
};