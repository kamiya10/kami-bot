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

export interface RtsPushSetting {
  channelId: string | null;
  autoDelete: boolean;
}

export interface GuildDataModel {
  voice: { global: GuildVoiceSettings } & Omit<
    Record<string, GuildVoiceSettings>,
    'global'
  >;
  earthquake: {
    report: EarthquakeReportPushSetting[];
    rts: RtsPushSetting;
  };
}

export type GuildDatabase = Record<string, GuildDataModel>;
