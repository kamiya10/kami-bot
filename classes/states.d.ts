import { Collection } from "discord.js";

declare interface KamiVoiceState {
  creatorId: string;
  categoryId: string;
  ownerId: string;
}

export class KamiStates {
  constructor();
  public voice: Collection<string, KamiVoiceState>;

  public toJSON(): object;
}