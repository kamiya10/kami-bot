require("dotenv").config();
const { KamiClient } = require("./classes/client");
const { KamiIntents } = require("./constants");

const client = new KamiClient({
  intents: KamiIntents,
});

client.login(process.env.DEV_TOKEN);