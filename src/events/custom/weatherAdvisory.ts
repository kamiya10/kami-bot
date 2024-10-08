import { WeatherAdvisoryMessageStyle, buildWeatherAdvisoryMessage } from '@/utils/weatherAdvisory';
import { EventHandler } from '@/class/event';
import { guildEqReportChannel } from '@/database/schema';
import { inArray } from 'drizzle-orm';

import logger from 'logger';

export default new EventHandler({
  event: 'weatherAdvisory',
  async on(updated) {
    logger.info('weatherAdvisory', updated);

    const settings = await this.database.query.guildWeatherAdvisoryChannel.findMany();
    const failed: string[] = [];

    for (const setting of settings) {
      const channel = this.channels.cache.get(setting.channelId);

      if (!channel?.isSendable()) {
        failed.push(setting.channelId);
        continue;
      }

      for (const wa of updated) {
        void channel
          .send(buildWeatherAdvisoryMessage(wa, WeatherAdvisoryMessageStyle.Simple))
          .catch((e) => logger.error(`${e}`, e));
      }
    }

    await this.database
      .delete(guildEqReportChannel)
      .where(inArray(guildEqReportChannel.channelId, failed));
  },
});
