import { ClientEvents } from "discord.js";
import { Awaitable } from "@discordjs/util";

export class KamiListener {
  public name: string;
  public event: string;
  public callback: (...args: any[]) => Awaitable<void>;
  public callOnce?: boolean;

  public on<K extends keyof ClientEvents>(event: K, listener: (...args: ClientEvents[K]) => Awaitable<void>): this;
  public on<S extends string | symbol>(
    event: Exclude<S, keyof ClientEvents>,
    listener: (...args: any[]) => Awaitable<void>,
  ): this;

  public once<K extends keyof ClientEvents>(event: K, listener: (...args: ClientEvents[K]) => Awaitable<void>): this;
  public once<S extends string | symbol>(
    event: Exclude<S, keyof ClientEvents>,
    listener: (...args: any[]) => Awaitable<void>,
  ): this;
}