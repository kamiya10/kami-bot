import { EventHandler } from '@/class/event';
import { buildEarthquakeReportMessage } from '@/class/utils';
import { guildEqReportChannel } from '@/database/schema';
import { inArray } from 'drizzle-orm';

import logger from 'logger';

export default new EventHandler({
  event: 'report',
  async on(report) {
    logger.info('newReport', report);

    const settings = await this.database.query.guildEqReportChannel.findMany();
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

    await this.database
      .delete(guildEqReportChannel)
      .where(inArray(guildEqReportChannel.channelId, failed));
  },
});
