require("dotenv").config();
const { KamiClient } = require("./classes/client");
const { KamiIntents } = require("./constants");
const { dirname } = require("node:path");
const pe = require("pretty-error").start();

pe.alias(dirname(require.main.filename).replace(/\\/g, "/"), "(kami-bot) ");
pe.appendStyle({
  "pretty-error": {
    marginLeft: 0,
  },
  "pretty-error > header > message": {
    color: "white",
  },
  "pretty-error > trace": {
    marginTop  : 0,
    marginLeft : 1,
  },
  "pretty-error > trace > item": {
    marginBottom: 0,
  },
  "pretty-error > trace > item > header > pointer > file": {
    color: "blue",
  },
  "pretty-error > trace > item > header > pointer > line": {
    color: "yellow",
  },
  "pretty-error > trace > item > header > what": {
    color: "none",
  },
  "pretty-error > trace > item > footer > addr": {
    color: "black",
  },
  "pretty-error > trace > item > footer > extra": {
    color: "black",
  },
});

const client = new KamiClient({
  intents: KamiIntents,
});

client.login(process.env.DEV_TOKEN);