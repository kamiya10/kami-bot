require('console-stamp')(console, { 
    format: ':date(yyyy/mm/dd HH:MM:ss).dim' 
});
const Discord = require("discord.js");
const mongoose = require("mongoose");
const config = require("./config");
const GuildSettings = require("./models/settings");
const Dashboard = require("./dashboard/dashboard");
const censor = require('discord-censor');
const fs = require("fs")

const commands = require("./command/loader")
const functions = require("./function/loader")

const ogs = require('open-graph-scraper');

const maintenance = false;
const web = false;

const settingUser = "./UserSetting.json";
const usettings = require(settingUser);

let cooldowns = new Discord.Collection();

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

Discord.Structures.extend("User", User => {
    class UserSetting extends User {
        constructor(client, data) {
            super(client, data);
            if (Object.keys(usettings).includes(this.id)) {
                this.setting = {
                    name: "",
                    limit: 0,
                    bitrate: 0
                };
            } else {
                this.setting = null;
            }
        }
    }
    return UserSetting;
});

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

    console.log(`\x1b[93mKamiya \x1b[90m» \x1b[0m機器人已就緒 (\x1b[33m${client.guilds.cache.size}\x1b[0m 伺服器 - \x1b[33m${client.channels.cache.size}\x1b[0m 頻道 - \x1b[33m${client.users.cache.size}\x1b[0m 使用者)`);
    if (web) Dashboard(client);
    client.user.setActivity(`k3! | ${client.guilds.cache.size}伺服 - ${client.channels.cache.size}頻道 - ${client.users.cache.size}用戶`)
    setInterval(() => {
        client.user.setActivity(`k3! | ${maintenance ? "MAINTENANCE " : ""}${client.guilds.cache.size}伺服 - ${client.channels.cache.size}頻道 - ${client.users.cache.size}用戶`)
    }, 60000);


    if (maintenance) {
        console.log(`\n\u001b[31;1m=============== 維護模式已啟用 ===============\x1b[0m`);
        console.log(`\n -> \u001b[7m伺服器列表\x1b[0m ${client.guilds.cache.size}`);
        console.log("\x1b[36m         ID                    名稱\x1b[0m");
        client.guilds.cache.forEach((v, k) => {
            console.log(` \x1b[33m${k}\x1b[0m | ${v.name}`);
        })
        console.log(`\n -> \u001b[7m自動語音頻道列表\x1b[0m ${checkchannel.length}`);
        console.log("\x1b[36m         ID                    名稱\x1b[0m");
        checkchannel.forEach(v => {
            console.log(` \x1b[33m${client.channels.cache.get(v).id}\x1b[0m | ${client.channels.cache.get(v).name}`);
            console.log(`  \x1b[90m-> in ${client.channels.cache.get(v).guild.id} ${client.channels.cache.get(v).guild.name}\x1b[0m`);
        })
    }
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
        case "bugreport" : return await commands.bot.bug(message, args, client);
        case "suggest"   : return await commands.bot.suggest(message, args, client);

        // info
        case "avatar"    : return await commands.info.avatar(message, args, client);
        case "help"      : return await commands.info.help(message, args, client, commands, storedSettings.prefix);
        case "prefix"    : return await commands.info.prefix(message, args, client, storedSettings);
        case "userinfo"  : 
        case "ui"        : return await commands.info.userinfo(message, args, client);
        case "where"     : return await commands.info.where(message, args, client);

        // music
        case "leave"     : return await commands.music.leave(message, args, client);
        case "loop"      : return await commands.music.loop(message, args, client);
        case "nowplaying": 
        case "np"        : return await commands.music.nowplaying(message, args, client);
        case "pause"     : return await commands.music.pause(message, args, client);
        case "play"      : 
        case "p"         : return await commands.music.play(message, args, client);
        case "queue"     : return await commands.music.queue(message, args, client);
        case "resume"    : return await commands.music.resume(message, args, client);
        case "skip"      : 
        case "s"         : return await commands.music.skip(message, args, client);
        case "synclyric" : 
        case "sl"        : return await commands.music.synclyric(message, args, client);
        case "volume"    : 
        case "v"         : return await commands.music.volume(message, args, client);

        // utils
        case "ping"      : return await commands.utils.ping(message, client.ws.ping, client);
        case "poll"      : return await commands.utils.poll(message, args, client);
        case "sauce"     : return await commands.utils.sauce(message, args, client);
        case "saucenao"  : return await commands.utils.saucenao(message, args, client);
        case "waifu2x"   : return await commands.utils.waifu2x(message, args, client);

        // admin
        case "chatreply": return await commands.admin.chatreply(message, args, client, storedSettings); 
        case "message":
        case "msg": return await commands.admin.message(message, args, client);
        case "purge": return await commands.admin.purge(message, args, client);
        case "voice": return await commands.admin.voice(message, args, client, storedSettings, usettings);
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
        case "avatar" : return await commands.info.avatar(message, args, client);
        case "ping"   : return await commands.utils.ping(message, client.ws.ping, client);
        case "waifu2x": return await commands.utils.waifu2x(message, args, client);
        case "where"  : return await commands.info.where(message, args, client);
    }
});
//#endregion

