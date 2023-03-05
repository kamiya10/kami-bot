require("dotenv").config();
const { WebSocket } = require("ws");
const logger = require("./logger");

module.exports = connect;

function connect(client, retryTimeout) {
  let ws = new WebSocket("wss://exptech.com.tw/api", { handshakeTimeout: 3000 });

  let ping, heartbeat;

  ws.on("close", () => {
    logger.info(`WebSocket closed. Reconnect after ${retryTimeout / 1000}s`);
    ws = null;
    setTimeout(() => connect(client, retryTimeout), retryTimeout).unref();
  });

  ws.on("error", (err) => {
    if (!err.message.includes("521"))
      logger.error(err);
  });

  ws.on("open", () => {
    ping = setInterval(() => {
      ws.ping();
      heartbeat = setTimeout(() => {
        logger.warn("Heartbeat check failed! Closing WebSocket...");
        clearInterval(ping);
        clearTimeout(heartbeat);
        ws.terminate();
      }, 10_000);
    }, 15_000);

    ws.send(JSON.stringify({
      uuid     : `KamiBot/${process.env.BOT_VERSION} (platform; Windows NT 10.0; Win64; x64)`,
      function : "subscriptionService",
      value    : ["earthquake-v2", "trem-eq-v1"],
      key      : process.env.WS_KEY,
    }));
  });

  ws.on("pong", () => {
    clearTimeout(heartbeat);
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
          break;
        }

        case "trem-eq": {
          client.emit("rts", data);
          break;
        }

        default: {
          console.debug("message", data);
        }
      }
    }
  });
}