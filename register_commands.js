require("dotenv").config();
const { Client } = require("discord.js");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");
const fs = require("node:fs");
const client = new Client({ intents: ["GUILDS"] });
const rest = new REST({ version: "10" }).setToken(process.env.KAMI_TOKEN);
client.login(process.env.KAMI_TOKEN);
const commands = [];

const commandCategories = fs.readdirSync("./Commands");
for (const category of commandCategories) {
	const commandFiles = fs.readdirSync(`./Commands/${category}`).filter(file => file.endsWith(".js"));

	for (const file of commandFiles) {
		const command = require(`./Commands/${category}/${file}`);
		commands.push(command.data.toJSON());
	}
}

const commandFiles = fs.readdirSync("./Context").filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
	const command = require(`./Context/${file}`);
	commands.push(command.data.toJSON());
}

client.once("ready", async () => {
	let count = 0, errcount = 0;
	if (await new Promise((resolve) => {
		client.guilds.cache.forEach(async v => {
			await rest.put(Routes.applicationGuildCommands(client.application.id, v.id), { body: commands })
				.then(() => count++)
				.catch((e) => {
					console.error(`${v.name}(${v.id}): ${e}`);
					errcount++;
				});
			if ((count + errcount) == client.guilds.cache.size) resolve(true);
		});
	})) {
		console.log(`\nFinished register with ${count} succeed, ${errcount} failed.`);
		process.exit(0);
	}
});
