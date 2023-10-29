import { Client, ClientOptions, ClientUser, Collection } from "discord.js";
import { KamiCommand } from "./command";
import { KamiDatabase } from "./database";
import { KamiListener } from "./listener";
import { KamiStates } from "./states";

export class KamiClient extends Client {
  constructor(database: KamiDatabase, clientOptions: ClientOptions);
  public database: KamiDatabase;
  public states: KamiStates;

  public listeners: Collection<string, KamiListener>;
  public commands: Collection<string, KamiCommand>;

  private setupListeners(): void;
  private loadCommands(): void;
  private reloadCommands(name): boolean;

  // overrides
  public user: ClientUser;
}