import { GuildDataModel, GuildDatabase } from "../databases/GuildDatabase";
import { UserDataModel, UserDatabase } from "../databases/UserDatabase";
import { Low } from "lowdb";

declare interface Databases {
  guild: Low<GuildDatabase>;
  user: Low<UserDatabase>;
}

export class KamiDatabase {
  constructor(database: Databases);
  public database: Databases;
  public guild(id: string): GuildDataModel;
  public user(id: string): UserDataModel;
}