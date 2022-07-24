const Discord = require("discord.js");

module.exports = class CommandEvent {
	constructor(command, channel, member, client, mi) {
		this.command = {
			name    : command,
			options : mi.constructor.name == "CommandInteraction" ? mi.options : mi.args
		};
		this.mi = mi;
		this.isInteraction = mi.constructor.name == "CommandInteraction";
		this.type = mi.targetType;
		this.guild = member.guild;
		this.channel = channel;
		this.user = member;
		this.user.isBotOwner = member.user.id == "437158166019702805";
		this.client = client;
	}
};