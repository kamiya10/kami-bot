import { KamiListener } from "../classes/listener";
import { Logger } from "../classes/logger";
import type { KamiClient } from "../classes/client";
import type { Rts } from "@exptechtw/api-wrapper";
import { Collection, EmbedBuilder, type Message } from "discord.js";

import _codeTable from "@/resources/town_code.json";

type Location = {
  city: string;
  town: string;
  lat: number;
  lng: number;
};

const codeTable = _codeTable as Record<string, Location>;

const rtsCache = {
  embed: new EmbedBuilder(),
  message: new Collection<string, Message<true> | Promise<unknown>>(),
};

const intensityText = [
  "０級",
  "１級",
  "２級",
  "３級",
  "４級",
  "５弱",
  "５強",
  "６弱",
  "６強",
  "７級",
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

export const build = (client: KamiClient): KamiListener => new KamiListener("report")
  .on("rts", (rts: Rts) => {
    Logger.info("rts", rts);

    if (!client.states.data.stations) {
      Logger.warn("Skipping rts event as station data hasn't been fetched");
      return;
    }

    /**
     * alias of `client.states.data.stations`
     */
    const stations = client.states.data.stations;

    const townIntensityTable = Object.entries(rts.station)
      .filter(v => v[1].I < 0)
      .reduce<Record<number, number>>(
        (acc, pair) => {
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

    client.database.guild.forEach(guild => {
      const rps = guild.earthquake.rts;

      if (!rps.channelId) {
        return;
      }

      const channel = client.channels.cache.get(rps.channelId);

      if (!channel || !channel.isTextBased() || channel.isDMBased()) {
        rps.channelId = null;
        return;
      }

      if (rtsCache.message.has(rps.channelId)) {
        const message = rtsCache.message.get(rps.channelId);

        if (!message) {
          rtsCache.message.set(rps.channelId, channel
            .send({ embeds: [rtsCache.embed] })
            .then(m => rtsCache.message.set(rps.channelId!, m))
            .catch((e) => Logger.error(e)));
          return;
        }

        if (message instanceof Promise) {
          return;
        }

        void message.edit({ embeds: [rtsCache.embed] });
      }
    });
  });
