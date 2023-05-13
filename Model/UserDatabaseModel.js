/**
 *
 * @param {string} user_id
 * @param {{ voice: { name: string, bitrate: number, limit: number, region: string, quailty: 1 | 2 } }[]} voice
 * @param {string|null} logger_message_delete
 */
module.exports = (
  voice = {},
  allow_quote = null,
  message_mention = null,
) => ({
  voice,
  allow_quote,
  message_mention,
});

module.exports.typing = {
  voice           : Object,
  allow_quote     : Boolean,
  message_mention : Boolean,
};