// @ts-check

const { Events } = require("discord.js");
const { KamiListener } = require("../classes/listener");
const { Logger } = require("../classes/logger");

/**
 * Ready event listener.
 * @returns {KamiListener}
 */
const onReady = () => new KamiListener("ready")
  .on(Events.ClientReady, () => {
    Logger.info("client ready");
  });

module.exports = onReady;