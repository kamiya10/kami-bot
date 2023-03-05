const { Client, Collection, GatewayIntentBits, Partials } = require("discord.js");
const KamiDatabase = require("../Database/KamiDatabase");
const fs = require("fs");
const path = require("path");

const KamiIntents = [
  GatewayIntentBits.MessageContent,
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMembers,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.GuildVoiceStates,
];

const Kami = new Client({ intents: KamiIntents, allowedMentions: { parse: ["roles", "everyone"] } });

Kami.database = { GuildDatabase: new KamiDatabase("guild.json"), UserDatabase: new KamiDatabase("user.json") };

// #region Event Registion

const eventFiles = fs.readdirSync("./EventHandler").filter(file => file.endsWith(".js"));

for (const file of eventFiles) {
  const event = require(path.resolve(`./EventHandler/${file}`));

  if (event.once)
    Kami.once(event.event, (...args) => event.execute(Kami, ...args));
  else
    Kami.on(event.event, (...args) => event.execute(Kami, ...args));
}

// #endregion

// #region Command Registion

Kami.commands = new Collection();
const commandCategories = fs.readdirSync("./Commands");

for (const category of commandCategories) {
  const commandFiles = fs.readdirSync(`./Commands/${category}`).filter(file => file.endsWith(".js"));

  for (const file of commandFiles) {
    const command = require(path.resolve(`./Commands/${category}/${file}`));
    Kami.commands.set(command.data.name, command);
  }
}

Kami.context = new Collection();
const commandFiles = fs.readdirSync("./Context").filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(path.resolve(`./Context/${file}`));
  Kami.context.set(command.data.name, command);
}

// #endregion

// #region

Kami.locale = {};

for (const locale of fs.readdirSync("./Localization").filter(file => file.endsWith(".json")))
  Kami.locale[locale.slice(0, -5)] = require(path.resolve(`./Localization/${locale}`));

// #endregion

Kami.cooldowns = new Collection();
Kami.watchedChanels = new Collection();
Kami.forecast = new Collection();
Kami.data = {
  quake_data   : [],
  quake_data_s : [],
  quake_last   : [],
  quake_last_s : [],
  quake_image  : new Collection(),
  rts_stations : new Collection(),
  rts_list     : new Collection(),
};

Kami.eqws - require("./websocket")(Kami, 5000);

module.exports = { Kami };