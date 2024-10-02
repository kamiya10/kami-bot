import { Collection, EmbedBuilder } from 'discord.js';
import { EventHandler } from '@/class/event';

import logger from 'logger';
import _codeTable from '@/resources/town_code.json';

import type { Message } from 'discord.js';
import { rtsChannel } from '@/database/schema';
import { inArray } from 'drizzle-orm';

interface Location {
  city: string;
  town: string;
  lat: number;
  lng: number;
}

const codeTable = _codeTable as Record<string, Location>;

const rtsCache = {
  embed: new EmbedBuilder(),
  message: new Collection<string, Message | Promise<unknown>>(),
};

const intensityText = [
  '０級',
  '１級',
  '２級',
  '３級',
  '４級',
  '５弱',
  '５強',
  '６弱',
  '６強',
  '７級',
];

const roundIntensity = (float: number) =>
  float < 0
    ? 0
    : float < 4.5
      ? Math.round(float)
      : float < 5
        ? 5
        : float < 5.5
          ? 6
          : float < 6
            ? 7
            : float < 6.5
              ? 8
              : 9;

export default new EventHandler({
  event: 'rts',
  async on(rts) {
    logger.info('rts', rts);

    if (!this.states.data.stations) {
      logger.warn('Skipping rts event as station data hasn\'t been fetched');
      return;
    }

    /**
     * alias of `client.states.data.stations`
     */
    const stations = this.states.data.stations;

    const townIntensityTable = Object.entries(rts.station)
      .filter((v) => v[1].I < 0)
      .reduce<Record<number, number>>((acc, pair) => {
        if (acc[stations[pair[0]].info[0].code] < pair[1].I) {
          acc[stations[pair[0]].info[0].code] = pair[1].I;
        }

        return acc;
      }, {});

    Object.entries(townIntensityTable)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([code, i]) => {
        const town = codeTable[code];
        return `${town.city} ${town.town} ${intensityText[roundIntensity(i)]}`;
      });

    rtsCache.embed.setFields();

    const settings = await this.database.query.rtsChannel.findMany();
    const failed: string[] = [];

    for (const setting of settings) {
      const channel = this.channels.cache.get(setting.channelId);

      if (!channel?.isSendable()) {
        failed.push(setting.channelId);
        continue;
      }

      if (rtsCache.message.has(setting.channelId)) {
        const message = rtsCache.message.get(setting.channelId);

        if (!message) {
          rtsCache.message.set(
            setting.channelId,
            channel
              .send({ embeds: [rtsCache.embed] })
              .then((m) => rtsCache.message.set(setting.channelId, m))
              .catch((e) => logger.error(`${e}`, e, setting)),
          );
          return;
        }

        if (message instanceof Promise) {
          return;
        }

        void message.edit({ embeds: [rtsCache.embed] });
      }
    }

    await this.database.delete(rtsChannel)
      .where(inArray(rtsChannel.channelId, failed));
  },
});
