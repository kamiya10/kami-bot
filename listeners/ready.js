const { Events } = require("discord.js");
const { KamiListener } = require("../classes/listener");

module.exports =

/**
 * @param {import("../classes/client").KamiClient} client
 * @returns
 */
(client) => new KamiListener("ready")
  .on(Events.ClientReady, (interaction) => {
    console.log("client ready");
  });