//#region Voice

//#region create
client.on("voiceStateUpdate", async (_oldMember, newMember) => {
    try {
        if (newMember.member.user.bot) return;
        if (!cooldowns.has("autovoice")) {
            cooldowns.set("autovoice", new Discord.Collection());
        }

        const now = Date.now();
        const timestamps = cooldowns.get("autovoice");
        const cooldownAmount = 10 * 1000;

        var storedSettings = await GuildSettings.findOne({ gid: newMember.guild.id });
        if (!storedSettings) {
            const newSettings = new GuildSettings({
                gid: newMember.guild.id
            });
            await newSettings.save().catch(() => { });
            storedSettings = await GuildSettings.findOne({ gid: newMember.guild.id });
        }

        var UserSetting = Object.keys(usettings).includes(newMember.id) ? usettings[newMember.id] : null;
        if (!UserSetting) {
            const newSettings = {
                name: "",
                limit: 0,
                bitrate: 0
            };
            await saveUser(newMember.member.user, null, newSettings);
        }
        UserSetting = usettings[newMember.id];
        const channel = newMember.channel;
        const setting = storedSettings.voice.find(o => o.creator == channel?.id);
        const guildMember = newMember.member;
        const placeholder = {
            "{user.displayName}": guildMember.displayName,
            "{user.name}": guildMember.user.username,
            "{user.tag}": guildMember.user.tag
        }
        if (setting) {
            if (timestamps.has(newMember.member.id)) {
                const expirationTime = timestamps.get(newMember.member.id) + cooldownAmount;

                if (now < expirationTime) {
                    const timeLeft = (expirationTime - now) / 1000;

                    const embed = new Discord.MessageEmbed()
                        .setColor(client.colors.error)
                        .setDescription(`你正在冷卻！\n你要再等待 \`${timeLeft.toFixed(1)}\` 秒才能再次使用 \`自動語音頻道\` 功能。`);
                    await newMember.setChannel(null);
                    await newMember.member.send(embed).catch(async () => {
                        if (newMember.guild.id == "760818507628806165")
                            await newMember.guild.channels.cache.get("824252190424170496").send(newMember.member, { embed: embed });
                    });
                    return;
                }
            }

            let finalName = usettings[newMember.id].name ? usettings[newMember.id].name.replace(/{.+}/g, all => placeholder[all] || all) : setting.channelSettings.name ? setting.channelSettings.name.replace(/{.+}/g, all => placeholder[all] || all) : `${newMember.member.displayName} 的房間`
            if (censor.check(finalName)) finalName = censor.censor(finalName);
            const channelSetting = {
                channelName: finalName,
                limit: usettings[newMember.id].limit ? usettings[newMember.id].limit : setting.channelSettings.limit,
                bitrate: usettings[newMember.id].bitrate ? usettings[newMember.id].bitrate : setting.channelSettings.bitrate
            }
            let category = setting.category ? newMember.guild.channels.cache.get(setting.category) : channel.parent;
            const muterole = newMember.guild.roles.cache.reduce((a, v) => { if (v.name == "Muted") a.push(v); return a; }, []);
            const perms = [{ id: client.user.id, allow: ["MANAGE_CHANNELS", "MANAGE_ROLES"] }, { id: newMember.member.id, allow: ["CONNECT", "STREAM", "SPEAK", "MUTE_MEMBERS", "MANAGE_CHANNELS", "MANAGE_ROLES", "USE_VAD", "PRIORITY_SPEAKER", "MOVE_MEMBERS"] }];
            if (muterole.length > 0) perms.push({ id: muterole[0].id, deny: ["CONNECT", "SPEAK"] })
            await newMember.guild.channels.create(channelSetting.channelName, { type: "voice", parent: category, bitrate: +channelSetting.bitrate, userLimit: +channelSetting.limit, permissionOverwrites: perms, reason: "自動創建語音頻道" })
                .then(async ch => {
                    await newMember.setChannel(ch);
                    checkchannel.push(ch.id);
                    timestamps.set(newMember.member.id, now);
                    setTimeout(() => timestamps.delete(newMember.member.id), cooldownAmount);
                })
        }
    }
    catch (e) {
        console.error(e);
    }
})
//#endregion

