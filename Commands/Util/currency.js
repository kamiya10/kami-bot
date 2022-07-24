const fetch = require("node-fetch");

const name = {
	USD  : "美金",
	EUR  : "歐元",
	JPY  : "日幣",
	HKD  : "港幣",
	GBP  : "英鎊",
	CHF  : "瑞士法郎",
	CNY  : "人民幣",
	CNH  : "離岸人民幣",
	KRW  : "韓元",
	AUD  : "澳幣",
	NZD  : "紐幣",
	SGD  : "新加坡幣",
	THB  : "泰銖",
	SEK  : "瑞典幣",
	MYR  : "馬來幣",
	CAD  : "加拿大幣",
	VND  : "越南盾",
	MOP  : "澳門幣",
	PHP  : "菲律賓比索",
	INR  : "印度盧幣",
	IDR  : "印尼盾",
	DKK  : "丹麥克朗",
	ZAR  : "南非蘭特",
	MXN  : "墨西哥披索",
	TRY  : "土耳其里拉",
	TWD  : "台幣",
	BTC  : "比特幣",
	LTC  : "萊特幣",
	DOGE : "狗幣"

};

module.exports.run = async (CommandEvent) => {
	try {
		const value = CommandEvent.command.options.getNumber("輸入") || 1;
		const convert = (CommandEvent.command.options.getString("輸入貨幣") || "TWD").toUpperCase();
		const to = (CommandEvent.command.options.getString("輸出貨幣") || "USD").toUpperCase();

		console.log({
			from   : convert,
			to     : to,
			amount : value
		});

		const rates = await fetch("https://tw.rter.info/capi.php").then(r => r.json(), e => { throw e; });

		if ((convert != "USD" && !Object.keys(rates).includes(`USD${convert}`)) || !Object.keys(rates).includes(`USD${to}`))
			throw "ERR_NOT_SUPPORTED";

		const rate = convert == "USD" ? rates[`USD${to}`].Exrate : rates[`USD${to}`].Exrate / rates[`USD${convert}`].Exrate;

		console.log(rate, value * rate);

		const currency = new Discord.MessageEmbed()
			.setColor(CommandEvent.client.colors.info)
			.setTitle("💰 貨幣換算")
			.setURL(`https://tw.rter.info/exchange/${convert}-${to}.html?price=${value}`)
			.setDescription(`${name[convert]}(${convert}) → ${name[to]}(${to})`)
			.addField("換算結果", `\`${value}\` ${convert} → \`${Math.round(value * rate * 1000) / 1000}\` ${to}\n匯率：\`${rate}\``)
			.setFooter("匯率來源：即匯站")
			.setTimestamp();

		await CommandEvent.mi.editReply({ embeds: [currency] });
		return;
	} catch (e) {
		let embed;
		if (e == "ERR_NOT_SUPPORTED")
			embed = new Discord.MessageEmbed()
				.setColor(CommandEvent.client.colors.error)
				.setTitle(CommandEvent.client.embedStat.error)
				.setDescription("不支援的貨幣")
				.setFooter(e);

		if (!embed) {
			embed = new Discord.MessageEmbed()
				.setColor(CommandEvent.client.colors.error)
				.setTitle(CommandEvent.client.embedStat.error)
				.setDescription(`發生了預料之外的錯誤：\`${e.toString()}\``)
				.setFooter("ERR_UNCAUGHT_EXCEPTION");
			console.error(e);
		}

		await CommandEvent.mi.editReply({ embeds: [embed], allowedMentions: { repliedUser: true } });
		return;
	}
};

module.exports.help = {
	name    : "currency",
	desc    : "換算幣值",
	options : [
		{
			name        : "輸入",
			description : "貨幣幣值",
			type        : "NUMBER",
			required    : false
		},
		{
			name        : "輸入貨幣",
			description : "要轉換的貨幣",
			type        : "STRING",
			required    : false,
		},
		{
			name        : "輸出貨幣",
			description : "要轉換成的貨幣",
			type        : "STRING",
			required    : false
		}
	],
	slash : true,
	exam  : [ "", "`個數:`5 `算法:`乘法 ×" ],
	guild : true,
	wip   : true
};