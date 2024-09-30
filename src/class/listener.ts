/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Awaitable, ClientEvents } from 'discord.js';

import type { KamiClient } from '@/class/client';

export interface ListenerBuilder {
  build: (client: KamiClient) => KamiListener;
}

export class KamiListener {
  name: string;
  event!: keyof ClientEvents;
  callback!: (...args: any) => Awaitable<void>;
  callOnce = false;

  constructor(name: string) {
    this.name = name;
  }

  public on<S extends string | symbol>(
    event: Exclude<S, keyof ClientEvents>,
    listener: (...args: any[]) => Awaitable<void>,
  ): this;
  public on<K extends keyof ClientEvents>(event: K, listener: (...args: ClientEvents[K]) => Awaitable<void>): this;
  on<K extends keyof ClientEvents>(event: K, listener: (...args: ClientEvents[K]) => Awaitable<void>) {
    this.event = event;
    this.callback = listener;
    return this;
  }

  public once<S extends string | symbol>(
    event: Exclude<S, keyof ClientEvents>,
    listener: (...args: any[]) => Awaitable<void>,
  ): this;
  public once<K extends keyof ClientEvents>(event: K, listener: (...args: ClientEvents[K]) => Awaitable<void>): this;
  once<K extends keyof ClientEvents>(event: K, listener: (...args: ClientEvents[K]) => Awaitable<void>) {
    this.event = event;
    this.callOnce = true;
    this.callback = listener;
    return this;
  }
}
