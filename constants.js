const { GatewayIntentBits } = require("discord.js");

const KamiIntents = [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMembers,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.GuildVoiceStates,
  GatewayIntentBits.MessageContent,
];

module.exports = { KamiIntents };