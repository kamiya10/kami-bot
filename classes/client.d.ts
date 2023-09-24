import { Client } from "discord.js";
import { KamiCommand } from "./command";
import { KamiListener } from "./listener";

export class KamiClient extends Client {
  public listeners: Map<string, KamiListener>;
  public commands: Map<string, KamiCommand>;
}