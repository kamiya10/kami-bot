require("dotenv").config();
const GuildDatabaseModel = require("../Model/GuildDatabaseModel");

module.exports = {
  name  : "guildCreate",
  event : "guildCreate",
  once  : false,

  /**
   * @param {import("discord.js").Client} client
   * @param {import("discord.js").Guild} guild
   */
  execute(client, guild) {
    if (!client.database.GuildDatabase.has(guild.id))
      client.database.GuildDatabase.set(guild.id, GuildDatabaseModel());

    guild.commands.set(client.commands.map(v => v.data.toJSON()))
      .then(() => console.log("Successfully registered application commands for " + guild.name))
      .catch(console.error);
  },
};