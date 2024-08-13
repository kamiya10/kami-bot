const logger = require("../Core/logger");

module.exports = {
  name: "error",
  event: "error",
  once: false,
  execute(client, m) {
    logger.error(m);
  },
};
