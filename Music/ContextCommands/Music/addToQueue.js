/* eslint-disable no-irregular-whitespace */
const ytdl = require("ytdl-core");
const DiscordVoice = require("@discordjs/voice");
const Discord = require("discord.js");
const { SongResource } = require("../../Classes/SongResource");
//const youTube = require("simple-youtube-api");
//const Youtube = new youTube();

module.exports.run = async (CommandEvent) => {
	try {
		const url = CommandEvent.mi.target.content;
		const volume = 60;
		if (!url)
			throw "ERR_INVAILD_PARAMETER";

		if (!CommandEvent.user.voice.channel)
			throw "USER_NOT_IN_VOICE";

		if (CommandEvent.mi.guild.me.voice.channel)
			if (CommandEvent.mi.guild.me.voice.channel.id != CommandEvent.user.voice.channel.id)
				throw "USER_NOT_IN_SAME_VOICE";

		if (volume < 0)
			throw "ERR_INVALID_PARAMETER@VOLUME";

		if (!CommandEvent.client.music.has(CommandEvent.guild.id))
			CommandEvent.client.music.set(CommandEvent.guild.id, {
				connection  : null,
				player      : null,
				queue       : [],
				nowIndex    : 0,
				mode        : 0,
				volume      : volume != null ? volume / 100 : 1,
				clientMusic : CommandEvent.client.music,
				guild       : CommandEvent.guild
			});

		/**
		 * @type {{ connection: DiscordVoice.VoiceConnection, player: DiscordVoice.AudioPlayer, queue: [], nowIndex: number, mode: 0 | 1 | 2 | 3, volume: number, clientMusic: Discord.Collection, guild: Discord.Guild }}
		 */
		const GuildMusicData = CommandEvent.client.music.get(CommandEvent.guild.id);
		const checkplay = !GuildMusicData.queue.length;

		const embed = new Discord.MessageEmbed();

		if (url.match(/^(?!.*\?.*\bv=)https:\/\/www\.youtube\.com\/.*\?.*\blist=.*$/)) {
			//#region 播放清單
			const playlist = await Youtube.getPlaylist(url).catch(() => {
				throw "ERR_PLAYLIST_NOT_EXIST";
			});
			const videosArr = await playlist.getVideos().catch(() => {
				throw "ERR_FETCH_PLAYLIST_VIDEO";
			});

			await CommandEvent.mi.deferReply();
			CommandEvent.mi.replied = true;

			let songs = [];
			for (let i = 0; i < videosArr.length; i++)
				if (videosArr[i].raw.status.privacyStatus == "private")
					continue;
				else
					try {
						const video = await videosArr[i].fetch();
						GuildMusicData.queue.push(new SongResource("youtube", url, video, CommandEvent.user, CommandEvent.channel, playlist));

						songs.push(`${i + 1}. [${(video.title.length > 32) ? video.title.substr(0, 31) + "…" : video.title}](${video.url})`);

					} catch (err) {
						return console.error(err);
					}

			if (songs.length > 10) {
				const total = songs.length;
				songs = songs.slice(0, 10);
				songs.push(`　...還有 ${total - songs.length} 項`);
			}

			embed
				.setColor(CommandEvent.client.colors.success)
				.setAuthor(CommandEvent.guild.name, CommandEvent.guild.iconURL({ dynamic: true }))
				.setTitle(CommandEvent.client.embedStat.success)
				.setThumbnail(playlist?.thumbnails?.high?.url)
				.setDescription(`:musical_note: [${playlist.title}](${playlist.url}) 已加到播放清單`)
				.addField("已新增", songs.join("\n"))
				.setFooter(CommandEvent.user.displayName, CommandEvent.user.user.avatarURL({ dynamic: true }))
				.setTimestamp();

			//#endregion
		} else if (url.match(/^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/)) {
			//#region 影片

			const query = url
				.replace(/(>|<)/gi, "")
				.split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
			const id = query[2].split(/[^0-9a-z_-]/i)[0];
			const video = await Youtube.getVideoByID(id).catch(e => {
				console.error(e);
				throw "ERR_FETCH_VIDEO";
			});

			// 不支援直播
			if (video.raw.snippet.liveBroadcastContent === "live")
				throw "ERR_NOT_SUPPORTED@LIVESTREAM";

			GuildMusicData.queue.push(new SongResource("youtube", url, video, CommandEvent.user, CommandEvent.channel));

			embed
				.setColor(CommandEvent.client.colors.success)
				.setAuthor(CommandEvent.guild.name, CommandEvent.guild.iconURL({ dynamic: true }))
				.setTitle(CommandEvent.client.embedStat.success)
				.setDescription(`:musical_note: [${video.title}](${video.url}) 已加到播放清單`)
				.setThumbnail(video.thumbnails.high.url)
				.setFooter(CommandEvent.user.displayName, CommandEvent.user.user.avatarURL({ dynamic: true }))
				.setTimestamp();
			//#endregion
		} else throw "ERR_INVALID_PARAMETER@URL";

		// 加入語音頻道
		if (!GuildMusicData.connection)
			GuildMusicData.connection = DiscordVoice.joinVoiceChannel({
				channelId      : CommandEvent.user.voice.channel.id,
				guildId        : CommandEvent.guild.id,
				adapterCreator : CommandEvent.guild.voiceAdapterCreator,
			});

		const player = GuildMusicData.player || DiscordVoice.createAudioPlayer();
		GuildMusicData.player = player;

		GuildMusicData.connection.subscribe(player);

		if (checkplay)
			startPlaying(CommandEvent);
		else if (GuildMusicData.player.state == "idle")
			playSong(GuildMusicData);

		const sent = CommandEvent.mi.replied
			? await CommandEvent.mi.editReply({ embeds: [embed], fetchReply: true })
			: await CommandEvent.mi.editReply({ embeds: [embed], fetchReply: true });
		setTimeout(async () => {
			await sent.delete().catch(() => {});
		}, 5000);
	} catch (e) {
		let embed;
		if (e == "ERR_INVAILD_PARAMETER")
			embed = new Discord.MessageEmbed()
				.setColor(CommandEvent.client.colors.error)
				.setTitle(CommandEvent.client.embedStat.error)
				.setDescription("沒有提供連結")
				.setFooter(e);

		if (e == "USER_NOT_IN_VOICE")
			embed = new Discord.MessageEmbed()
				.setColor(CommandEvent.client.colors.error)
				.setTitle(CommandEvent.client.embedStat.error)
				.setDescription("你必須在語音頻道內才能使用這個指令")
				.setFooter(e);

		if (e == "USER_NOT_IN_SAME_VOICE")
			embed = new Discord.MessageEmbed()
				.setColor(CommandEvent.client.colors.error)
				.setTitle(CommandEvent.client.embedStat.error)
				.setDescription("你和我在同一個語音頻道內才能使用這個指令")
				.setFooter(e);

		if (e == "ERR_PLAYLIST_NOT_EXIST")
			embed = new Discord.MessageEmbed()
				.setColor(CommandEvent.client.colors.error)
				.setTitle(CommandEvent.client.embedStat.error)
				.setDescription("播放清單不存在或未公開")
				.setFooter(e);

		if (e == "ERR_FETCH_PLAYLIST_VIDEO")
			embed = new Discord.MessageEmbed()
				.setColor(CommandEvent.client.colors.error)
				.setTitle(CommandEvent.client.embedStat.error)
				.setDescription("獲取播放清單中的影片時發生錯誤")
				.setFooter(e);

		if (e == "ERR_FETCH_VIDEO")
			embed = new Discord.MessageEmbed()
				.setColor(CommandEvent.client.colors.error)
				.setTitle(CommandEvent.client.embedStat.error)
				.setDescription("獲取影片資訊時發生錯誤")
				.setFooter(e);

		if (e == "ERR_NOT_SUPPORTED@LIVESTREAM")
			embed = new Discord.MessageEmbed()
				.setColor(CommandEvent.client.colors.error)
				.setTitle(CommandEvent.client.embedStat.error)
				.setDescription("不支援即時串流")
				.setFooter(e);

		if (e == "ERR_INVALID_PARAMETER@VOLUME")
			embed = new Discord.MessageEmbed()
				.setColor(CommandEvent.client.colors.error)
				.setTitle(CommandEvent.client.embedStat.error)
				.setDescription("音量必須為正數")
				.setFooter(e);

		if (e == "ERR_INVALID_PARAMETER@URL")
			embed = new Discord.MessageEmbed()
				.setColor(CommandEvent.client.colors.error)
				.setTitle(CommandEvent.client.embedStat.error)
				.setDescription("未知的連結。請輸入 Youtube 影片或播放清單連結")
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
	name    : "加到播放清單",
	options : [
		{
			name        : "連結",
			description : "Youtube 影片連結或播放清單",
			type        : "STRING",
			required    : true
		},
		{
			name        : "音量",
			description : "音量，單位：%",
			type        : "INTEGER",
			required    : false
		}
	],
	exam  : [],
	guild : true
};

function startPlaying(CommandEvent) {
	/**
	 * @type {{ connection: DiscordVoice.VoiceConnection, player: DiscordVoice.AudioPlayer, queue: [], nowIndex: number, mode: 0 | 1 | 2 | 3, volume: number, clientMusic: Discord.Collection, guild: Discord.Guild }}
	 */
	const GuildMusicData = CommandEvent.client.music.get(CommandEvent.guild.id);
	const { connection, player } = GuildMusicData;

	connection.on("disconnected", async () => {
		try {
			await Promise.race([
				DiscordVoice.entersState(connection, DiscordVoice.VoiceConnectionStatus.Signalling, 5_000),
				DiscordVoice.entersState(connection, DiscordVoice.VoiceConnectionStatus.Connecting, 5_000),
			]);
		} catch (error) {
			connection.destroy();
			GuildMusicData.connection = null;
		}
	});

	connection.on("ready", () => {
		if (GuildMusicData.queue.length)
			playSong(GuildMusicData, true);
	});

	player.on("idle", () => {
		GuildMusicData.queue[GuildMusicData.nowIndex < 0 ? 0 : GuildMusicData.nowIndex].resource = null;
		playSong(GuildMusicData);
	});

	player.on("playing", () => {
		console.log(`正在播放: ${GuildMusicData.queue[GuildMusicData.nowIndex].title}`);
		CommandEvent.client.webhookLoggerString.push(`🎵 **[Player]** 正在 ${CommandEvent.guild.name} 播放: ${GuildMusicData.queue[GuildMusicData.nowIndex].title}`);
	});

	player.on("error", error => {
		console.error(`錯誤: ${error.message} with resource ${error.resource.metadata.title}`);
		CommandEvent.client.webhookLoggerString.push(`🎵 **[Player]** ❌ 發生錯誤: ${error.message}`);
	});

	connection.on("stateChange", (oldState, newState) => {
		console.log(`語音連線狀態: ${oldState.status} → ${newState.status}`);
		if (oldState.status == "connecting" && newState.status == "ready")
			CommandEvent.client.webhookLoggerString.push(`🎵 **[Player]** 📥 已加入頻道 #${CommandEvent.client.channels.cache.get(connection.joinConfig.channelId).name} <#${connection.joinConfig.channelId}>`);
	});

	player.on("stateChange", (oldState, newState) => {
		console.log(`播放器狀態: ${oldState.status} → ${newState.status}`);
	});

	connection.on("destroyed", () => {
		GuildMusicData.clientMusic.delete(GuildMusicData.guild.id);
	});
	//#endregion
}

function playSong(GuildMusicData, force = false) {
	if (force || GuildMusicData.mode == 2)
		module.exports.play(GuildMusicData);
	else if (GuildMusicData.mode == 0) {
		if (GuildMusicData.nowIndex < (GuildMusicData.queue.length - 1)) {
			GuildMusicData.nowIndex += 1;
			module.exports.play(GuildMusicData);
		}
	} else if (GuildMusicData.mode == 1) {
		GuildMusicData.nowIndex += 1;
		if (GuildMusicData.nowIndex > (GuildMusicData.queue.length - 1)) GuildMusicData.nowIndex = 0;
		module.exports.play(GuildMusicData);
	} else if (GuildMusicData.mode == 3) {
		GuildMusicData.nowIndex = Math.round(Math.random() * (GuildMusicData.queue.length - 1));
		module.exports.play(GuildMusicData);
	}
}

module.exports.play = function play(GuildMusicData) {
	try {
		if (GuildMusicData.nowIndex < 0) GuildMusicData.nowIndex = 0;
		const stream = ytdl(GuildMusicData.queue[GuildMusicData.nowIndex].url,
			{
				filter        : format => format.contentLength,
				quality       : "highestaudio",
				highWaterMark : 1 << 25
			}
		);
		GuildMusicData.queue[GuildMusicData.nowIndex].resource = DiscordVoice.createAudioResource(stream,
			{
				inlineVolume : true,
				metadata     : GuildMusicData.queue[GuildMusicData.nowIndex]
			}
		);
		GuildMusicData.queue[GuildMusicData.nowIndex].resource.volume.setVolume(GuildMusicData.volume * 0.5);
		GuildMusicData.player.play(GuildMusicData.queue[GuildMusicData.nowIndex].resource);
	} catch (e) {
		e.stack.split("\n").forEach(s => console.error(s));
	}
};