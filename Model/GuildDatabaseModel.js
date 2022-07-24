/**
 *
 * @param {string} guild_id
 * @param {{ creator: string, category: string, channelSettings: { name: string, bitrate: number, limit: number } }[]} voice
 * @param {string|null} logger_message_delete
 */
module.exports = (
	guild_id,
	voice = [],
	eew_channel = null,
	eew_mention = null,
	quake_channel = null,
	quake_style = 1,
	quake_small = false,
) => {
	return {
		id: guild_id,
		voice,
		eew_channel,
		eew_mention,
		quake_channel,
		quake_style,
		quake_small,
	};
};