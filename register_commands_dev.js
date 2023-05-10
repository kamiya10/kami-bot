require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const cliProgress = require("cli-progress");
const fs = require("node:fs");

const progress = new cliProgress.SingleBar({
  hideCursor: true,
}, cliProgress.Presets.shades_classic);

const commands = [];

const commandCategories = fs.readdirSync("./Commands");

for (const category of commandCategories) {
  const commandFiles = fs.readdirSync(`./Commands/${category}`).filter(file => file.endsWith(".js"));

  for (const file of commandFiles) {
    const command = require(`./Commands/${category}/${file}`);

    if (command.dev)
      commands.push(command.data.toJSON());
  }
}

const commandFiles = fs.readdirSync("./Context").filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./Context/${file}`);

  if (command.dev)
    commands.push(command.data.toJSON());
}

console.log(`Commands Length: ${commands.length}`);
console.log("Starting command registration");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.login(process.env.DEV_TOKEN);

client.once("ready", async () => {
  let count = 0, errcount = 0;

  if (await new Promise((resolve) => {
    progress.start(client.guilds.cache.size, 0);


    client.guilds.cache.forEach(v => {
      v.commands.set(commands)
        .then(() => {
          count++;
          progress.update(count + errcount);

          if ((count + errcount) == client.guilds.cache.size) {
            progress.stop();
            resolve(true);
          }
        })
        .catch((e) => {
          console.error(`${v.name}(${v.id}): ${e}`);
          errcount++;
          progress.update(count + errcount);

          if ((count + errcount) == client.guilds.cache.size) {
            progress.stop();
            resolve(true);
          }
        });
    });
  })) {
    console.log(`\nFinished register with ${count} succeed, ${errcount} failed.`);
    process.exit(0);
  }
});
