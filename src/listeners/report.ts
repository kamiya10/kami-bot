import { KamiListener } from "../classes/listener";
import { Logger } from "../classes/logger";
import { buildEarthquakeReportMessage } from "../classes/utils";
import type { EarthquakeReport } from "../api/cwa";
import type { KamiClient } from "../classes/client";

export const build = (client: KamiClient): KamiListener => new KamiListener("report")
  .on("report", (report: EarthquakeReport) => {
    Logger.info("newReport", report);

    client.database.guild.forEach(guild => {
      const list = guild.earthquake.report.slice(0, 5);

      for (const setting of list) {
        const channel = client.channels.cache.get(setting.channelId);

        if (!channel || !channel.isTextBased()) continue;

        void channel
          .send(buildEarthquakeReportMessage(report, "cwa-simple"))
          .catch((e) => Logger.error(e));
      }
    });
  });
