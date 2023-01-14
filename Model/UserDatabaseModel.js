/**
 *
 * @param {string} user_id
 * @param {{ voice: { name: string, bitrate: number, limit: number, region: string, quailty: 1 | 2 } }[]} voice
 * @param {string|null} logger_message_delete
 */
module.exports = (
  voice = {},
) => ({
  voice,
});

module.exports.typing = {
  voice_name    : String,
  voice_limit   : Number,
  voice_bitrate : Number,
  voice_forbid  : Array(String),
  voice_permit  : Array(String),
};