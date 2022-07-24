import { GuildMember, TextChannel } from "discord.js";
import Channel from "simple-youtube-api/src/structures/Channel";
import Playlist from "simple-youtube-api/src/structures/Playlist";
import Video from "simple-youtube-api/src/structures/Video";

export class SongResource {
  constructor(type: "youtube" | "soundcloud", url: string, meta: Video, user: GuildMember, textChannel: TextChannel, playlist?: Playlist)
  url: string;
  title: string;
  rawDuration: { years: number, months: number, weeks: number, days: number, hours: number, minutes: number, seconds: number };
  duration: string;
  thumbnail: string;
  user: GuildMember;
  channel?: Channel;
  messageChannel: TextChannel;
  playlist: Playlist | null;

  formatDuration(durationObj: { hours: number, minutes: number, seconds: number }): string;
}