class SongResource {
	constructor(type, url, meta, user, textChannel, playlist = null, channel = null) {
		this.rawDuration = meta.duration;

		if (type == "youtube") {
			let duration = this.formatDuration(meta.duration);
			if (duration == "00:00") duration = "即時串流";

			this.title = meta.title;
			this.durationObject = meta.duration;
			this.duration = duration;
			this.thumbnail = meta?.thumbnails?.high?.url || meta.thumbnail;
		} else if (type == "soundcloud") {
			meta.duration = Math.round(meta.duration / 1000);
			const durationObject = {
				years   : Math.floor(meta.duration / 60 / 60 / 24 / 365),
				months  : Math.floor(meta.duration / 60 / 60 / 24 / 31),
				weeks   : Math.floor(meta.duration / 60 / 60 / 24 / 7),
				days    : Math.floor(meta.duration / 60 / 60 / 24),
				hours   : Math.floor(meta.duration / 60 / 60),
				minutes : Math.floor(meta.duration / 60),
				seconds : meta.duration % 60
			};

			let duration = this.formatDuration(durationObject);
			if (duration == "00:00") duration = "即時串流";

			this.title = meta.title;
			this.durationObject = durationObject;
			this.duration = duration;
			this.thumbnail = meta.thumbnail;
		}

		this.type = type;
		this.url = url;
		this.user = user;
		this.channel = channel;
		this.messageChannel = textChannel;
		this.playlist = playlist;
		this.metadata = {
			type              : this.type,
			url               : this.url,
			title             : this.title,
			duration          : this.rawDuration,
			formattedDuration : this.duration,
			thumbnail         : this.thumbnail
		};
	}

	formatDuration(durationObj) {
		const duration = `${durationObj?.hours ? (durationObj.hours + ":") : ""}${durationObj?.minutes ? durationObj.minutes : "00"
		}:${(durationObj?.seconds < 10)
			? ("0" + durationObj.seconds)
			: (durationObj.seconds
				? durationObj.seconds
				: "00")
		}`;
		return duration;
	}
}
module.exports = { SongResource };