require("dotenv").config();
const { Collection } = require("discord.js");
const { Kami } = require("./Core/client");
const chalk = require("chalk");
const config = require("./config");
const fetch = require("node-fetch").default;
const readline = require("node:readline");
const { stripIndent } = require("common-tags");
const cwa = new (require("./API/cwa_forecast"))(process.env.CWA_TOKEN);
process.env.DEBUG_MODE = config.debug;

Kami.version = process.env.BOT_VERSION;

// alter
Kami.login(process.env.KAMI_TOKEN);

process.stdout.write(`${String.fromCharCode(27)}]0;Kami ${Kami.version}${String.fromCharCode(7)}`);

// interface
const rl = readline.createInterface({
  input  : process.stdin,
  output : process.stdout,
});

waitForUserInput();

function waitForUserInput() {
  rl.question(chalk.gray(">>>") + " ", async (input) => {
    try {
      if (input.startsWith("log")) {
        const args = input.split(" ").slice(1);
        args.forEach(v => {
          eval(`console.log("${v}", ${v});`);
        });
        console.log("");
      } else if (input.startsWith("emit")) {
        const args = input.split(" ").slice(1);
        eval(`Kami.emit("${args[0]}", ${args[1]});`);
      } else if (input.startsWith("guilds")) {
        const args = input.split(" ").slice(1);

        if (args.length)
          console.log(`${Kami.guilds.cache.filter(g => g.memberCount < +args[0]).map(g => `${g.name} ${chalk.gray(g.id)}`).join("\n")}\n`);
        else
          console.log(`${Kami.guilds.cache.map(g => `${g.name} ${chalk.gray(g.id)}`).join("\n")}\n`);
      } else if (input.startsWith("guild")) {
        const args = input.split(" ").slice(1);
        const guild = Kami.guilds.cache.get(args[0]);

        if (guild) {
          rl.subcommand == "guild";

          await guild.fetch();
          await guild.members.fetch({ force: true });
          console.log(stripIndent`\n
            名稱                   ${chalk.gray("|")} ${guild.name}
            名稱縮寫               ${chalk.gray("|")} ${guild.nameAcronym}
            創建時間               ${chalk.gray("|")} ${guild.createdAt}
            成員數量               ${chalk.gray("|")} ${guild.members.cache.size} / ${guild.maximumMembers}
            成員數量（不含機器人） ${chalk.gray("|")} ${guild.members.cache.filter(m => !m.user.bot).size}
            頻道數量               ${chalk.gray("|")} ${guild.channels.cache.size}
            擁有設定檔             ${chalk.gray("|")} ${Kami.database.GuildDatabase.get(guild.id) == undefined ? "❌" : "✅"}

            動作：
              ${chalk.cyanBright("member")} ${chalk.yellow("<id>")} | 成員資訊
              ${chalk.red("leave")}       | 離開 ${chalk.yellow(guild.name)}
          `);

          const subcommand = () => rl.question(chalk.green(">>>") + " ", async (i) => {
            try {
              if (i.startsWith("leave")) {
                await guild.leave();
                console.log(`已離開伺服器 ${guild.name}\n`);

                delete rl.subcommand;
                waitForUserInput();
              } else if (i.startsWith("settings")) {
                console.log(`${guild.name} 的伺服器設定檔`, Kami.database.GuildDatabase.get(guild.id));

                subcommand();
              } else if (i.startsWith("member")) {
                const a = i.split(" ").slice(1);
                const member = guild.members.cache.get(a[0]);
                console.log(stripIndent`\n
                  名稱       ${chalk.gray("|")} ${member.user.username}
                  標籤       ${chalk.gray("|")} ${member.user.tag}
                  顯示名稱   ${chalk.gray("|")} ${member.displayName} ${member.displayHexColor}
                  創建時間   ${chalk.gray("|")} ${member.user.createdAt}
                  加入時間   ${chalk.gray("|")} ${member.joinedAt}
                  權限       ${chalk.gray("|")} ${member.permissions.toArray().join(", ")}
                  擁有設定檔 ${chalk.gray("|")} ${Kami.database.UserDatabase.get(member.id) == undefined ? "❌" : "✅"}
                  共同伺服器 ${chalk.gray("|")} ${Kami.guilds.cache.filter(g => g.members.cache.has(member.id)).map(g => `${g.name} ${chalk.gray(g.id)}`).join(`\n           ${chalk.gray("|")} `)}
              `);

                subcommand();
              } else {
                console.log(chalk.gray("已取消動作\n"));
                delete rl.subcommand;
                waitForUserInput();
              }
            } catch (e) {
              console.error(e);
              delete rl.subcommand;
              console.log(chalk.gray("已取消動作\n"));
              waitForUserInput();
            }
          });

          subcommand();
        } else {
          console.log(chalk.redBright(`找不到 ID 為 ${input} 的伺服器`));
          waitForUserInput();
        }
      } else if (input == "exit") {
        console.log("Stopping bot...");
        process.exit(0);
      }

      if (!rl.subcommand) waitForUserInput();
    } catch (error) {
      console.error(undefined);

      if (!rl.subcommand) waitForUserInput();
    }
  });
}

