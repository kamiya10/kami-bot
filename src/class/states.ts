import {
  ExpTechApi,
  ExpTechWebsocket,
  SupportedService,
  WebSocketEvent,
} from '@exptechtw/api-wrapper';
import { CwaApi, CwaFetchError } from '@/api/cwa';
import { Collection } from 'discord.js';
import { join } from 'path';

import logger from 'logger';

import type { EarthquakeReport } from '@/api/cwa';
import type { KamiClient } from '@/class/client';
import type { Station } from '@exptechtw/api-wrapper';
import type { Advisory, AdvisoryRecord } from '@/api/cwa/advisory';

const cwa = new CwaApi(process.env['CWA_TOKEN']);

interface KamiVoiceState {
  creatorId: string;
  categoryId: string | null;
  ownerId: string;
  defaultOptions: {
    name: string;
    bitrate: number;
    limit: number;
    region: string | null;
  };
}

export interface KamiStatesOptions {
  voice: Collection<string, KamiVoiceState>;
}

export class KamiStates {
  public client: KamiClient;
  public voice: Collection<string, KamiVoiceState>;
  public report: EarthquakeReport[] = [];
  public numberedReport: EarthquakeReport[] = [];
  public weatherAdvisory: Partial<AdvisoryRecord> = {};
  public exptech: ExpTechWebsocket | null;
  public data: {
    stations: Record<string, Station> | null;
  } = { stations: null };

  private _advisoryInited = false;

  constructor(client: KamiClient, data?: KamiStatesOptions) {
    this.client = client;
    this.voice = new Collection(data?.voice);

    if (process.env['EXPTECH_TOKEN']) {
      this.exptech = new ExpTechWebsocket({
        key: process.env['EXPTECH_TOKEN'],
        service: [SupportedService.RealtimeStation, SupportedService.Eew],
      });
    }
    else {
      this.exptech = null;
      logger.warn(
        'Launching without ExpTech WebSocket, some functionallity will not work. (affected: rts, eew)',
      );
    }

    this.setup();
  }

  private setup() {
    const updateCwa = () => {
      const onrejected = (e: Error) => {
        if (e instanceof CwaFetchError)
          if (e.response.status == 429) return void e;
        logger.error(`${e}`, e);
      };

      void cwa
        .getEarthquakeReport()
        .then((v) => {
          if (!v.length) return;

          if (
            this.report.length
            && this.report[0].EarthquakeInfo.OriginTime
            != v[0].EarthquakeInfo.OriginTime
          ) {
            const times = this.numberedReport.map(
              (e) => e.EarthquakeInfo.OriginTime,
            );
            const updated = v.filter(
              (e) => !times.includes(e.EarthquakeInfo.OriginTime),
            );
            if (updated.length) {
              this.client.emit('report', updated);
            }
          }

          this.report = v;
        })
        .catch(onrejected);

      void cwa
        .getNumberedEarthquakeReport()
        .then((v) => {
          if (!v.length) return;

          if (
            this.numberedReport.length
            && this.numberedReport[0].EarthquakeInfo.OriginTime
            != v[0].EarthquakeInfo.OriginTime
          ) {
            const times = this.numberedReport.map(
              (e) => e.EarthquakeInfo.OriginTime,
            );
            const updated = v.filter(
              (e) => !times.includes(e.EarthquakeInfo.OriginTime),
            );
            if (updated.length) {
              this.client.emit('report', updated);
            }
          }

          this.numberedReport = v;
        })
        .catch(onrejected);

      void cwa
        .getAdvisory()
        .then((v) => {
          const keys = Object.keys(v) as (keyof AdvisoryRecord)[];
          const updated: Advisory[] = [];

          for (const key of keys) {
            const data = v[key];
            if (!data) continue;

            const old = this.weatherAdvisory[key];

            if (!old || data.hash != old.hash) {
              updated.push(data);
            }
          }

          if (this._advisoryInited && updated.length) {
            this.client.emit('weatherAdvisory', updated);
          }

          this.weatherAdvisory = v;
          this._advisoryInited = true;
        })
        .catch(onrejected);
    };

    const updateRtsStation = () => {
      void new ExpTechApi().getStations().then((v) => {
        this.data.stations = v;
      });
    };

    updateCwa();
    setInterval(updateCwa, 15_000);

    updateRtsStation();
    setInterval(updateRtsStation, 600_000);

    if (this.exptech) {
      this.exptech.on(WebSocketEvent.Rts, (rts) => {
        const entries = Object.entries(rts.station);

        let alertCount = 0;

        for (const [, data] of entries) {
          if (data.alert) {
            alertCount++;
          }
        }

        if (alertCount < 2) {
          return;
        }

        this.client.emit('rts', rts);
      });
    }
  }

  async save() {
    logger.info('Saving states...');

    const file = Bun.file(join(this.client.cacheDirectory, 'states.json'));

    try {
      await Bun.write(file, JSON.stringify(this.toJSON()));
    }
    catch (error) {
      logger.error(`Error while saving states:`, error);
      logger.warn(
        'States within this session will be lost when the session ends.',
      );
    }
  }

  toJSON() {
    return {
      voice: [...this.voice.entries()],
    };
  }
}
