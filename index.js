require("dotenv").config();
const { Database, GuildDatabase, UserDatabase } = require("./Database/database");
const { Kami } = require("./Core/client");
const config = require("./config");
const readline = require("node:readline");
const cwb = new (require("./API/cwb_forecast"))(process.env.CWB_TOKEN);
process.env.DEBUG_MODE = config.debug;


Kami.database = { GuildDatabase, UserDatabase, Database };
Kami.database.Database.sync({ alter: true });
Kami.version = process.env.BOT_VERSION;

// alter
Kami.login(process.env.KAMI_TOKEN);

// interface

const rl = readline.createInterface({
	input  : process.stdin,
	output : process.stdout,
});

waitForUserInput();
function waitForUserInput() {
	rl.question("\u001b[90m>>>\x1b[0m ", function(input) {
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

rl._writeToOutput = function _writeToOutput(stringToWrite) {
	rl.output.write(stringToWrite.replace(/\s(log|emit)\s/g, "\u001b[33m$1\x1b[0m"));
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