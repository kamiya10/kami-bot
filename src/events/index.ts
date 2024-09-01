import type { ClientEvents } from "discord.js";
import type { KamiClient } from "@/classes/client";

import command from "#/client/command";
import ready from "#/client/ready";
import report from "#/client/report";
import rts from "#/client/rts";
import voiceCreate from "#/client/voiceCreate";
import voiceDelete from "#/client/voiceDelete";
import voiceRemove from "#/client/voiceRemove";

export interface KamiEventListener<Event extends keyof ClientEvents> {
  name  : Event;
  on?   : (this: KamiClient, ...args: ClientEvents[Event]) => Promise<void>;
  once? : (this: KamiClient, ...args: ClientEvents[Event]) => Promise<void>;
}

export default [
  command,
  ready,
  report,
  rts,
  voiceCreate,
  voiceDelete,
  voiceRemove,
] as KamiEventListener<keyof ClientEvents>[];