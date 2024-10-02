import { EventHandler } from '@/class/event';
import { buildEarthquakeReportMessage } from '@/class/utils';
import { eqReportChannel } from '@/database/schema';
import { inArray } from 'drizzle-orm';

import logger from 'logger';

export default new EventHandler({
  event: 'report',
  async on(report) {
    logger.info('newReport', report);

    const settings = await this.database.query.eqReportChannel.findMany();
    const failed: string[] = [];

    for (const setting of settings) {
      const channel = this.channels.cache.get(setting.channelId);

      if (!channel?.isSendable()) {
        failed.push(setting.channelId);
        continue;
      }

      void channel
        .send(buildEarthquakeReportMessage(report, 'cwa-simple'))
        .catch((e) => logger.error(`${e}`, e));
    }

    await this.database.delete(eqReportChannel)
      .where(inArray(eqReportChannel.channelId, failed));
  },
});
