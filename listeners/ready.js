// @ts-check

const { Events } = require("discord.js");
const { KamiListener } = require("../classes/listener");

/**
 * Ready event listener.
 * @returns {KamiListener}
 */
const onReady = () => new KamiListener("ready")
  .on(Events.ClientReady, () => {
    console.log("client ready");
  });

module.exports = onReady;