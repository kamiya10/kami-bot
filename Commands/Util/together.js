// const CommandEvent = require("../../Classes/CommandEvent.js").CommandEvent;
/**
 *
 * @param {import("../../Classes/CommandEvent.js").CommandEvent} CommandEvent
 * @returns
 */
module.exports.run = async (CommandEvent) => {
	try {
		const game = CommandEvent.command.options.getString("活動");
		const games = {
			youtube    : "Watch Together",
			youtubedev : "Watch Together Dev",
			poker      : "Poker Night",
			betrayal   : "Betrayal\\.io",
			fishing    : "Fishington\\.io",
			chess      : "Chess In The Park",
			chessdev   : "Chess In The Park Dev",
			lettertile : "Letter Tile",
			wordsnack  : "Word Snack",
			doodlecrew : "Doodle Crew",
			awkword    : "Awkword",
			spellcast  : "Spell Cast"
		};

		if (!CommandEvent.user.voice.channel)
			throw "ERR_USER_NOT_IN_VOICE";

		const invite = await CommandEvent.client.together.createTogetherCode(CommandEvent.user.voice.channel.id, game);

		await CommandEvent.mi.editReply({ content: `點擊下方連結開始 **${games[game]}** 活動\n${invite.code}` });
	} catch (e) {
		let embed;
		if (e == "ERR_USER_NOT_IN_VOICE")
			embed = new Discord.MessageEmbed()
				.setColor(CommandEvent.client.colors.error)
				.setTitle(CommandEvent.client.embedStat.error)
				.setDescription("你必須在語音頻道內才能使用這個指令")
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
	name    : "together",
	desc    : "開始語音活動",
	options : [
		{
			name        : "活動",
			description : "要開始的活動",
			type        : "STRING",
			required    : true,
			choices     : [
				{
					name  : "Watch Together | 一起看影片",
					value : "youtube"
				},
				{
					name  : "Watch Together Dev | 一起看影片 (開發人員)",
					value : "youtubedev"
				},
				{
					name  : "Poker Night | 撲克之夜",
					value : "poker"
				},
				{
					name  : "Betrayal.io | 戰爭",
					value : "betrayal"
				},
				{
					name  : "Fishington.io | 釣魚",
					value : "fishing"
				},
				{
					name  : "Chess In The Park | 在公園下西洋棋",
					value : "chess"
				},
				{
					name  : "Chess In The Park Dev | 在公園下西洋棋 (開發人員)",
					value : "chessdev"
				},
				{
					name  : "Letter Tile | 拼字遊戲",
					value : "lettertile"
				},
				{
					name  : "Word Snack | 湊字遊戲",
					value : "wordsnack"
				},
				{
					name  : "Doodle Crew | 你畫我猜",
					value : "doodlecrew"
				},
				{
					name  : "Awkword | 黃牌",
					value : "awkword"
				},
				{
					name  : "Spell Cast | 類似 Wordament 的遊戲",
					value : "spellcast"
				}
			]
		}
	],
	slash : true,
	exam  : ["`標記:`同一語音頻道"]
};