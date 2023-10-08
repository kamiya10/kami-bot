declare interface VoiceSettings {
  name: string;
  bitrate: number;
  limit: number;
  region: string;
}

export interface UserDataModel {
  voice: Record<string, VoiceSettings>
}

export type UserDatabase = Record<string, UserDataModel>;