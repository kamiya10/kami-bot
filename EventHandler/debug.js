const logger = require("../Core/logger");

module.exports = {
	name  : "debug",
	event : "debug",
	once  : false,
	async execute(client, m) {
		if (process.env.DEBUG_MODE == "true") logger.debug(m);
	},
};