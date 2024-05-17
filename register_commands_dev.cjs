require("dotenv").config();
const { existsSync, mkdirSync, readFileSync, writeFileSync } = require("node:fs");
const { Events } = require("discord.js");
const { KamiClient } = require("./classes/client");
const { KamiIntents } = require("./constants");
const { Logger } = require("./classes/logger");
const { SingleBar } = require("cli-progress");
const { createHash } = require("node:crypto");
const { dirname } = require("node:path");
const i18next = require("i18next");
const ora = require("ora");
const pe = require("pretty-error").start();

pe.skipNodeFiles();
pe.alias(`${dirname(require.main.filename).replace(/\\/g, "/")}/`, "kami-bot @ ");
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

if (!existsSync("./.cache")) {
  mkdirSync("./.cache");
}

if (!existsSync("./.cache/DEV_COMMAND_VERSION")) {
  writeFileSync("./.cache/DEV_COMMAND_VERSION", "", { encoding: "utf-8" });
}

const version = readFileSync("./.cache/DEV_COMMAND_VERSION", { encoding: "utf-8" });

async function main() {
  const sp1 = ora({ text: "Loading localizations...", color: "cyan", spinner: "dots" });

  sp1.start();
  await i18next.init({
    resources: {
      en      : require("./localization/en.json"),
      ja      : require("./localization/ja.json"),
      "zh-TW" : require("./localization/zh-TW.json"),
    },
  });
  sp1.succeed();

  const client = new KamiClient(null, { intents: KamiIntents });
  const commands = client.commands.map(command => command.builder.toJSON());

  const hash = createHash("sha256")
    .update(JSON.stringify(commands))
    .digest()
    .toString();

  if (hash == version) {
    Logger.info("Command Version is the same. Skipping command registration.");
    process.exit(0);
  } else {
    Logger.info("Command Version is different! Registering commands...");
    writeFileSync("./.cache/DEV_COMMAND_VERSION", hash, { encoding: "utf-8" });

    client.once(Events.ClientReady, () => {
      const bar = new SingleBar({
        format     : "{bar} {percentage}% | {value} of {total} Guilds",
        hideCursor : true,
      });

      let count = 0;
      bar.start(client.guilds.cache.size, 0);

      setInterval(() => {
        bar.updateETA();
      }, 1000);

      client.guilds.cache.forEach(async (guild) => {
        try {
          await guild.commands.set(commands);
        } catch (error) {
          Logger.blank();
          Logger.error(error.toString(), commands);
        }

        count++;
        bar.update(count);

        if (count == client.guilds.cache.size) {
          Logger.blank();
          Logger.success("Done.");
          process.exit(0);
        }
      });
    });

  }

  client.login(process.env.DEV_TOKEN);
}

main();