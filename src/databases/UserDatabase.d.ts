declare interface VoiceSettings {
  name: string | null;
  bitrate: number | null;
  limit: number | null;
  region: string | null;
}

export interface UserDataModel {
  voice: Record<string, VoiceSettings>;
}

export type UserDatabase = Record<string, UserDataModel>;
