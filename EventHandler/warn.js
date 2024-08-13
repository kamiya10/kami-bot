const logger = require("../Core/logger");

module.exports = {
  name: "warn",
  event: "warn",
  once: false,
  execute(client, m) {
    logger.warn(m);
  },
};
