// We import the modules.
const Discord = require("discord.js");
const mongoose = require("mongoose");
const config = require("./config");
const GuildSettings = require("./models/settings");
const Dashboard = require("./dashboard/dashboard");
const censor = require('discord-censor');

const commands = require("./command/loader")
const functions = require("./function/loader")

const ogs = require('open-graph-scraper');

const maintenance = false;
const web = false;

Discord.Structures.extend('Guild', function (Guild) {
    class MusicGuild extends Guild {
        constructor(client, data) {
            super(client, data);
            this.musicData = {
                queue: [],
                loopingMode: 'none',
                isPlaying: false,
                nowPlaying: null,
                songDispatcher: null,
                volume: 0.4,
                bindmsg: null,
                npmsg: null
            };
        }
    }
    return MusicGuild;
});

// We instiate the client and connect to database.
const client = new Discord.Client({ intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_EMOJIS', 'GUILD_VOICE_STATES', 'GUILD_PRESENCES', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS', 'DIRECT_MESSAGES', 'DIRECT_MESSAGE_REACTIONS'] });
mongoose.connect(config.mongodbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
client.config = config;
client.colors = {
    info: "#89cff0",
    success: "#77ff77",
    warn: "#fdfd96",
    error: "#ff9691"
}
client.embedStat = {
    info: "ℹ️ 資訊",
    success: "✅ 成功",
    warn: "⚠️ 警告",
    error: "❌ 錯誤"
}
var checkchannel = [];

//#region  Status
client.on("ready", async () => {
    (await GuildSettings.find()).forEach(v => {
        if (v.voice.length != 0) {
            v.voice.forEach(val => {
                if (val.category) { // if category setting exists
                    if (client.channels.cache.get(val.category)) // if category exists
                        client.channels.cache.get(val.category).children.forEach(ch => {
                            if (ch.type == "voice")
                                if (ch.id != val.creator) checkchannel.push(ch.id);
                        });
                }
            });
        }
    });
    if (maintenance) console.log(`=============== 維護模式已啟用 ===============`);
    console.log(`\x1b[93mKamiya \x1b[90m» \x1b[0m機器人已就緒 (\x1b[33m${client.guilds.cache.size}\x1b[0m 伺服器 - \x1b[33m${client.channels.cache.size}\x1b[0m 頻道 - \x1b[33m${client.users.cache.size}\x1b[0m 使用者)`);
    if (web) Dashboard(client);
    client.user.setActivity(`k3! | ${client.guilds.cache.size}伺服 - ${client.channels.cache.size}頻道 - ${client.users.cache.size}用戶`)
    setInterval(() => {
        client.user.setActivity(`k3! | ${maintenance ? "MAINTENANCE " : ""}${client.guilds.cache.size}伺服 - ${client.channels.cache.size}頻道 - ${client.users.cache.size}用戶`)
    }, 60000)
});
client.on('shardReady', id => {
    console.log(`\x1b[90mdiscord\x1b[32m.\x1b[36mjs \x1b[90m» \x1b[0mShard with ID \x1b[33m${id}\x1b[0m Ready.`)
    functions.log.stat(client, 10, id);
});
client.on('shardReconnecting', id => {
    console.log(`\x1b[90mdiscord\x1b[32m.\x1b[36mjs \x1b[90m» \x1b[0mShard with ID \x1b[33m${id}\x1b[0m reconnected.`)
    functions.log.stat(client, 11, id);
});
client.on('shardDisconnect', id => {
    console.log(`\x1b[90mdiscord\x1b[32m.\x1b[36mjs \x1b[90m» \x1b[0mShard with ID \x1b[33m${id}\x1b[0m reconnected.`)
    functions.log.stat(client, 12, id);
});
client.on("error", console.error);
client.on("warn", console.warn);
//#endregion

//#region Guild
client.on("message", async (message) => {
    if (message.channel.type == 'dm') return;
    if (message.author.bot) return;
    if (!message.channel.permissionsFor(message.guild.me).has("SEND_MESSAGES")) return;

    var storedSettings = await GuildSettings.findOne({ gid: message.guild.id });
    if (!storedSettings) {
        const newSettings = new GuildSettings({
            gid: message.guild.id
        });
        await newSettings.save().catch(() => { });
        storedSettings = await GuildSettings.findOne({ gid: message.guild.id });
    }

    if (message.content.indexOf(storedSettings.prefix) !== 0) return;

    const args = message.content.slice(storedSettings.prefix.length).trim().match(/('.*?'|".*?"|\S+)/g).map(x => x.replace(/"|'/g, ''));
    const command = args.shift().toLowerCase();

    switch (command) {
        // bot
        case "bugreport": return await commands.bot.bug(message, args, client);
        case "suggest": return await commands.bot.suggest(message, args, client);

        // info
        case "avatar": return await commands.info.avatar(message, args, client);
        case "help": return await commands.info.help(message, args, client, commands, storedSettings.prefix);
        case "prefix": return await commands.info.prefix(message, args, client, storedSettings);
        case "userinfo":
        case "ui": return await commands.info.userinfo(message, args, client);
        case "where": return await commands.info.where(message, args, client);

        // music
        case "leave": return await commands.music.leave(message, args, client);
        case "loop": return await commands.music.loop(message, args, client);
        case "nowplaying":
        case "np": return await commands.music.nowplaying(message, args, client);
        case "play":
        case "p": return await commands.music.play(message, args, client);
        case "queue": return await commands.music.queue(message, args, client);
        case "skip":
        case "s": return await commands.music.skip(message, args, client);
        case "synclyric":
        case "sl": return await commands.music.synclyric(message, args, client);
        case "volume":
        case "v": return await commands.music.volume(message, args, client);

        // utils
        case "ping": return await commands.utils.ping(message, client.ws.ping, client);
        case "poll": return await commands.utils.poll(message, args, client);
        case "sauce": return await commands.utils.sauce(message, args, client);
        case "saucenao": return await commands.utils.saucenao(message, args, client);
        case "waifu2x": return await commands.utils.waifu2x(message, args, client);

        // admin
        case "delmsg": return await commands.admin.delmsg(message, args, client)
        case "voice": return await commands.admin.voice(message, args, client, storedSettings)
    }
});
//#endregion

//#region Direct Message
client.on("message", async (message) => {
    if (message.channel.type != 'dm') return;
    if (message.author.bot) return;

    const args = message.content.trim().match(/('.*?'|".*?"|\S+)/g).map(x => x.replace(/"|'/g, ''));
    const command = args.shift().toLowerCase();

    switch (command) {
        case "avatar": return await commands.info.avatar(message, args, client);
        case "ping": return await commands.utils.ping(message, client.ws.ping, client);
        case "waifu2x": return await commands.utils.waifu2x(message, args, client);
        case "where": return await commands.info.where(message, args, client);
    }
});
//#endregion

//#region Voice

//#region create
client.on("voiceStateUpdate", async (oldMember, newMember) => {
    // if (newMember.guild.id != "810931443206848544") return;
    try {
        var storedSettings = await GuildSettings.findOne({ gid: newMember.guild.id });
        if (!storedSettings) {
            const newSettings = new GuildSettings({
                gid: newMember.guild.id
            });
            await newSettings.save().catch(() => { });
            storedSettings = await GuildSettings.findOne({ gid: newMember.guild.id });
        }

        const channel = newMember.channel;
        const setting = storedSettings.voice.find(o => o.creator == channel?.id);
        const permission = new Discord.Permissions();
        const guildMember = newMember.member;
        const placeholder = {
            "{user.displayName}": guildMember.displayName,
            "{user.name}": guildMember.user.username,
            "{user.tag}": guildMember.user.tag
        }
        if (setting) {
            let finalName = setting.channelSettings.name ? setting.channelSettings.name.replace(/{.+}/g, all => placeholder[all] || all) : `${newMember.member.displayName} 的房間`
            if (censor.check(finalName)) finalName = censor.censor(finalName);
            const channelSetting = {
                channelName: finalName,
                bitrate: setting.channelSettings.bitrate
            }
            let category = setting.category ? newMember.guild.channels.cache.get(setting.category) : channel.parent;
            await newMember.guild.channels.create(channelSetting.channelName, { type: "voice", parent: category, bitrate: channelSetting.bitrate, permissionOverwrites: [{ id: client.user.id, allow: ["MANAGE_CHANNELS"] }, { id: newMember.member.id, allow: ["CONNECT", "STREAM", "SPEAK", "MUTE_MEMBERS", "MANAGE_CHANNELS", "USE_VAD", "PRIORITY_SPEAKER", "MOVE_MEMBERS"] }], reason: "自動創建語音頻道" })
                .then(async ch => {
                    await newMember.setChannel(ch);
                    checkchannel.push(ch.id);
                })
        }

        if (checkchannel.length == 0) return;
        if (oldMember.channelID)
            if (checkchannel.includes(oldMember.channel.id))
                if (oldMember.channel.members.size == 0) {
                    const deleted = await oldMember.channel.delete();
                    checkchannel.splice(checkchannel.indexOf(deleted.id), 1);
                };
    }
    catch (e) {
        console.error(e);
    }
})
//#endregion

//#region Mute/Deafen handling
client.on("voiceStateUpdate", async (oldMember, newMember) => {
    // if (newMember.guild.id != "810931443206848544") return;
    try {
        if (!oldMember.channelID || !newMember.channelID) return;
        if ((oldMember.serverMute != newMember.serverMute) && newMember.serverMute) {
            if (checkchannel.length == 0) return;
            if (oldMember.channelID)
                if (checkchannel.includes(oldMember.channel.id)) {
                    let permission = [];
                    oldMember.channel.permissionOverwrites.forEach((v, k) => {
                        let allow, deny;
                        if (k == oldMember.member.id) {
                            if (!v.deny.has("SPEAK")) deny = v.deny.add("SPEAK");
                            if (v.allow.has("SPEAK")) allow = v.allow.remove("SPEAK");
                        } else {
                            allow = v.allow;
                            deny = v.deny;
                        }
                        permission.push({ id: k, allow: allow, deny: deny });
                        console.log(v.allow.has("SPEAK"))
                    })
                    if (!oldMember.channel.permissionOverwrites.get(oldMember.member.id)) permission.push({ id: oldMember.member.id, deny: 1n << 21n });
                    console.log(permission)
                    await oldMember.channel.overwritePermissions(permission);
                    await newMember.setMute(false);
                    await newMember.setChannel(oldMember.channel); // update voice stats so that permission mute would work
                }
        }
    }
    catch (e) {
        console.error(e);
    }
})
//#endregion

//#region channel name update
client.on("channelUpdate", async (__oldChannel, newChannel) => {
    if (newChannel.type == "voice") {
        if (checkchannel.includes(newChannel.id))
            if (censor.check(newChannel.name)) {
                const fetchedLogs = await newChannel.guild.fetchAuditLogs({
                    limit: 1,
                    type: 'CHANNEL_UPDATE',
                });
                const updatelog = fetchedLogs.entries.first();
                if (updatelog) {
                    const { executor, target } = updatelog;
                    if (target.id == newChannel.id) {
                        const embed = new Discord.MessageEmbed()
                            .setColor("#ff2222")
                            .setAuthor(newChannel.guild.name, newChannel.guild.iconURL({ dynamic: true }))
                            .setDescription("由於您的頻道包含敏感字詞，因此我們已自動將它遮屏")
                            .addField("之前的名稱", newChannel.name, true)
                            .addField("現在的名稱", censor.censor(newChannel.name), true)
                            .setFooter("請不要嘗試使用敏感字詞當作頻道的名稱")
                            .setTimestamp();
                        await executor.send(embed)
                    }
                }
                await newChannel.setName(censor.censor(newChannel.name), "不雅字詞");
            }
    }
});
//#endregion

//#endregion

//#region Logging
client.on("message", async (message) => {
    if (message.author.bot) return;
    if (message.channel.type == 'dm') await functions.log.dm(message, client);
    if (message.mentions.has(client.user, { ignoreEveryone: true })) await functions.log.mention(message, client);
});
client.on("guildCreate", async guild => {
    client.channels.cache.get("842989906980372500").send(new Discord.MessageEmbed().setDescription(`已加入伺服器 ${guild.name} (${guild.id})`))
})
//#endregion

//#region VRChat
client.on('message', message => {
    if (message.guild.id != "841677068495486999" || message.channel.id != "841678344970043412" || message.author.bot) return;
    if (message.mentions.channels.size) {
        message.mentions.channels.forEach(async ch => {
            const guildMember = message.member;
            console.log(message.content);
            let url = message.content.match(/https?:\/\/(?:www\.)?vrchat\.(?:(?:net)|(?:com))\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi);
            url = url ? url[0].replace("*", "").replace(/&instanceId.*/, "") : url;

            if (url) {
                ogs({ url: url })
                    .then(async (data) => {
                        const { result } = data;
                        console.log(result);
                        const embed = new Discord.MessageEmbed()
                            .setColor(guildMember.displayHexColor)
                            .setAuthor("跳到訊息", undefined, `https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id}`)
                            .setTitle(result.ogTitle)
                            .setURL(url)
                            .setDescription(result.ogDescription)
                            .setImage(result.ogImage.url)
                            .setTimestamp()
                            .setFooter(guildMember.displayName, guildMember.user.avatarURL({ dynamic: true }));
                        await ch.send(message.content.replace(/(https?:\/\/(?:www\.)?vrchat\.(?:(?:net)|(?:com))\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*))/gi, `<$1>`), { embed: embed });
                    })
            } else {
                await ch.send(message.content);
            }
        })
    }
})
//#endregion


client.login(config.token);