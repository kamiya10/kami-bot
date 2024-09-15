import type { ClientEvents } from "discord.js";
import type { EarthquakeReport } from "@/api/cwa";
import type { KamiClient } from "@/classes/client";
import type { Rts } from "@exptechtw/api-wrapper";

import command from "#/client/command";
import ready from "#/client/ready";
import report from "#/client/report";
import rts from "#/client/rts";
import voiceCreate from "#/client/voiceCreate";
import voiceDelete from "#/client/voiceDelete";
import voiceRemove from "#/client/voiceRemove";

export interface KamiEvents extends ClientEvents {
  rts: [rts: Rts];
  report: [report: EarthquakeReport];
}

export interface KamiEventListener<Event extends keyof KamiEvents> {
  name: Event;
  on?: (this: KamiClient, ...args: KamiEvents[Event]) => Promise<void>;
  once?: (this: KamiClient, ...args: KamiEvents[Event]) => Promise<void>;
}

export default [
  command,
  ready,
  report,
  rts,
  voiceCreate,
  voiceDelete,
  voiceRemove,
] as KamiEventListener<keyof KamiEvents>[];
