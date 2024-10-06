import {
  ExpTechApi,
  ExpTechWebsocket,
  SupportedService,
  WebSocketEvent,
} from '@exptechtw/api-wrapper';
import { Collection } from 'discord.js';
import { CwaApi } from '@/api/cwa';
import { join } from 'path';

import type { CwaFetchError, EarthquakeReport } from '@/api/cwa';
import type { KamiClient } from '@/class/client';
import type { Station } from '@exptechtw/api-wrapper';
import logger from 'logger';

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
  public exptech: ExpTechWebsocket | null;
  public data: {
    stations: Record<string, Station> | null;
  } = { stations: null };

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
    const updateReport = () => {
      void cwa.getEarthquakeReport().then((v) => {
        if (!v.length) {
          return;
        }

        if (
          this.report.length
          && this.report[0].EarthquakeInfo.OriginTime
          != v[0].EarthquakeInfo.OriginTime
        ) {
          this.client.emit('report', v[0]);
        }

        this.report = v;
      }).catch((e: CwaFetchError) => {
        if (e.response.status != 429) throw e;
      });

      void cwa.getNumberedEarthquakeReport().then((v) => {
        if (!v.length) {
          return;
        }

        if (
          this.numberedReport.length
          && this.numberedReport[0].EarthquakeInfo.OriginTime
          != v[0].EarthquakeInfo.OriginTime
        ) {
          this.client.emit('report', v[0]);
        }

        this.numberedReport = v;
      }).catch((e: CwaFetchError) => {
        if (e.response.status != 429) throw e;
      });
    };

    const updateRtsStation = () => {
      void new ExpTechApi().getStations().then((v) => {
        this.data.stations = v;
      });
    };

    updateReport();
    setInterval(updateReport, 10_000);

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
