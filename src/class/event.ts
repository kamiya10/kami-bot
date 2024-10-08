import type { ClientEvents } from 'discord.js';
import type { KamiClient } from '@/class/client';
import type { Rts } from '@exptechtw/api-wrapper';
import type { EarthquakeReport } from '@/api/cwa';
import type { WeatherAdvisory } from '@/api/cwa/weatherAdvisory';

export interface KamiClientEvents extends ClientEvents {
  rts: [rts: Rts];
  report: [report: EarthquakeReport];
  weatherAdvisory: [updated: WeatherAdvisory[]];
}

type Events = keyof KamiClientEvents;

export interface EventHandlerOptions<Event extends Events = Events> {
  event: Event;
  on?: (
    this: KamiClient,
    ...args: KamiClientEvents[Event]
  ) => void | Promise<void>;
  once?: (
    this: KamiClient,
    ...args: KamiClientEvents[Event]
  ) => void | Promise<void>;
}

export class EventHandler<Event extends Events = Events> {
  event: Event;
  on?: (
    this: KamiClient,
    ...args: KamiClientEvents[Event]
  ) => void | Promise<void>;

  once?: (
    this: KamiClient,
    ...args: KamiClientEvents[Event]
  ) => void | Promise<void>;

  constructor(options: EventHandlerOptions<Event>) {
    this.event = options.event;
    this.on = options.on;
    this.once = options.once;
  }
}
