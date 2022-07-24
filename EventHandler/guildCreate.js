require("dotenv").config();
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");
const rest = new REST({ version: "10" }).setToken(process.env.KAMI_TOKEN);

module.exports = {
	name  : "guildCreate",
	event : "guildCreate",
	once  : false,
	/**
	 * @param {import("discord.js").Client} client
     * @param {import("discord.js").Guild} guild
	 */
	async execute(client, guild) {
		rest.put(Routes.applicationGuildCommands(client.application.id, guild.id), { body: client.commands.map(v => v.data.toJSON()) })
			.then(() => console.log("Successfully registered application commands for " + guild.name))
			.catch(console.error);
	},
};