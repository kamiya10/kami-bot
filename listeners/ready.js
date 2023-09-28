const { Events } = require("discord.js");
const { KamiListener } = require("../classes/listener");

/**
 * Ready event listener.
 * @param {import("../classes/client").KamiClient} client
 * @returns
 */
const onReady = (client) => new KamiListener("ready")
  .on(Events.ClientReady, (interaction) => {
    console.log("client ready");
  });

module.exports = onReady;