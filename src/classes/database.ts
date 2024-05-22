import type { GuildDataModel } from "../databases/GuildDatabase";
import type { UserDataModel } from "../databases/UserDatabase";
import type { ClientDatabase } from "./client";

export class KamiDatabase {
  database: ClientDatabase;

  constructor(database: ClientDatabase) {
    this.database = database;
  }

  get guild() {

    /**
     * Get Guild Data
     * @param {string} id Guild Id
     * @returns {GuildDataModel}
     */
    const getter = (id: string): GuildDataModel => {
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
              regionOverride: false,
            },
          },
          earthquake: {
            report: [],
            rts: {
              channelId: null,
              autoDelete: true,
            },
          }
        };
      }

      return this.database.guild.data[id];
    };

    getter.forEach = (
      callback: (value: GuildDataModel, id: string, index: number, data: Record<string, GuildDataModel>) => void
    ): void => {
      Object
        .entries(this.database.guild.data)
        .forEach((v, i) => callback(v[1], v[0], i, this.database.guild.data));
    };

    getter.map = <T>(
      callback: (value: GuildDataModel, id: string, index: number, data: Record<string, GuildDataModel>) => T
    ): T[] => {
      return Object
        .entries(this.database.guild.data)
        .map((v, i) => callback(v[1], v[0], i, this.database.guild.data));
    };

    return getter;
  }


  get user() {
    const getter = (id: string): UserDataModel => {
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
    };

    getter.forEach = (
      callback: (value: UserDataModel, id: string, index: number, data: Record<string, UserDataModel>) => void
    ): void => {
      Object
        .entries(this.database.user.data)
        .forEach((v, i) => callback(v[1], v[0], i, this.database.user.data));
    };

    getter.map = <T>(
      callback: (value: UserDataModel, id: string, index: number, data: Record<string, UserDataModel>) => T
    ): T[] => {
      return Object
        .entries(this.database.user.data)
        .map((v, i) => callback(v[1], v[0], i, this.database.user.data));
    };

    return getter;
  }
}