import { existsSync, mkdirSync } from "node:fs";
import { Collection } from "discord.js";
import { Logger } from "./logger";
import { join } from "node:path";
import { writeFile } from "node:fs/promises";

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
  public voice: Collection<string, KamiVoiceState>;

  constructor(data?: KamiStatesOptions) {
    this.voice = new Collection(data?.voice);
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