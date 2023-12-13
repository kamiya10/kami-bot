import { Collection } from "discord.js";

declare interface KamiVoiceState {
  creatorId: string;
  categoryId: string;
  ownerId: string;
  defaultOptions: {
    name: string;
    bitrate: number;
    limit: number;
    region: string;
  };
}

export class KamiStates {
  constructor(data?: { voice: KamiVoiceState });
  public voice: Collection<string, KamiVoiceState>;

  public save(): Promise<void>;
  public toJSON(): object;
}