process.stdin.on("keypress", () => {
  setTimeout(() => {
    rl._refreshLine();
  }, 0);
});

/**
 * @param {string} stringToWrite
 */
rl._writeToOutput = function _writeToOutput(stringToWrite) {
  let args = stringToWrite.match(/(?:[^\s"]+|"[^"]*")+/g);

  if (args) {
    args = args.slice(1);

    switch (args[0]) {
      case "log": {
        args[0] = chalk.blueBright(args[0]);

        if (args[1]) args[1] = args[1].startsWith("\"") ? chalk.greenBright(args[1]) : chalk.yellow(args[1]);
        break;
      }

      case "emit": {
        args[0] = chalk.blueBright(args[0]);

        if (args[1]) args[1] = chalk.greenBright(args[1]);
        break;
      }

      case "guild": {
        args[0] = chalk.blueBright(args[0]);

        if (args[1]) args[1] = chalk.greenBright(args[1]);
        break;
      }

      case "member" && (rl.subcommand == "guild"): {
        args[0] = chalk.blueBright(args[0]);

        if (args[1]) args[1] = chalk.greenBright(args[1]);
        break;
      }

      case "leave" && (rl.subcommand == "guild"): {
        args[0] = chalk.blueBright(args[0]);
        break;
      }

      case "exit": {
        args[0] = chalk.blueBright(args[0]);
        break;
      }
    }

    rl.output.write("\u001b[90m>>>\x1b[0m " + chalk.blackBright(args.join(" ")));
  } else {
    rl.output.write("\u001b[90m>>>\x1b[0m " + stringToWrite);
  }
};


updateData();
setInterval(() => {
  updateData();
}, 30000);

async function updateData() {
  try {
    const fetched_data = (await cwa.earthquake_report({ format: "json" }).catch(() => void 0))?.records?.Earthquake;
    const fetched_data_s = (await cwa.earthquake_report_s({ format: "json" }).catch(() => void 0))?.records?.Earthquake;

    if (fetched_data != undefined) {
      Kami.data.quake_last = Kami.data.quake_data;
      Kami.data.quake_data = fetched_data;

      if (Kami.data.quake_last.length && Kami.data.quake_last[0]?.ReportContent != Kami.data.quake_data[0].ReportContent)
        Kami.emit("newEarthquake", Kami.data.quake_data[0]);
    }

    if (fetched_data_s != undefined) {
      Kami.data.quake_last_s = Kami.data.quake_data_s;
      Kami.data.quake_data_s = fetched_data_s;

      if (Kami.data.quake_last_s.length && Kami.data.quake_last_s[0]?.ReportContent != Kami.data.quake_data_s[0].ReportContent)
        Kami.emit("newEarthquake_S", Kami.data.quake_data_s[0]);
    }

    if (fetched_data != undefined && fetched_data_s != undefined)
      Kami.data.quake_data_all = [...Kami.data.quake_data, ...Kami.data.quake_data_s].sort((a, b) => new Date(b.EarthquakeInfo.OriginTime) - new Date(a.EarthquakeInfo.OriginTime));

    const rts_list = await (await fetch("https://raw.githubusercontent.com/ExpTechTW/API/master/Json/earthquake/station.json", { method: "GET" })).json();
    Kami.data.rts_stations = new Collection(Object.keys(rts_list).map(k => [k, rts_list[k]]));
  } catch (error) {
    console.error(error);
  }
}