require("dotenv").config();

module.exports = {
	name  : "guildCreate",
	event : "guildCreate",
	once  : false,
	/**
	 * @param {import("discord.js").Client} client
     * @param {import("discord.js").Guild} guild
	 */
	async execute(client, guild) {
		guild.commands.set(client.commands.map(v => v.data.toJSON()))
			.then(() => console.log("Successfully registered application commands for " + guild.name))
			.catch(console.error);
	},
};