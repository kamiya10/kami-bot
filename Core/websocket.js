require("dotenv").config();
const { WebSocket } = require("ws");
const logger = require("./logger");

module.exports = function connect(client, retryTimeout) {
  const ws = new WebSocket("wss://exptech.com.tw/api", { handshakeTimeout: 3000 });

  ws.on("close", () => {
    logger.info(`WebSocket closed. Reconnect after ${retryTimeout / 1000}s`);
    setTimeout(connect, retryTimeout, client, retryTimeout).unref();
  });

  ws.on("error", (err) => {
    logger.error(err);
  });

  ws.on("open", () => {
    ws.send(JSON.stringify({
      uuid     : `KamiBot/${process.env.BOT_VERSION} (platform; Windows NT 10.0; Win64; x64)`,
      function : "subscriptionService",
      value    : [
        "PWS-v1",
        "earthquake-v2",
        "rts-v1",
      ],
      key: process.env.WS_KEY,
    }));
  });

  ws.on("message", (raw) => {
    const data = JSON.parse(raw);

    if (data.response != undefined) {
      if (data.response == "Connection Succeeded")
        logger.info("WebSocket has connected", data);
    } else {
      switch (data.Function) {
        case "NTP":
          break; case "RTS":
          break; case "earthquake":
          break;

        default:
          logger.debug("message", data);
      }
    }
  });
};