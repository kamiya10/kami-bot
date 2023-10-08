declare interface GuildVoiceSettings {
  category: string;
  name: string | null;
  nameOverride: boolean;
  bitrate: number | null;
  bitrateOverride: boolean;
  limit: number | null;
  limitOverride: boolean;
  region: string | null;
  regionOverride: boolean;
}

export interface GuildDataModel {
  voice: Record<string, GuildVoiceSettings>
}

export type GuildDatabase = Record<string, GuildDataModel>;