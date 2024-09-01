declare interface VoiceSettings {
  name: string | null;
  bitrate: number | null;
  limit: number | null;
  region: string | null;
}

export interface UserDataModel {
  voice: { global: VoiceSettings } & Omit<Record<string, VoiceSettings>, "global">;
}

export type UserDatabase = Record<string, UserDataModel>;
