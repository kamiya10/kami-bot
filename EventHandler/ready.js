const logger = require("../Core/logger");

module.exports = {
  name  : "ready",
  event : "ready",
  once  : false,

  /**
   * @param {import("discord.js").Client} client
   */
  async execute(client) {
    logger.info("The bot is online");
    const GuildSetting = await client.database.GuildDatabase.getAll(["voice"]);
    const checklist = Object.keys(GuildSetting).filter(v => GuildSetting[v]?.voice?.length).map(v => GuildSetting[v]);
    checklist.forEach(v => {
      v.voice.forEach(val => {
        if (val.category)
          if (client.channels.cache.get(val.category))
            client.channels.cache.get(val.category).children.cache.forEach(

              /**
               * @param {import("discord.js").Channel} ch
               */
              async ch => {
                if (ch.isVoiceBased())
                  if (ch.id != val.creator)
                    if (ch.members.size) {
                      const m = ch.permissionOverwrites.cache.filter((p, k) => p.allow.has("ManageChannels") && k != client.user.id);
                      client.watchedChanels.set(ch.id, { master: m?.firstKey() });
                    } else {
                      await ch.delete();
                    }
              });
      });
    });
    setInterval(async () => {
      await client.user.setActivity(`${client.version} | ${client.guilds.cache.size}伺服 - ${client.channels.cache.size}頻道 - ${client.users.cache.size}用戶`);
    }, 60000);
  },
};