/* eslint-disable no-irregular-whitespace */
const ytdl = require("ytdl-core");
const { SoundCloud } = require("scdl-core");
const DiscordVoice = require("@discordjs/voice");
const Discord = require("discord.js");
const { SongResource } = require("../../Classes/SongResource");
/**
 * @type {SoundCloud}
 */
let scdl;
// const youTube = require("simple-youtube-api");
// const Youtube = new youTube();

module.exports.run = async (CommandEvent) => {
	try {
		const subcommand = CommandEvent.command.options.getSubcommand(false);
		const url = CommandEvent.command.options.getString("連結或關鍵字");
		const volume = CommandEvent.command.options.getInteger("音量");
		scdl ||= await SoundCloud.create();

		if (!url && subcommand == "輸入")
			throw "ERR_INVAILD_PARAMETER";

		if (!CommandEvent.user.voice.channel)
			throw "ERR_USER_NOT_IN_VOICE";

		if (CommandEvent.mi.guild.me.voice.channel)
			if (CommandEvent.mi.guild.me.voice.channel.id != CommandEvent.user.voice.channel.id)
				throw "ERR_USER_NOT_IN_SAME_VOICE";

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
		let search = false;

		const emoji = [
			"1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣",
			"6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟",
			"<:eleven:889461885701873685>",
			"<:twelve:889461885928366110>",
			"<:thirteen:889461885936762881>",
			"<:fourteen:889461886075166720>",
			"<:fifteen:889461886679146536>",
			"<:sixteen:889461885798318130>",
			"<:seventeen:889461886515576853>",
			"<:eighteen:889461886733668352>",
			"<:nineteen:889461886536515615>",
			"<:twenty:889461886565888021>"
		];
		const embed = new Discord.MessageEmbed();
		const buttonRow = new Discord.MessageActionRow();
		const menuRow = new Discord.MessageActionRow();

		const vidResources = [];

		if (subcommand == "輸入")
			if (url.startsWith("http")) {
				if (url.match(/^(?!.*\?.*\bv=)https:\/\/www\.youtube\.com\/.*\?.*\blist=.*$/)) {
				//#region 播放清單
					const playlist = await Youtube.getPlaylist(url).catch(() => {
						throw "ERR_PLAYLIST_NOT_EXIST";
					});
					const videosArr = await playlist.getVideos().catch(() => {
						throw "ERR_FETCH_PLAYLIST_VIDEO";
					});

					let songs = [];
					for (let i = 0; i < videosArr.length; i++)
						if (videosArr[i].raw.status.privacyStatus == "private")
							continue;
						else
							try {
								const video = await videosArr[i].fetch();
								GuildMusicData.queue.push(new SongResource("youtube", `https://www.youtube.com/watch?v=${video.raw.id}`, video, CommandEvent.user, CommandEvent.channel, playlist));

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
					// if (video.raw.snippet.liveBroadcastContent === "live")
					// 	throw "ERR_NOT_SUPPORTED@LIVESTREAM";

					GuildMusicData.queue.push(new SongResource("youtube", `https://www.youtube.com/watch?v=${video.raw.id}`, video, CommandEvent.user, CommandEvent.channel));

					embed
						.setColor(CommandEvent.client.colors.success)
						.setAuthor(CommandEvent.guild.name, CommandEvent.guild.iconURL({ dynamic: true }))
						.setTitle(CommandEvent.client.embedStat.success)
						.setDescription(`:musical_note: [${video.title}](${video.url}) 已加到播放清單`)
						.setThumbnail(video.thumbnails.high.url)
						.setFooter(CommandEvent.user.displayName, CommandEvent.user.user.avatarURL({ dynamic: true }))
						.setTimestamp();
				//#endregion
				} else if (url.match(/^(http(s)?:\/\/)?((w){3}.soundcloud\.com)?/)) {
					console.log(url);
					const track = await scdl.tracks.getTrack(url);
					const meta = {
						url       : url,
						title     : track.title,
						duration  : track.duration,
						thumbnail : track.artwork_url
					};
					GuildMusicData.queue.push(new SongResource("soundcloud", url, meta, CommandEvent.user, CommandEvent.channel));

					embed
						.setColor(CommandEvent.client.colors.success)
						.setAuthor(CommandEvent.guild.name, CommandEvent.guild.iconURL({ dynamic: true }))
						.setTitle(CommandEvent.client.embedStat.success)
						.setDescription(`:musical_note: [${meta.title}](${meta.url}) 已加到播放清單`)
						.setThumbnail(meta.thumbnail)
						.setFooter(CommandEvent.user.displayName, CommandEvent.user.user.avatarURL({ dynamic: true }))
						.setTimestamp();
				} else if (url.startsWith("http"))
				//#region 網址
					throw "ERR_INVALID_PARAMETER@URL";
				//#endregion
			} else {
				search = true;
				const videos = await Youtube.searchVideos(url, 20).catch(() => {
					throw "ERR_SEARCH_ERROR";
				});

				if (!videos)
					throw "ERR_SEARCH_NO_RESULT";

				/**
					 * @type {SongResource[]}
					 */
				for (let v of videos) {
					v = await v.fetch();
					vidResources.push(new SongResource("youtube", `https://www.youtube.com/watch?v=${v.raw.id}`, v, CommandEvent.user, CommandEvent.channel, null, v.channel));
				}

				const menuOptions = vidResources.map((v, i) => {
					try{
						return {
							label       : v.title,
							value       : `${i}`,
							description : `${v.duration} | ${v.channel.title}`,
							emoji       : emoji[i]
						};
					}catch(e) {
						console.error(e);
						console.error(v);
					}
				});
				menuRow
					.addComponents(
						new Discord.MessageSelectMenu()
							.setCustomId("selectSearchResult")
							.setPlaceholder("選取影片...")
							.addOptions(menuOptions)
					);
				buttonRow
					.addComponents(
						new Discord.MessageButton()
							.setCustomId("addToQueue")
							.setLabel("加到播放清單")
							.setStyle("SUCCESS")
							.setDisabled(true)
					)
					.addComponents(
						new Discord.MessageButton()
							.setCustomId("cancel")
							.setLabel("取消")
							.setStyle("SECONDARY")
					);

				embed
					.setColor(CommandEvent.client.colors.info)
					.setAuthor(CommandEvent.guild.name, CommandEvent.guild.iconURL({ dynamic: true }))
					.setTitle(`搜尋：${url}`)
					.setDescription("請從下拉選單選取影片")
					.setTimestamp();
			}
		else {
			const playlistno = CommandEvent.command.options.getString("播放清單編號");
			configMusic.data.user[CommandEvent.user.id].playlist[playlistno].tracks.forEach(v => {
				GuildMusicData.queue.push(new SongResource(v.type, v.url, v, CommandEvent.user, CommandEvent.channel));
			});

			embed
				.setColor(CommandEvent.client.colors.success)
				.setAuthor(CommandEvent.guild.name, CommandEvent.guild.iconURL({ dynamic: true }))
				.setTitle(CommandEvent.client.embedStat.success)
				.setDescription(`:musical_note: 已將 \`${configMusic.data.user[CommandEvent.user.id].playlist[playlistno].name}\` 加到播放清單`)
				.setFooter(CommandEvent.user.displayName, CommandEvent.user.user.avatarURL({ dynamic: true }))
				.setTimestamp();
		}
		// 加入語音頻道
		if (!GuildMusicData.connection || GuildMusicData.connection.state.status == "signalling")
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
		else if (GuildMusicData.player.state.status == "idle")
			playSong(GuildMusicData);

		await CommandEvent.mi.editReply(search ? { embeds: [embed], components: [ menuRow, buttonRow ] } : { embeds: [embed] });
		const message = await CommandEvent.mi.fetchReply();

		if (search) {
			let selectedIndex = null;
			const collector = message.createMessageComponentCollector({ time: 900000 });
			collector.on("collect", async i => {
				if (i.isSelectMenu()) {
					selectedIndex = +i.values[0];
					const vid = vidResources[selectedIndex];
					const videoembed = new Discord.MessageEmbed()
						.setColor(CommandEvent.client.colors.info)
						.setAuthor(CommandEvent.guild.name, CommandEvent.guild.iconURL({ dynamic: true }))
						.setTitle(`搜尋：${url}`)
						.setDescription(`\`#${selectedIndex + 1}\` **[${vid.title}](${vid.url})**`)
						.addField("頻道", vid.channel.title, true)
						.addField("長度", vid.duration, true)
						.setImage(vid.thumbnail);

					const menuOptions = vidResources.map((v, i) => {
						return {
							label       : v.title,
							value       : `${i}`,
							description : `${v.duration} | ${v.channel.title}`,
							emoji       : emoji[i],
							default     : i == selectedIndex ? true : false
						};
					});

					menuRow
						.spliceComponents(0, 1,
							new Discord.MessageSelectMenu()
								.setCustomId("selectSearchResult")
								.setPlaceholder("選取影片...")
								.addOptions(menuOptions)
						);

					buttonRow
						.spliceComponents(0, 1,
							new Discord.MessageButton()
								.setDisabled(false)
								.setStyle("SUCCESS")
								.setCustomId("addToQueue")
								.setLabel("加到播放清單")
						);
					await i.update({ embeds: [videoembed], components: [ menuRow, buttonRow ] });
				} else if (i.isButton())
					if (i.customId == "addToQueue") {
						const vid = vidResources[selectedIndex];
						GuildMusicData.queue.push(vid);

						if (GuildMusicData.player.state.status == "idle") {
							GuildMusicData.nowIndex = GuildMusicData.queue.indexOf(vid);
							playSong(GuildMusicData, true);
						}

						const addedEmbed = new Discord.MessageEmbed()
							.setColor(CommandEvent.client.colors.success)
							.setAuthor(CommandEvent.guild.name, CommandEvent.guild.iconURL({ dynamic: true }))
							.setTitle(CommandEvent.client.embedStat.success)
							.setDescription(`:musical_note: [${vid.title}](${vid.url}) 已加到播放清單`)
							.setThumbnail(vid.thumbnail)
							.setFooter(CommandEvent.user.displayName, CommandEvent.user.user.avatarURL({ dynamic: true }))
							.setTimestamp();

						await i.update({ embeds: [addedEmbed], components: [] });
					} else {
						message.delete();
						collector.stop();
					}
			});
		}
	} catch (e) {
		let embed;
		if (e == "ERR_INVAILD_PARAMETER")
			embed = new Discord.MessageEmbed()
				.setColor(CommandEvent.client.colors.error)
				.setTitle(CommandEvent.client.embedStat.error)
				.setDescription("沒有提供連結")
				.setFooter(e);

		if (e == "ERR_USER_NOT_IN_VOICE")
			embed = new Discord.MessageEmbed()
				.setColor(CommandEvent.client.colors.error)
				.setTitle(CommandEvent.client.embedStat.error)
				.setDescription("你必須在語音頻道內才能使用這個指令")
				.setFooter(e);

		if (e == "ERR_USER_NOT_IN_SAME_VOICE")
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

		if (e == "ERR_SEARCH_ERROR")
			embed = new Discord.MessageEmbed()
				.setColor(CommandEvent.client.colors.error)
				.setTitle(CommandEvent.client.embedStat.error)
				.setDescription("搜尋的時候發生錯誤")
				.setFooter(e);

		if (e == "ERR_SEARCH_NO_RESULT")
			embed = new Discord.MessageEmbed()
				.setColor(CommandEvent.client.colors.error)
				.setTitle(CommandEvent.client.embedStat.error)
				.setDescription("提供的關鍵字找不到任何結果，可以提供更多來查詢")
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

		await CommandEvent.mi.editReply({ embeds: [embed], allowedMentions: { repliedUser: true } });
		return;
	}
};

module.exports.help = {
	name    : "play",
	desc    : "播放音樂",
	options : [
		{
			name        : "輸入",
			description : "添加音樂到伺服器播放清單",
			type        : "SUB_COMMAND",
			options     : [
				{
					name        : "連結或關鍵字",
					description : "Youtube 影片連結或播放清單或是搜尋關鍵字",
					type        : "STRING",
					required    : true
				},
				{
					name        : "音量",
					description : "音量，單位：%",
					type        : "INTEGER",
					required    : false
				},
			]
		},
		{
			name        : "播放清單",
			description : "將私人播放清單添加到伺服器播放清單",
			type        : "SUB_COMMAND",
			options     : [
				{
					name        : "播放清單編號",
					description : "要添加的播放清單",
					type        : "STRING",
					required    : true,
					choices     : [
						{
							name  : "#1",
							value : "1"
						},
						{
							name  : "#2",
							value : "2"
						},
						{
							name  : "#3",
							value : "3"
						},
						{
							name  : "#4",
							value : "4"
						}
					]
				}
			]
		},
	],
	slash : true,
	exam  : ["`連結:`https://www.Youtube.com/watch?v=4HBIxZ5Bs7c&t=44s"],
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
		console.error(error);
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

module.exports.play = async function play(GuildMusicData) {
	try {
		if (GuildMusicData.nowIndex < 0) GuildMusicData.nowIndex = 0;
		const stream =
				(GuildMusicData.queue[GuildMusicData.nowIndex].type == "youtube")
					? ytdl(GuildMusicData.queue[GuildMusicData.nowIndex].url,
						{
							filter        : format => format.contentLength,
							quality       : "highestaudio",
							highWaterMark : 1 << 25
						}
					)
					: await scdl.download(GuildMusicData.queue[GuildMusicData.nowIndex].url,
						{
							highWaterMark: 1 << 25
						});
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