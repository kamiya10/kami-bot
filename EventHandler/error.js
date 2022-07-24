const logger = require("../Core/logger");

module.exports = {
	name  : "error",
	event : "error",
	once  : false,
	async execute(client, m) {
		logger.error(m);
	},
};