/**
 *
 * @param {string} guild_id
 * @param {{ creator: string, category: string, channelSettings: { name: string, bitrate: number, limit: number } }[]} voice
 * @param {string|null} logger_message_delete
 */
module.exports = (
	voice = [],
	eew_channel = null,
	eew_mention = null,
	quake_channel = null,
	quake_style = 1,
	quake_small = false,
) => {
	return {
		voice,
		eew_channel,
		eew_mention,
		quake_channel,
		quake_style,
		quake_small,
	};
};

module.exports.typing = {
	voice: Array(
		{
			creator         : String,
			category        : String,
			channelSettings : {
				name    : String,
				bitrate : Number,
				limit   : Number,
			},
		},
	),
	eew_channel   : String,
	eew_mention   : String,
	quake_channel : String,
	quake_style   : Number,
	quake_small   : Boolean,
};