require("dotenv").config();
const { Database, GuildDatabase, UserDatabase } = require("./Database/database");
const { Kami } = require("./Core/client");
const chalk = require("chalk");
const config = require("./config");
const readline = require("node:readline");
const cwb = new (require("./API/cwb_forecast"))(process.env.CWB_TOKEN);
process.env.DEBUG_MODE = config.debug;


Kami.database = { GuildDatabase, UserDatabase, Database };
Kami.database.Database.sync({ alter: true });
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
	rl.question(chalk.gray(">>>") + " ", function(input) {
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
			} else if (input == "exit") {
				console.log("Stopping bot...");
				process.exit(0);
			}
		} catch (error) {
			console.error(undefined);
		}
		waitForUserInput();
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

			case "exit": {
				args[0] = chalk.blueBright(args[0]);
				break;
			}
		}
		rl.output.write("\u001b[90m>>>\x1b[0m " + chalk.blackBright(args.join(" ")));
	} else
		rl.output.write("\u001b[90m>>>\x1b[0m " + stringToWrite);
};


updateData();
setInterval(() => {
	updateData();
}, 30000);
async function updateData() {
	try {
		const fetched_data = (await cwb.earthquake_report({ format: "json" }).catch(() => void 0))?.records?.earthquake;
		const fetched_data_s = (await cwb.earthquake_report_s({ format: "json" }).catch(() => void 0))?.records?.earthquake;

		if (fetched_data != undefined) {
			Kami.eq.quake_last = Kami.eq.quake_data;
			Kami.eq.quake_data = fetched_data;
			if (Kami.eq.quake_last.length && Kami.eq.quake_last[0]?.reportContent != Kami.eq.quake_data[0].reportContent)
				Kami.emit("newEarthquake", Kami.eq.quake_data[0]);
		}

		if (fetched_data_s != undefined) {
			Kami.eq.quake_last_s = Kami.eq.quake_data_s;
			Kami.eq.quake_data_s = fetched_data_s;
			if (Kami.eq.quake_last_s.length && Kami.eq.quake_last_s[0]?.reportContent != Kami.eq.quake_data_s[0].reportContent)
				Kami.emit("newEarthquake_S", Kami.eq.quake_data_s[0]);
		}

		if (fetched_data != undefined && fetched_data_s != undefined)
			Kami.eq.quake_data_all = [...Kami.eq.quake_data, ...Kami.eq.quake_data_s].sort((a, b) => new Date(b.earthquakeInfo.originTime) - new Date(a.earthquakeInfo.originTime));

	} catch (error) {
		console.error(error);
	}
}