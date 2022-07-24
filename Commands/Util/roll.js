const mathjs = require("mathjs");
module.exports.run = async (CommandEvent) => {
	try {
		const c = CommandEvent.command.options.getInteger("個數") || 1;
		const d = (CommandEvent.command.options.getInteger("面數") || 6) - 1;
		const operator = CommandEvent.command.options.getString("算法") || "+";
		const operatoruni = CommandEvent.command.options.getString("算法") == "*" ? "×" : CommandEvent.command.options.getString("算法") == "/" ? "÷" : CommandEvent.command.options.getString("算法") || "+";

		const dieuni = [ "<:dice_1:886444617803915295> ", "<:dice_2:886444618072350720> ", "<:dice_3:886444617690656849> ", "<:dice_4:886444617954902036> ", "<:dice_5:886444618055553034> ", "<:dice_6:886444618139443252> ", "<:dice_question:886444618126868500> " ];
		const die = [];
		const dies = [];
		for (let i = 0; i < c; i++) {
			die.push(Math.ceil(Math.random() * d));
			dies.push((die[i] > 6 ? dieuni[6] : dieuni[die[i] - 1]) + "**" + die[i].toString() + "**");
		}

		const result = mathjs.evaluate(die.join(operator));
		const roll = new Discord.MessageEmbed()
			.setColor(CommandEvent.client.colors.info)
			.setDescription(`${dies.join("　")}\n\n結果: ${die.join(` ${operatoruni} `)} = **${result}**`);

		if (roll.description.length > 2000) roll.setDescription(`結果: **${result}**`);
		await CommandEvent.mi.editReply({ embeds: [roll] });

		return;
	} catch (e) {
		let embed;
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
	name    : "roll",
	desc    : "擲骰(ㄊㄡˊ)子",
	options : [
		{
			name        : "個數",
			description : "要擲幾顆骰子",
			type        : "INTEGER",
			required    : false
		},
		{
			name        : "面數",
			description : "每個骰子的面數",
			type        : "INTEGER",
			required    : false
		},
		{
			name        : "算法",
			description : "計算方式",
			type        : "STRING",
			required    : false,
			choices     : [
				{
					"name"  : "加法 +",
					"value" : "+"
				},
				{
					"name"  : "減法 -",
					"value" : "-"
				},
				{
					"name"  : "乘法 ×",
					"value" : "*"
				},
				{
					"name"  : "除法 ÷",
					"value" : "/"
				},
				{
					"name"  : "次方 ^",
					"value" : "^"
				}
			]
		}
	],
	slash : true,
	exam  : [ "", "`個數:`5 `算法:`乘法 ×" ],
	guild : true
};