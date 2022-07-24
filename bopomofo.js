const Discord = require("discord.js");
const client = new Discord.Client({ intents: [ "GUILD_MESSAGES", "GUILD_MEMBERS", "GUILDS" ] });
const config = require("./config");
client.config = config;
client.colors = {
	info    : "#89cff0",
	success : "#77ff77",
	warn    : "#fdfd96",
	error   : "#ff9691"
};
client.embedStat = {
	info    : "ℹ️ 資訊",
	success : "✅ 成功",
	warn    : "⚠️ 警告",
	error   : "❌ 錯誤"
};

const request = require("request");

client.on("ready", () => {
	console.log("注音密碼解碼機器人ready!");
});

client.on("message", message => {
	if (message.author.bot) return;

	// Guild Exception
	if (message.guild.id == "652870272814415893") return;

	if (message.content.startsWith("k3!") || message.content.startsWith("//")) return;

	message.content = message.content.replace(/<(?:@|#|:).+>/g, "");
	message.content = message.content.replace(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/g, "");
	const matches = message.content.match(/((?:1|q|a|z|2|w|s|x|e|d|c|r|f|v|5|t|g|b|y|h|n|u|j|m|5|t|g|b|y|h|n|u|j|m|8|i|k|,|9|o|l|\.|0|p|;|\/|-)(?:u|j|m|8|i|k|,|9|o|l|\.|0|p|;|\/|-)*(?:8|i|k|,|9|o|l|\.|0|p|;|\/|-|\s|6|3|4|7)(?:\s|6|3|4|7)*)/g);
	const line = [];
	if (matches)
		if (matches.length > 3) {
			const lastmatch = matches[matches.length - 1];
			const splits = message.content.split(/，|。|！|？|【|】|「|」|『|』|（|）/g);
			if (!lastmatch.endsWith(" ") && !lastmatch.endsWith("6") && !lastmatch.endsWith("3") && !lastmatch.endsWith("4") && !lastmatch.endsWith("7")) {
				matches[matches.length - 1] = matches[matches.length - 1] + " ";
				splits[splits.length - 1] = splits[splits.length - 1] + " ";
			}
			console.log(`in ${message.channel.name} in ${message.guild.name}`);
			console.log("matches", matches);
			console.log("splits", splits);

			splits.forEach((v, i) => {
				request(`https://inputtools.google.com/request?text=${encodeURI(v)}&itc=zh-hant-t-i0-und&num=1\&cp=0&cs=1&ie=utf-8&oe=utf-8&app=test`, async function (error, response, body) {
					const res = JSON.parse(body);
					if (res[0] == "SUCCESS") {
						line.push(res[1][0][1][0]);
						console.log(line);
						if (i == splits.length - 1) {
							if (line[0])
								await message.reply(`我猜你要說的是 **${line.join("")}**`, { allowedMentions: { repliedUser: false } });
							console.log("\n\n\n\n\n");
						}
					}
				});
			});

		}
});

client.on("message", message => {
	if (message.author.bot) return;

	// Guild Exception
	if (message.guild.id == "652870272814415893") return;

	if (!message.content.startsWith("//")) return;

	message.content = message.content.slice(2);
	message.content = message.content.replace(/<a?(?:@|#|:).+>/g, "");
	message.content = message.content.replace(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/g, "");

	const matches = message.content.match(/((?:1|q|a|z|2|w|s|x|e|d|c|r|f|v|5|t|g|b|y|h|n|u|j|m|5|t|g|b|y|h|n|u|j|m|8|i|k|,|9|o|l|\.|0|p|;|\/|-)(?:u|j|m|8|i|k|,|9|o|l|\.|0|p|;|\/|-)*(?:8|i|k|,|9|o|l|\.|0|p|;|\/|-|\s|6|3|4|7)(?:\s|6|3|4|7)*)/g);
	const line = [];
	if (matches) {
		const lastmatch = matches[matches.length - 1];
		if (!lastmatch.endsWith(" ") && !lastmatch.endsWith("6") && !lastmatch.endsWith("3") && !lastmatch.endsWith("4") && !lastmatch.endsWith("7"))
			matches[matches.length - 1] = matches[matches.length - 1] + " ";

		console.log(`in ${message.channel.name} in ${message.guild.name}`);
		console.log("matches", matches);

		matches.forEach((v, i) => {
			setTimeout(() => {
				request(`https://inputtools.google.com/request?text=${encodeURI(v)}&itc=zh-hant-t-i0-und&num=1\&cp=0&cs=1&ie=utf-8&oe=utf-8&app=test`, async function (error, response, body) {
					const res = JSON.parse(body);
					if (res[0] == "SUCCESS") {
						line.push(res[1][0][1][0]);
						console.log("line", line);
						if (i == matches.length - 1) if (line[0]) await message.reply(`我猜你要說的是 **${line.join("")}**`, { allowedMentions: { repliedUser: false } });
					}
				});
			}, 100);
		});

	}
});

client.login(config.token);