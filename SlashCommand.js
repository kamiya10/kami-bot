require("dotenv").config();
const Discord = require("discord.js");
const Client = new Discord.Client({ intents: [ "GUILDS", "GUILD_MESSAGES", "GUILD_MEMBERS", "GUILD_MESSAGE_REACTIONS", "GUILD_PRESENCES", "GUILD_VOICE_STATES" ] });

Client.on("ready", () => {
	console.log(`Logged in as ${Client.user.tag}!`);
	Client.guilds.cache.get("810931443206848544").commands.create({
		name        : "voice",
		description : "設定自動語音頻道",
		options     : [
			{
				name        : "名稱",
				description : "設定頻道名稱",
				type        : "SUB_COMMAND",
				options     : [
					{
						name        : "名稱",
						description : "要設定的名稱",
						type        : "STRING",
						required    : true
					},
					{
						name        : "預設",
						description : "設為預設",
						type        : "BOOLEAN",
						required    : false
					}
				]
			},
			{
				name        : "人數上限",
				description : "設定頻道人數上限",
				type        : "SUB_COMMAND",
				options     : [
					{
						name        : "人數上限",
						description : "要設定的人數上限",
						type        : "INTEGER",
						required    : true
					},
					{
						name        : "預設",
						description : "設為預設",
						type        : "BOOLEAN",
						required    : false
					}
				]
			},
			{
				name        : "位元率",
				description : "設定頻道位元率",
				type        : "SUB_COMMAND",
				options     : [
					{
						name        : "位元率",
						description : "要設定的位元率",
						type        : "INTEGER",
						required    : true
					},
					{
						name        : "預設",
						description : "設為預設",
						type        : "BOOLEAN",
						required    : false
					}
				]
			},
			{
				name        : "伺服器設定",
				description : "（管理員）相關伺服器設定",
				type        : "SUB_COMMAND_GROUP",
				options     : [
					{
						name        : "清單",
						description : "顯示所有已設定自動語音頻道設定",
						type        : "SUB_COMMAND"
					},
					{
						name        : "新增",
						description : "顯示所有已設定自動語音頻道設定",
						type        : "SUB_COMMAND",
						options     : [
							{
								name        : "頻道",
								description : "要刪除的自動語音頻道（頻道本身不會被刪除）",
								type        : "CHANNEL",
								required    : true
							}
						]
					},
					{
						name        : "自動新增",
						description : "讓機器人幫你創建一個自動語音頻道",
						type        : "SUB_COMMAND"
					},
					{
						name        : "刪除",
						description : "顯示所有已設定自動語音頻道設定",
						type        : "SUB_COMMAND",
						options     : [
							{
								name        : "頻道",
								description : "要刪除的自動語音頻道（頻道本身不會被刪除）",
								type        : "CHANNEL",
								required    : true
							}
						]
					},
					{
						name        : "設定",
						description : "顯示所有已設定自動語音頻道設定",
						type        : "SUB_COMMAND",
						options     : [
							{
								name        : "頻道",
								description : "要設定的自動語音頻道",
								type        : "CHANNEL",
								required    : true
							},
							{
								name        : "類別",
								description : "設定自動語音頻道創頻道要創在哪一個類別下",
								type        : "CHANNEL",
								required    : false
							},
							{
								name        : "名稱",
								description : "設定伺服器自動語音頻道名稱",
								type        : "STRING",
								required    : false
							},
							{
								name        : "人數上限",
								description : "設定伺服器自動語音頻道人數上限",
								type        : "INTEGER",
								required    : false
							},
							{
								name        : "位元率",
								description : "設定伺服器自動語音頻道位元率",
								type        : "INTEGER",
								required    : false
							}
						]
					}
				]
			}
		]
	});
});

Client.on("interactionCreate", interaction => {
	if (interaction.isCommand()){
		console.log(interaction);
		interaction.reply("Recevied");
		const string = interaction.options.getString("input");
		const integer = interaction.options.getInteger("int");
		const number = interaction.options.getNumber("num");
		const boolean = interaction.options.getBoolean("choice");
		const user = interaction.options.getUser("target");
		const member = interaction.options.getMember("target");
		const channel = interaction.options.getChannel("destination");
		const role = interaction.options.getRole("muted");
		const mentionable = interaction.options.getMentionable("mentionable");
		const subcommandgroup = interaction.options.getSubcommandGroup();
		const subcommand = interaction.options.getSubcommand();

		console.log([ string, integer, number, boolean, user, member, channel, role, mentionable, subcommandgroup, subcommand ]);
	}
});

Client.login(process.env.bot_token);