import { EventHandler } from '@/class/event';
import { buildEarthquakeReportMessage } from '@/class/utils';

import logger from 'logger';

export default new EventHandler({
  event: 'report',
  on(report) {
    logger.info('newReport', report);

    this.database.guild.forEach((guild) => {
      const list = guild.earthquake.report.slice(0, 5);

      for (const setting of list) {
        const channel = this.channels.cache.get(setting.channelId);

        if (!channel?.isSendable()) continue;

        void channel
          .send(buildEarthquakeReportMessage(report, 'cwa-simple'))
          .catch((e) => logger.error(`${e}`, e));
      }
    });
  },
});
