import { CommandInteractionOptionResolver } from "discord.js";
import { Channel, Client, CommandInteraction, Guild, GuildMember, Message } from "discord.js";

declare class CommandEvent {
  constructor(command: string, options: string[] | {}[], channel: Channel, member: GuildMember, client: Client, mi: Message | CommandInteraction);

  command: {
    name: string;
    options: ""[] | CommandInteractionOptionResolver;
  }
  mi: Message | CommandInteraction;
  isInteraction: boolean;
  guild: Guild;
  channel: Channel;
  user: GuildMember;
  client: Client;
}