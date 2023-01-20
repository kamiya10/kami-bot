const { AttachmentBuilder, Message } = require("discord.js");
const fetch = require("node-fetch").default;
const formatEarthquake = require("../Functions/formatEarthquake");
const logger = require("../Core/logger");

module.exports = {
  name  : "newEarthquake_S",
  event : "newEarthquake_S",
  once  : false,

  /**
   * @param {import("discord.js").Client<boolean>} client
   * @param {Earthquake} Earthquake
   */
  async execute(client, Earthquake) {
    logger.debug(`${this.name} triggered`);

    // check image is accessable
    await new Promise((resolve) => {
      const time = new Date(Earthquake.EarthquakeInfo.OriginTime);
      const timecode = ""
				+ time.getFullYear()
				+ (time.getMonth() + 1 < 10 ? "0" : "") + (time.getMonth() + 1)
				+ (time.getDate() < 10 ? "0" : "") + time.getDate()
				+ (time.getHours() < 10 ? "0" : "") + time.getHours()
				+ (time.getMinutes() < 10 ? "0" : "") + time.getMinutes()
				+ (time.getSeconds() < 10 ? "0" : "") + time.getSeconds();
      const cwb_image
        = "https://www.cwb.gov.tw/Data/earthquake/img/EC"
        + (Earthquake.EarthquakeNo % 1000 == 0 ? "L" : "")
        + (Earthquake.EarthquakeNo % 1000 == 0 ? timecode : timecode.slice(4, timecode.length - 2))
        + (Earthquake.EarthquakeInfo.EarthquakeMagnitude.MagnitudeValue * 10)
        + (Earthquake.EarthquakeNo % 1000 == 0 ? "" : Earthquake.EarthquakeNo.toString().substring(3))
        + "_H.png";

      const checker = async () => {
        await fetch(cwb_image, { method: "GET" }).then(async res => {
          if (res.ok) {
            const buf = await res.buffer();

            if (buf.byteLength > 0) {

              /**
               * @type {Message}
               */
              const sent = await client.channels.cache.get("986968207111909427").send({ files: [new AttachmentBuilder().setFile(buf)] });
              Earthquake.cwb_image = sent.attachments.first().url;
              resolve(true);
            }

          } else {
            setTimeout(() => checker(), 8000);
          }
        }).catch(() => setTimeout(() => checker(), 2000));
      };

      checker();
    });

    const GuildSetting = client.database.GuildDatabase.getAll([
      "quake_channel",
      "quake_small",
      "quake_style",
    ]);
    const channels = Object.keys(GuildSetting).filter(v => (GuildSetting[v].quake_channel != null) && GuildSetting[v].quake_small).map(v => [GuildSetting[v].quake_channel, GuildSetting[v].quake_style]);

    if (channels?.length)
      channels.forEach(ch => {
        try {
          client.channels.cache.get(ch[0])?.send(formatEarthquake(Earthquake, ch[1])).catch(() => void 0);
        } catch (e) {
          console.error(e);
        }
      });
  },
};