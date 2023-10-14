class KamiDatabase {
  constructor({ guild, user }) {
    /**
     * @type {{guild: import("lowdb").Low<import("../databases/GuildDatabase").GuildDatabase>, user: import("lowdb").Low<import("../databases/UserDatabase").UserDatabase>}}
     */
    this.database = {
      guild,
      user,
    };
  }

  /**
   * Get Guild Data
   * @param {string} id Guild Id
   * @returns {import("../databases/GuildDatabase").GuildDataModel}
   */
  guild(id) {
    if (!this.database.guild.data[id]) {
      this.database.guild.data[id] = {
        voice: {
          global: {
            name    : null,
            bitrate : null,
            limit   : null,
            region  : null,
          },
        },
      };
    }

    return this.database.guild.data[id];
  }

  /**
   * Get User Data
   * @param {string} id User Id
   * @returns {import("../databases/UserDatabase").UserDataModel}
   */
  user(id) {
    if (!this.database.user.data[id]) {
      this.database.user.data[id] = {
        voice: {
          global: {
            name    : null,
            bitrate : null,
            limit   : null,
            region  : null,
          },
        },
      };
    }

    return this.database.user.data[id];
  }
}

module.exports = { KamiDatabase };