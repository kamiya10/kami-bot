import type { GuildMember } from 'discord.js';
import type { Nullable } from './types';

export interface VoiceSettings {
  name: string;
  limit: number;
  bitrate: number;
  region: string | null;
  videoQuality: number;
  slowMode: number;
  nsfw: boolean;
}

export const resolveSetting = <K extends keyof VoiceSettings>(
  property: K,
  guild: VoiceSettings,
  user?: Nullable<VoiceSettings>,
): VoiceSettings[K] => {
  return user?.[property] ?? guild[property];
};

export const formatVoiceName = (name: string, member: GuildMember): string => {
  name = name.replace(/({displayName})/g, member.displayName);
  name = name.replace(/({nickname})/g, member.nickname ?? '');
  name = name.replace(/({username})/g, member.user.username);
  name = name.replace(/({globalName})/g, member.user.globalName ?? '');
  name = name.replace(/({tag})/g, member.user.tag);
  return name;
};
