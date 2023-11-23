require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const cliProgress = require("cli-progress");
const fs = require("node:fs");

const progress = new cliProgress.MultiBar({
  hideCursor : true,
  format     : "{type} | {bar} {percentage} | ETA: {eta}s | {value}/{total} | {guildname}",
}, cliProgress.Presets.shades_classic);

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.login(process.env.KAMI_TOKEN);

const globalCommands = [];
const commands = [];

const commandCategories = fs.readdirSync("./Commands");

for (const category of commandCategories) {
  const commandFiles = fs.readdirSync(`./Commands/${category}`).filter(file => file.endsWith(".js"));

  for (const file of commandFiles) {
    const command = require(`./Commands/${category}/${file}`);

    if (command.dev) {
      continue;
    }

    if (command.global) {
      globalCommands.push(command.data.toJSON());
    } else {
      commands.push(command.data.toJSON());
    }
  }
}

const commandFiles = fs.readdirSync("./Context").filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./Context/${file}`);

  if (command.global) {
    globalCommands.push(command.data.toJSON());
  } else {
    commands.push(command.data.toJSON());
  }
}

Logger.info("Starting command registration");

client.once("ready", async () => {
  let count = 0, errcount = 0;

  if (await new Promise((resolve) => {
    const b1 = progress.create(1, 0, { type: "Global" });
    const b2 = progress.create(client.guilds.cache.size + 1, 0, { type: "Guild" });

    client.application.commands.set(globalCommands).then(() => {
      b1.increment();
      progress.log("Complete!\n");
    });

    client.guilds.cache.forEach(v => {
      b2.update(count + errcount, { guildname: v.name });

      v.commands.set(commands)
        .then(() => {
          count++;
          b2.update(count + errcount);

          if ((count + errcount) == client.guilds.cache.size) {
            progress.stop();
            resolve(true);
          }
        })
        .catch((e) => {
          progress.log(`Error: ${v.name}(${v.id}): ${e}\n`);
          errcount++;
          b2.update(count + errcount);

          if ((count + errcount) == client.guilds.cache.size) {
            progress.stop();
            resolve(true);
          }
        });
    });
  })) {
    Logger.info(`\nFinished register with ${count} succeed, ${errcount} failed.`);
    process.exit(0);
  } else {
    Logger.error("Command registration failed");
    process.exit(1);
  }
});