//#region delete
client.on("voiceStateUpdate", async oldMember => {
    try {
        if (checkchannel.length == 0) return;
        if (oldMember.channel)
            if (checkchannel.includes(oldMember.channel.id))
                if (oldMember.channel.members.size == 0) {
                    const deleted = await oldMember.channel.delete();
                    checkchannel.splice(checkchannel.indexOf(deleted.id), 1);
                };
    } catch { }
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
                    })
                    if (!oldMember.channel.permissionOverwrites.get(oldMember.member.id)) permission.push({ id: oldMember.member.id, deny: 1n << 21n });
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
                        await executor.send(embed);
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
    if (guild.systemChannel) {
        const embed = new Discord.MessageEmbed()
            .setColor(client.colors.info)
            .setTitle("感謝邀請我到這個伺服器")
            .setDescription("雖然我能做的事情還不多，不過還是感謝選擇了我\n由於主人很懶，所以沒什麼在管我，出bug也不太修 ;w;\n叫我的時候用 \`k3!\` 當開頭，所有我能做到的事都在 \`k3!help\`\n我還有一個妹妹，可以找看看其他伺服器內有沒有她的蹤影喔\n還是有問題的話可以到 [支援伺服器](https://discord.gg/3VTtVxjtWv) 找我主人喔")
            .setTimestamp();
        await guild.systemChannel.send(embed);
    }
    return;
})
client.on("guildDelete", async guild => {
    client.channels.cache.get("842989906980372500").send(new Discord.MessageEmbed().setDescription(`已離開伺服器 ${guild.name} (${guild.id})`))
})
//#endregion

client.login(config.token);

//#region chat
client.on("message", async message => {
    if (message.author.bot) return;
    var storedSettings = await GuildSettings.findOne({ gid: message.guild.id });
    if (!storedSettings) {
        const newSettings = new GuildSettings({
            gid: message.guild.id
        });
        await newSettings.save().catch(() => { });
        storedSettings = await GuildSettings.findOne({ gid: message.guild.id });
    }
    if (!storedSettings.chatreply) return;
    if (message.content.includes("早安")) {
        if (Math.abs((Math.round(Math.random() * 10) / 10) - (Math.round(Math.random() * 10) / 10)) <= 0.1 || message.author.id == "437158166019702805" || message.mentions.users.has("632589168438149120")) {
            const now = new Date();
            if (now.getHours() < 12) {
                let hi = [
                    "早",
                    "早",
                    "早",
                    "早",
                    "早",
                    "早",
                    "你早r",
                    "你早r",
                    "你早r",
                    "早安r",
                    "早安r",
                    "早安r",
                    "早安阿",
                    "早安阿",
                    "早安喵",
                    "早..喵...... (睡)"
                ];
                await message.reply(hi[Math.floor(Math.random() * hi.length)]);
            } else {
                let hi = [
                    "早...安？",
                    "早...安？",
                    "早...安？",
                    "不早惹",
                    "不早惹",
                    "不早惹",
                    "你時鐘484該校正惹",
                    "下次早點睡",
                    "都幾點惹還早安",
                    "你也太晚睡"
                ];
                await message.reply(hi[Math.floor(Math.random() * hi.length)]);
            }
            return;
        }
    }
    if (message.content.includes("午安")) {
        if (Math.abs((Math.round(Math.random() * 10) / 10) - (Math.round(Math.random() * 10) / 10)) <= 0.1 || message.author.id == "437158166019702805" || message.mentions.users.has("632589168438149120")) {
            const now = new Date();
            if (now.getHours() < 11 || now.getHours() > 13) {
                let hi = [
                    "午安?"
                ];
                await message.reply(hi[Math.floor(Math.random() * hi.length)]);
            } else {
                let hi = [
                    "午安",
                    "午安",
                    "午安",
                    "午安",
                    "午安",
                    "午安",
                    "來去吃午餐/",
                    "來去吃午餐/",
                    "來去吃午餐/",
                    "來去睡午覺/",
                    "來去睡午覺/",
                    "來去睡午覺/",
                    "一起吃午餐 >w<",
                    "一起睡午覺 >w<",
                    "🍜",
                    "🍚",
                    "🍝"
                ];
                await message.reply(hi[Math.floor(Math.random() * hi.length)]);
            }
            return;
        }
    }
    if (message.content.includes("晚安")) {
        if (Math.abs((Math.round(Math.random() * 10) / 10) - (Math.round(Math.random() * 10) / 10)) <= 0.1 || message.author.id == "437158166019702805" || message.mentions.users.has("632589168438149120")) {
            const now = new Date();
            if (message.author.id == "437158166019702805") return await message.reply("一起睡 (ﾉ>ω<)ﾉ");
            if (now.getHours() < 18 && now.getHours() > 7) {
                let hi = [
                    "這個時間...你要睡了？",
                    "這個時間...你要睡了？",
                    "該醒惹",
                    "該醒惹",
                    "該醒惹",
                    "該醒惹",
                    "該醒惹",
                    "天亮了喔",
                    "天亮了喔",
                    "天亮了喔",
                    "天亮了喔",
                    "天亮了喔",
                    "你時鐘484該校正惹",
                    "你也太晚睡",
                    "你也太晚睡",
                    "下次早點睡",
                    "下次早點睡"
                ];
                await message.reply(hi[Math.floor(Math.random() * hi.length)]);
            } else {
                let hi = [
                    ":zzz:",
                    ":zzz:",
                    "Zzz",
                    "Zzz",
                    "Zzz",
                    "晚安",
                    "晚安",
                    "晚安",
                    "晚安喵",
                    "來去睡"
                ];
                await message.reply(hi[Math.floor(Math.random() * hi.length)]);
            }
            return;
        }
    }
    if (message.content.toLowerCase() == "never gonna") {
        let response = [
            "Give u up ~ ♪",
            "Give u up ~ ♪",
            "Give u up ~ ♪",
            "Give u up ~ ♪",
            "Give u up ~ ♪",
            "Let u down ~ ♪",
            "Let u down ~ ♪",
            "Let u down ~ ♪",
            "Let u down ~ ♪",
            "Let u down ~ ♪",
            "Run around and desert u ~ ♪",
            "Run around ~ ♪",
            "Run around ~ ♪",
            "Run around ~ ♪",
            "Run around ~ ♪",
            "Run around ~ ♪",
            "Desert u ~ ♪",
            "Desert u ~ ♪",
            "Desert u ~ ♪",
            "Desert u ~ ♪",
            "Desert u ~ ♪",
            "Say goodbye ~ ♪",
            "Say goodbye ~ ♪",
            "Say goodbye ~ ♪",
            "Say goodbye ~ ♪",
            "Say goodbye ~ ♪",
            "Say goodbye <:L_gun:863445879544741908>",
            "Tell a lie and hurt u ~ ♪",
            "Tell a lie ~ ♪",
            "Tell a lie ~ ♪",
            "Tell a lie ~ ♪",
            "Tell a lie ~ ♪",
            "Tell a lie ~ ♪",
            "Hurt u ~ ♪",
            "Hurt u ~ ♪",
            "Hurt u ~ ♪",
            "Hurt u ~ ♪",
            "Hurt u ~ ♪",
            "Hurt u ~ 🔪",
            "Make u cry ~ ♪",
            "Make u cry ~ ♪",
            "Make u cry ~ ♪",
            "Make u cry ~ ♪",
            "Make u cry ~ ♪"
        ];
        await message.reply(response[Math.floor(Math.random() * response.length)]);
    }
})

