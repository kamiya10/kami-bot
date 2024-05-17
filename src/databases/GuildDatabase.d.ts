declare interface GuildVoiceSettings {
  category: string | null;
  name: string | null;
  nameOverride: boolean;
  bitrate: number | null;
  bitrateOverride: boolean;
  limit: number | null;
  limitOverride: boolean;
  region: string | null;
  regionOverride: boolean;
}

export interface EarthquakeReportPushSetting {
  channelId: string;
  numbered: boolean;
  style: string;
}

export interface GuildDataModel {
  voice: Record<string, GuildVoiceSettings>;
  earthquake: {
    report: EarthquakeReportPushSetting[];
  };
}

export type GuildDatabase = Record<string, GuildDataModel>;