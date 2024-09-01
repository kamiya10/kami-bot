import { Logger } from "@/classes/logger";
import { buildEarthquakeReportMessage } from "@/classes/utils";

import type { EarthquakeReport } from "@/api/cwa";
import type { KamiEventListener } from "@/events";

const name = "report";

export default {
  name: "report",
  on(report: EarthquakeReport) {
    Logger.info("newReport", report);

    this.database.guild.forEach(guild => {
      const list = guild.earthquake.report.slice(0, 5);

      for (const setting of list) {
        const channel = this.channels.cache.get(setting.channelId);

        if (!channel || !channel.isTextBased()) continue;

        void channel
          .send(buildEarthquakeReportMessage(report, "cwa-simple"))
          .catch((e) => Logger.error(`${e}`, e));
      }
    });
  },
} as KamiEventListener<typeof name>;
