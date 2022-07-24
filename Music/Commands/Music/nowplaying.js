/* eslint-disable no-irregular-whitespace */
module.exports.run = async (CommandEvent) => {
	try {
		if (!CommandEvent.client.music.get(CommandEvent.guild.id)?.connection)
			throw "ERR_NO_CONNECTION";
		if (!CommandEvent.client.music.get(CommandEvent.guild.id)?.player)
			throw "ERR_NO_PLAYER";

		const video = CommandEvent.client.music.get(CommandEvent.guild.id).player.state.resource.metadata;
		let description;
		if (video.duration == "即時串流")
			description = `[${video.title}](${video.url})\n即時串流`;
		else
			description = `\`#${CommandEvent.client.music.get(CommandEvent.guild.id).nowIndex + 1}\` [${video.title}](${video.url})\n${playbackBar(CommandEvent.client.music.get(CommandEvent.guild.id).player.state.playbackDuration, video)}`;

		const nowplaying = new Discord.MessageEmbed()
			.setColor(CommandEvent.client.colors.info)
			.setAuthor(CommandEvent.guild.name, CommandEvent.guild.iconURL({ dynamic: true }))
			.setThumbnail(video.thumbnail)
			.setTitle("🎵 正在播放")
			.setDescription(description)
			.setFooter(`${video.user.displayName} 點的歌`, video.user.user.avatarURL({ dynamic: true }))
			.setTimestamp();

		await CommandEvent.mi.editReply({ embeds: [nowplaying] });
	} catch (e) {
		let embed;
		if (e == "ERR_NO_CONNECTION")
			embed = new Discord.MessageEmbed()
				.setColor(CommandEvent.client.colors.error)
				.setTitle(CommandEvent.client.embedStat.error)
				.setDescription("我沒有連接到語音頻道")
				.setFooter(e);

		if (e == "ERR_NO_PLAYER")
			embed = new Discord.MessageEmbed()
				.setColor(CommandEvent.client.colors.error)
				.setTitle(CommandEvent.client.embedStat.error)
				.setDescription("現在沒有在放音樂")
				.setFooter(e);

		if (!embed) {
			embed = new Discord.MessageEmbed()
				.setColor(CommandEvent.client.colors.error)
				.setTitle(CommandEvent.client.embedStat.error)
				.setDescription(`發生了預料之外的錯誤：\`${e.toString()}\``)
				.setFooter("ERR_UNCAUGHT_EXCEPTION");
			console.error(e);
		}

		await CommandEvent.mi.editReply({ embeds: [embed], allowedMentions: { repliedUser: true }, ephemeral: true });
		return;
	}
};

module.exports.help = {
	name    : "nowplaying",
	desc    : "顯示目前正在播放的歌曲",
	options : [],
	exam    : [],
	guild   : true
};

function playbackBar(timeMS, video) {
	const passedTimeInMS = timeMS;
	const passedTimeInMSObj = {
		seconds : Math.floor((passedTimeInMS / 1000) % 60),
		minutes : Math.floor((passedTimeInMS / (1000 * 60)) % 60),
		hours   : Math.floor((passedTimeInMS / (1000 * 60 * 60)) % 24)
	};
	const passedTimeFormatted = formatDuration(passedTimeInMSObj);

	const totalDurationObj = video.durationObject;
	const totalDurationFormatted = formatDuration(totalDurationObj);

	let totalDurationInMS = 0;
	Object.keys(totalDurationObj).forEach((key) => {
		if (key == "hours")
			totalDurationInMS = totalDurationInMS + totalDurationObj[key] * 3600000;

		else if (key == "minutes")
			totalDurationInMS = totalDurationInMS + totalDurationObj[key] * 60000;

		else if (key == "seconds")
			totalDurationInMS = totalDurationInMS + totalDurationObj[key] * 100;

	});
	const playBackBarLocation = Math.round((passedTimeInMS / totalDurationInMS) * 10);
	let playBack = "";
	for (let i = 1; i < 11; i++)
		if (playBackBarLocation == 0) {
			playBack = ":radio_button:　　　　　　　　　";
			break;
		} else if (playBackBarLocation == 10) {
			playBack = "　　　　　　　　　:radio_button:";
			break;
		} else if (i == playBackBarLocation)
			playBack = playBack + ":radio_button:";

		else
			playBack = playBack + "　";

	playBack = `${passedTimeFormatted}  ~~​${playBack}​~~  ${totalDurationFormatted}`;
	return playBack;
}
// prettier-ignore
function formatDuration(durationObj) {
	const duration = `${durationObj.hours ? (durationObj.hours + ":") : ""}${durationObj.minutes ? durationObj.minutes : "00"
	}:${(durationObj.seconds < 10)
		? ("0" + durationObj.seconds)
		: (durationObj.seconds
			? durationObj.seconds
			: "00")
	}`;
	return duration;
}