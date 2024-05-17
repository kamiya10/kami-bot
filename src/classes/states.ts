import { existsSync, mkdirSync } from "node:fs";
import { Collection } from "discord.js";
import { Logger } from "./logger";
import { join } from "node:path";
import { writeFile } from "node:fs/promises";
import { CwaApi, type EarthquakeReport } from "../api/cwa";
import type { KamiClient } from "./client";

const cwa = new CwaApi(process.env.CWA_TOKEN);

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
  public report: EarthquakeReport[];
  public numberedReport: EarthquakeReport[];

  constructor(client: KamiClient, data?: KamiStatesOptions) {
    this.client = client;
    this.voice = new Collection(data?.voice);
    this.report = [];
    this.numberedReport = [];

    this.setupTimer();
  }

  private setupTimer() {
    setInterval(() => {
      void cwa.getEarthquakeReport()
        .then(v => {
          if (this.report.length && this.report[0].EarthquakeInfo.OriginTime != v[0].EarthquakeInfo.OriginTime) {
            this.client.emit("report", v[0]);
          }

          this.report = v;
        });

      void cwa.getNumberedEarthquakeReport()
        .then(v => {
          if (this.numberedReport.length && this.numberedReport[0].EarthquakeInfo.OriginTime != v[0].EarthquakeInfo.OriginTime) {
            this.client.emit("report", v[0]);
          }

          this.numberedReport = v;
        });
    }, 1000);
  }

  async save() {
    Logger.info("Saving states...");

    try {
      if (!existsSync("./.cache")) {
        mkdirSync("./.cache");
      }

      await writeFile(join("./.cache", "states.json"), JSON.stringify(this.toJSON()), { encoding: "utf-8" });
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