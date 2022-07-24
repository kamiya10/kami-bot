const logger = require("../Core/logger");

module.exports = {
	name  : "voiceDelete",
	event : "voiceStateUpdate",
	once  : false,
	/**
     * @param {import("discord.js").VoiceState} oldState
     * @param {import("discord.js").VoiceState} newState
     */
	async execute(client, oldState) {
		try {
			if (oldState.channel)
				if (client.watchedChanels.has(oldState.channelId))
					if (oldState.channel.members.filter(v => !v.user.bot).size == 0) {
						const deleted = await oldState.channel.delete();
						client.watchedChanels.delete(deleted.id);
					}
			return;
		} catch (e) {
			if (e.toString() != "DiscordAPIError: Unknown Channel")
				logger.error(`${this.name} has encountered an error: ${e} in ${oldState.guild.name} (${oldState.guild.id})`);
		}
	},
};