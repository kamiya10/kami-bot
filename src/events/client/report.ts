import { Events } from "@/classes/client";
import { Logger } from "@/classes/logger";
import { buildEarthquakeReportMessage } from "@/classes/utils";

import type { KamiEventListener } from "@/events";

const name = Events.Report;

export default {
  name,
  on(report) {
    Logger.info("newReport", report);

    this.database.guild.forEach((guild) => {
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
