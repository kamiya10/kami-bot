import type { GuildDataModel } from "../databases/GuildDatabase";
import type { UserDataModel } from "../databases/UserDatabase";
import type { ClientDatabase } from "./client";

export class KamiDatabase {
  database: ClientDatabase;

  constructor(database: ClientDatabase) {
    this.database = database;
  }

  /**
   * Get Guild Data
   * @param {string} id Guild Id
   * @returns {GuildDataModel}
   */
  guild(id: string): GuildDataModel {
    if (!this.database.guild.data[id]) {
      this.database.guild.data[id] = {
        voice: {
          global: {
            category: null,
            name: null,
            nameOverride: false,
            bitrate: null,
            bitrateOverride: false,
            limit: null,
            limitOverride: false,
            region: null,
            regionOverride: false
          },
        },
      };
    }

    return this.database.guild.data[id];
  }

  /**
   * Get User Data
   * @param {string} id User Id
   * @returns {UserDataModel}
   */
  user(id: string): UserDataModel {
    if (!this.database.user.data[id]) {
      this.database.user.data[id] = {
        voice: {
          global: {
            name: null,
            bitrate: null,
            limit: null,
            region: null,
          },
        },
      };
    }

    return this.database.user.data[id];
  }
}