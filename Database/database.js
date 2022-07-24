const Sequelize = require("sequelize");
const Database = new Sequelize({
	host    : "localhost",
	dialect : "sqlite",
	logging : false,
	storage : "Database/Database.sqlite",
});
try {
	const UserDatabase = Database.define("User", {
		id: {
			type       : Sequelize.TEXT,
			primaryKey : true,
			unique     : true,
			allowNull  : false,
		},
		"voice_name"    : Sequelize.TEXT,
		"voice_limit"   : Sequelize.INTEGER,
		"voice_bitrate" : Sequelize.INTEGER,
		"voice_forbid"  : Sequelize.TEXT,
		"voice_permit"  : Sequelize.TEXT,
	});

	const GuildDatabase = Database.define("Guild", {
		id: {
			type       : Sequelize.TEXT,
			primaryKey : true,
			unique     : true,
			allowNull  : false,
		},
		voice: {
			type: Sequelize.JSON,
		},
		eew_channel: {
			type      : Sequelize.TEXT,
			allowNull : true,
		},
		eew_mention: {
			type      : Sequelize.TEXT,
			allowNull : true,
		},
		quake_channel: {
			type      : Sequelize.TEXT,
			allowNull : true,
		},
		quake_style: {
			type         : Sequelize.INTEGER,
			defaultValue : 1,
		},
		quake_small: {
			type         : Sequelize.BOOLEAN,
			defaultValue : false,
		},
	});

	module.exports = { Database, UserDatabase, GuildDatabase };
} catch (error) {
	console.error(error);
}