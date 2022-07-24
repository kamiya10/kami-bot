/**
 *
 * @param {string} user_id
 * @param {{ creator: string, category: string, channelSettings: { name: string, bitrate: number, limit: number } }[]} voice
 * @param {string|null} logger_message_delete
 */
module.exports = (
	user_id,
	voice_name = null,
	voice_limit = null,
	voice_bitrate = null,
	voice_forbid = null,
	voice_permit = null,
) => {
	return {
		id: user_id,
		voice_name,
		voice_limit,
		voice_bitrate,
		voice_forbid,
		voice_permit,
	};
};