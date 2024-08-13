import { existsSync, mkdirSync } from "fs";
import { join } from "path";
import { writeFile } from "fs/promises";

import {
  ExpTechApi,
  ExpTechWebsocket,
  type Station,
  SupportedService,
  WebSocketEvent,
} from "@exptechtw/api-wrapper";
import { Collection } from "discord.js";

import { CwaApi, type EarthquakeReport } from "@/api/cwa";
import type { KamiClient } from "@/classes/client";
import { Logger } from "@/classes/logger";

const cwa = new CwaApi(process.env["CWA_TOKEN"]);

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

    if (process.env["EXPTECH_TOKEN"]) {
      this.exptech = new ExpTechWebsocket({
        key: process.env["EXPTECH_TOKEN"],
        service: [SupportedService.RealtimeStation, SupportedService.Eew],
      });
    } else {
      this.exptech = null;
      Logger.warn(
        "Launching without ExpTech WebSocket, some functionallity will not work. (affected: rts, eew)"
      );
    }

    this.setup();
  }

  private setup() {
    setInterval(() => {
      void cwa.getEarthquakeReport().then((v) => {
        if (!v.length) {
          return;
        }

        if (
          this.report.length &&
          this.report[0].EarthquakeInfo.OriginTime !=
            v[0].EarthquakeInfo.OriginTime
        ) {
          this.client.emit("report", v[0]);
        }

        this.report = v;
      });

      void cwa.getNumberedEarthquakeReport().then((v) => {
        if (!v.length) {
          return;
        }

        if (
          this.numberedReport.length &&
          this.numberedReport[0].EarthquakeInfo.OriginTime !=
            v[0].EarthquakeInfo.OriginTime
        ) {
          this.client.emit("report", v[0]);
        }

        this.numberedReport = v;
      });
    }, 1000);

    setInterval(() => {
      void new ExpTechApi().getStations().then((v) => {
        this.data.stations = v;
      });
    }, 5_000);

    if (this.exptech) {
      this.exptech.on(WebSocketEvent.Rts, (rts) => {
        const entries = Object.entries(rts.station);

        let alertCount = 0;

        for (let index = 0; index < entries.length; index++) {
          const [, data] = entries[index];
          if (data.alert) {
            alertCount++;
          }
        }

        if (alertCount < 2) {
          return;
        }

        this.client.emit("rts", rts);
      });
    }
  }

  async save() {
    Logger.info("Saving states...");

    try {
      if (!existsSync("./.cache")) {
        mkdirSync("./.cache");
      }

      await writeFile(
        join("./.cache", "states.json"),
        JSON.stringify(this.toJSON()),
        { encoding: "utf-8" }
      );
    } catch (error) {
      Logger.error(error);
      Logger.warn("States within this session is not saved.");
    }
  }

  toJSON() {
    return {
      voice: [...this.voice.entries()],
    };
  }
}