//#endregion

const scamurl = require('./scamurl');

//#region 詐騙
client.on("message", async message => {
    try {
        if (message.channel.type == 'dm') return;
        /*if (message.author.id != "492354896100720670") return; 
        if (message.embeds[0].description.includes(""))*/
        const guild = client.guilds.cache.get(message.guild.id);

        const embed = new Discord.MessageEmbed()
            .setColor("#ff0000")
            .setDescription(`成員：${message.author}\n原因：近期詐騙網址`);

        if (scamurl.some((v) => { return message.content.includes(v); })) {
            console.log(`message in ${message.channel.name}, ${message.guild.name}`);
            console.log(message.content);
            const bans = await guild.fetchBans().catch(e => console.log(e));
            if (bans)
                embed.setAuthor(`ban | 案 ${bans.size + 1}`);
            else
                embed.setAuthor(`ban`);

            if (!message.guild.members.cache.has("492354896100720670")) await message.delete();
            if (message.member.bannable) await message.member.ban({ days: 7, reason: "近期詐騙網址" }).then(async () => await message.channel.send(":octagonal_sign: 已封鎖成員", { embed: embed })).catch(e => console.log(e));
            return;
        }
        return;
    } catch (error) {
        console.error(error);
    }
})
//#endregion
    }
})

function saveUser(user = null, key = null, data = null) {
    return new Promise(async (resolve) => {
        if (user) {
            if (!key) {
                usettings[user.id] = data;
            } else {
                if (!Object.keys(usettings).includes(user.id)) await saveUser(user, null, { name: "", limit: 0, bitrate: 0 });
                usettings[user.id][key] = data;
            }
        }
        try {
            fs.writeFileSync(require.resolve(settingUser), JSON.stringify(usettings));
        } catch (e) {
            console.error(e);
        }
        resolve(true);
    })
}