const pino = require("pino");
const logger = pino(
	{
		level     : process.env.LOG_LEVEL || "debug",
		transport : {
			target  : "pino-pretty",
			options : {
				colorize      : true,
				ignore        : "pid,hostname",
				translateTime : "yyyy/mm/dd HH:MM:ss",
			},
		},
	},
);
module.exports = logger;