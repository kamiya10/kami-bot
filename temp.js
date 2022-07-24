require("dotenv").config();

const Discord = require("discord.js");
// const Discord = require("discord.js");
const Client = new Discord.Client({
    intents         : [ "GUILDS", "GUILD_MESSAGES", "GUILD_MEMBERS", "GUILD_MESSAGE_REACTIONS", "GUILD_PRESENCES", "GUILD_VOICE_STATES" ],
    allowedMentions : { repliedUser: false }
});

/*
const reason = "Automatic Scam Prevention";

Client.on("ready", async () => {
    const g = Client.guilds.cache.get("841677068495486999");
    await g.members.cache.get("875904315586408479").ban({ days: 7, reason });
});
*/

// https://discord.com/api/v9/users/399201706652598272/profile

/**
 * @type {Discord.Message}
 */

/*
let message;

*/
const fetch = require("node-fetch");

let oldurl;
client.on("ready", () => {
    const timer = setInterval(async () => {
        try {
            const memeChannel = client.guilds.cache.get("GUILD ID HERE").channels.cache.get("906199869780275210");
            // Get the url from response
            const url = (await fetch("https://meme-api.herokuapp.com/gimme")
                .then(
                    r => r.json(),
                    console.error // fetch error handling
                )
            )?.url;

            // check if the url is different from the last fetch
            if (url != oldurl) {
                // set oldurl to current url
                oldurl = url;

                // sends message
                const autoMemeEmbed = new Discord.MessageEmbed()
                    .setImage(url);
                await memeChannel.send({ embeds: [autoMemeEmbed] });
            }
            return;
        } catch(e) {
            console.error(e);
            clearInterval(timer);
        }
    }, 3000);
});
Client.login(process.env.bot_token);