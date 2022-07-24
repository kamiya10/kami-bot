/* eslint-disable no-irregular-whitespace */
module.exports.run = async (CommandEvent) => {
	try {
		const subcommand = CommandEvent.command.options.getSubcommand();
		const edit = CommandEvent.command.options.getString("播放清單編號");

		configMusic.data.user[CommandEvent.user.id] ||= {
			playlist: undefined
		};
		configMusic.data.user[CommandEvent.user.id].playlist ||= {
			"1" : { name: "#1", tracks: [] },
			"2" : { name: "#2", tracks: [] },
			"3" : { name: "#3", tracks: [] },
			"4" : { name: "#4", tracks: [] }
		};
		await configMusic.write();

		const playlist = new Discord.MessageEmbed();

		if (subcommand == "添加歌曲") {
			if (!CommandEvent.client.music.get(CommandEvent.guild.id)?.connection)
				throw "ERR_NO_CONNECTION";
			if (!CommandEvent.client.music.get(CommandEvent.guild.id)?.player)
				throw "ERR_NO_PLAYER";

			const trackno = CommandEvent.command.options.getInteger("歌曲編號");
			if (!CommandEvent.client.music.get(CommandEvent.guild.id)?.queue)
				throw "ERR_QUEUE_EMPTY";

			const track = CommandEvent.client.music.get(CommandEvent.guild.id).queue[trackno - 1]?.metadata || null;
			if (!track)
				throw "ERR_TRACK_NOT_EXIST";

			configMusic.data.user[CommandEvent.user.id].playlist[edit].tracks.push(track);
			await configMusic.write();

			playlist
				.setColor(CommandEvent.client.colors.success)
				.setAuthor(CommandEvent.user.displayName, CommandEvent.user.displayAvatarURL({ dynamic: true }))
				.setTitle(CommandEvent.client.embedStat.success)
				.setDescription(`已將 \`#${trackno}\` [${track.title}](${track.url}) 添加至播放清單 \`${configMusic.data.user[CommandEvent.user.id].playlist[edit].name}\``)
				.setTimestamp();
		}

		if (subcommand == "刪除歌曲") {
			const trackno = CommandEvent.command.options.getInteger("歌曲編號");

			if (!configMusic.data.user[CommandEvent.user.id].playlist[edit].tracks[trackno - 1])
				throw "ERR_TRACK_NOT_EXIST";

			const deleted = (configMusic.data.user[CommandEvent.user.id].playlist[edit].tracks.splice(trackno - 1, 1))[0];

			playlist
				.setColor(CommandEvent.client.colors.success)
				.setAuthor(CommandEvent.user.displayName, CommandEvent.user.displayAvatarURL({ dynamic: true }))
				.setTitle(CommandEvent.client.embedStat.success)
				.setDescription(`已成功從播放清單 \`${configMusic.data.user[CommandEvent.user.id].playlist[edit].name}\` 中刪除 \`#${trackno + 1}\` [${deleted.title}](${deleted.url})`)
				.setTimestamp();
		}

		if (subcommand == "清空") {
			configMusic.data.user[CommandEvent.user.id].playlist[edit].tracks = [];
			await configMusic.write();

			playlist
				.setColor(CommandEvent.client.colors.success)
				.setAuthor(CommandEvent.user.displayName, CommandEvent.user.displayAvatarURL({ dynamic: true }))
				.setTitle(CommandEvent.client.embedStat.success)
				.setDescription(`已清空播放清單 \`${configMusic.data.user[CommandEvent.user.id].playlist[edit].name}\``)
				.setTimestamp();
		}

		if (subcommand == "儲存") {
			if (!CommandEvent.client.music.get(CommandEvent.guild.id)?.connection)
				throw "ERR_NO_CONNECTION";
			if (!CommandEvent.client.music.get(CommandEvent.guild.id)?.player)
				throw "ERR_NO_PLAYER";

			const trackno = CommandEvent.client.music.get(CommandEvent.guild.id).nowIndex + 1;
			if (!CommandEvent.client.music.get(CommandEvent.guild.id)?.queue)
				throw "ERR_QUEUE_EMPTY";

			const track = CommandEvent.client.music.get(CommandEvent.guild.id).queue[trackno - 1 ]?.metadata || null;
			if (!track)
				throw "ERR_TRACK_NOT_EXIST";

			configMusic.data.user[CommandEvent.user.id].playlist[edit].tracks.push(track);
			await configMusic.write();

			playlist
				.setColor(CommandEvent.client.colors.success)
				.setAuthor(CommandEvent.user.displayName, CommandEvent.user.displayAvatarURL({ dynamic: true }))
				.setTitle(CommandEvent.client.embedStat.success)
				.setDescription(`已將 \`#${trackno}\` [${track.title}](${track.url}) 添加至播放清單 \`${configMusic.data.user[CommandEvent.user.id].playlist[edit].name}\``)
				.setTimestamp();
		}

		if (subcommand == "儲存清單") {
			if (!CommandEvent.client.music.get(CommandEvent.guild.id)?.connection)
				throw "ERR_NO_CONNECTION";
			if (!CommandEvent.client.music.get(CommandEvent.guild.id)?.player)
				throw "ERR_NO_PLAYER";

			if (!CommandEvent.client.music.get(CommandEvent.guild.id)?.queue)
				throw "ERR_QUEUE_EMPTY";

			CommandEvent.client.music.get(CommandEvent.guild.id).queue.forEach(v => {
				configMusic.data.user[CommandEvent.user.id].playlist[edit].tracks.push(v.metadata);
			});

			await configMusic.write();

			playlist
				.setColor(CommandEvent.client.colors.success)
				.setAuthor(CommandEvent.user.displayName, CommandEvent.user.displayAvatarURL({ dynamic: true }))
				.setTitle(CommandEvent.client.embedStat.success)
				.setDescription(`已將 \`${CommandEvent.client.music.get(CommandEvent.guild.id).queue.length}\` 首歌添加至播放清單 \`${configMusic.data.user[CommandEvent.user.id].playlist[edit].name}\``)
				.setTimestamp();
		}

		if (subcommand == "清單") {
			let title = configMusic.data.user[CommandEvent.user.id].playlist[edit].tracks.map((q, i, a) => `\`${i < 9 && a.length >= 10 ? " " : ""}${i + 1}.\` \`[${q.formattedDuration}]\` [${(q.title.length > 27) ? q.title.substr(0, 26).replace(/([[\]()])/g, "\\$1") + "…" : q.title.replace(/([[\]()])/g, "\\$1")}](${q.url})`);

			if (title.length) title = getSubset(title, 0, 15);
			else title.push("​　*這裡似乎空無一物* 😢");

			playlist
				.setColor(CommandEvent.client.colors.info)
				.setAuthor(CommandEvent.user.displayName, CommandEvent.user.displayAvatarURL({ dynamic: true }))
				.setTitle(`播放清單：${configMusic.data.user[CommandEvent.user.id].playlist[edit].name}`)
				.setDescription(title.join("\n"))
				.setTimestamp();
		}

		if (subcommand == "重新命名") {
			const newname = CommandEvent.command.options.getString("新名稱");
			const oldname = configMusic.data.user[CommandEvent.user.id].playlist[edit].name;

			configMusic.data.user[CommandEvent.user.id].playlist[edit].name = newname;
			await configMusic.write();

			playlist
				.setColor(CommandEvent.client.colors.success)
				.setAuthor(CommandEvent.user.displayName, CommandEvent.user.displayAvatarURL({ dynamic: true }))
				.setTitle(CommandEvent.client.embedStat.success)
				.setDescription(`已將播放清單重新命名為 \`${newname}\`（舊名稱：\`${oldname}\`）`)
				.setTimestamp();
		}

		await CommandEvent.mi.editReply({ embeds: [playlist] });
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

		if (e == "ERR_QUEUE_EMPTY")
			embed = new Discord.MessageEmbed()
				.setColor(CommandEvent.client.colors.error)
				.setTitle(CommandEvent.client.embedStat.error)
				.setDescription("伺服器播放清單是空的")
				.setFooter(e);

		if (e == "ERR_TRACK_NOT_EXIST")
			embed = new Discord.MessageEmbed()
				.setColor(CommandEvent.client.colors.error)
				.setTitle(CommandEvent.client.embedStat.error)
				.setDescription("無效的項目")
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
	name    : "playlist",
	desc    : "播放清單",
	options : [
		{
			name        : "添加歌曲",
			description : "添加歌曲到播放清單",
			type        : "SUB_COMMAND",
			options     : [
				{
					name        : "播放清單編號",
					description : "要編輯的播放清單",
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
				},
				{
					name        : "歌曲編號",
					description : "要新增的歌曲編號，使用 /queue 來獲得歌曲編號一覽",
					type        : "INTEGER",
					required    : true
				}
			]
		},
		{
			name        : "刪除歌曲",
			description : "刪除播放清單裡的歌曲",
			type        : "SUB_COMMAND",
			options     : [
				{
					name        : "播放清單編號",
					description : "要編輯的播放清單",
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
				},
				{
					name        : "編號",
					description : "要刪除的歌曲編號，使用 /playlist 播放清單 來獲得歌曲編號一覽",
					type        : "INTEGER",
					required    : true
				}
			]
		},
		{
			name        : "清空",
			description : "清空播放清單",
			type        : "SUB_COMMAND",
			options     : [
				{
					name        : "播放清單編號",
					description : "要編輯的播放清單",
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
		{
			name        : "儲存",
			description : "將目前正在播放的項目儲存到私人播放清單",
			type        : "SUB_COMMAND",
			options     : [
				{
					name        : "播放清單編號",
					description : "要編輯的播放清單",
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
		{
			name        : "儲存清單",
			description : "將目前正在播放的播放清單儲存到私人播放清單",
			type        : "SUB_COMMAND",
			options     : [
				{
					name        : "播放清單編號",
					description : "要編輯的播放清單",
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
		{
			name        : "清單",
			description : "顯示私人播放清單",
			type        : "SUB_COMMAND",
			options     : [
				{
					name        : "播放清單編號",
					description : "要顯示的播放清單",
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
		{
			name        : "重新命名",
			description : "重新命名私人播放清單",
			type        : "SUB_COMMAND",
			options     : [
				{
					name        : "播放清單編號",
					description : "要重新命名的播放清單",
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
				},
				{
					name        : "新名稱",
					description : "給這個播放清單一個新名稱吧，最多 32 字元",
					type        : "STRING",
					required    : true
				}
			]
		}
	],
	slash : true,
	exam  : [],
	guild : true
};

function getSubset(array, value, size) {
	if (array.length <= size) return array;
	const index = array.indexOf(value) - (size - 1) / 2,
		max = Math.max(index, 0),
		min = Math.min(max, array.length - size);
	return array.slice(min, min + size);
}