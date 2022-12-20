/**
 *
 * @param {string} user_id
 * @param {{ creator: string, category: string, channelSettings: { name: string, bitrate: number, limit: number } }[]} voice
 * @param {string|null} logger_message_delete
 */
module.exports = (
  voice_name = null,
  voice_limit = null,
  voice_bitrate = null,
  voice_forbid = null,
  voice_permit = null,
) => ({
  voice_name,
  voice_limit,
  voice_bitrate,
  voice_forbid,
  voice_permit,
});

module.exports.typing = {
  voice_name    : String,
  voice_limit   : Number,
  voice_bitrate : Number,
  voice_forbid  : Array(String),
  voice_permit  : Array(String),
};