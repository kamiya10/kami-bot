require("dotenv").config();
module.exports = {
    "token": process.env.token, // https://discordapp.com/developers/applications/ID/bot
    "youtubeAPI": process.env.yttoken,
    "mongodbUrl": "mongodb://127.0.0.1:27017", // Mongodb connection url.
    "id": process.env.appid, // https://discordapp.com/developers/applications/ID/information
    "clientSecret": process.env.secret, // https://discordapp.com/developers/applications/ID/information
    "domain": "https://kamiya.tk",
    "port": 80
};

/**
 * !!!
 * You need to add a redirect url to https://discordapp.com/developers/applications/ID/oauth2.
 * Format is: domain:port/callback example http://localhost:8080/callback
 * - Do not include port if the port is 80.
 * !!!
 */