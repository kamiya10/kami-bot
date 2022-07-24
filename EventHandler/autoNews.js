module.exports = {
	name  : "autoNews",
	event : "messageCreate",
	once  : false,
	/**
     * @param {import("discord.js").Message} message
     */
	async execute(client, message) {
		if (message.channel.type == "GUILD_NEWS")
			if (message.channel.topic?.startsWith("[AutoNews]"))
				if (!message.content.startsWith("-"))
					if (message.crosspostable) {
						await message.crosspost();
						await message.react("✅").catch(() => void 0);
					}
	},
};