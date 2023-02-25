require("dotenv").config();
const { WebSocket } = require("ws");
const logger = require("./logger");

module.exports = function connect(client, retryTimeout) {
  const ws = new WebSocket("wss://exptech.com.tw/api", { handshakeTimeout: 3000 });

  const heartbeat = setTimeout(() => {
    logger.warn("Heartbeat check failed! Closing WebSocket...");
    ws.close();
  }, 15_000);

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
      value    : ["earthquake-v2", "trem-eq-v1"],
      key      : process.env.WS_KEY,
    }));
  });

  ws.on("message", (raw) => {
    const data = JSON.parse(raw);

    if (data.response != undefined) {
      if (data.response == "Connection Succeeded")
        logger.info("WebSocket has connected");
    } else {
      switch (data.type) {
        case "ntp":
        case "earthquake": {
          heartbeat.refresh();
          break;
        }

        case "trem-eq": {
          console.debug("trem-eq", data);
          client.emit("rts", data);
          break;
        }

        default: {
          console.debug("message", data);
        }
      }
    }
  });
};