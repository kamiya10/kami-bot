// We import the modules.
const Discord = require("discord.js");
const mongoose = require("mongoose");
const config = require("./config");
const GuildSettings = require("./models/settings");
//const Dashboard = require("./dashboard/dashboard");
const censor = require('discord-censor');

const commands = require("./command/loader")
const functions = require("./function/loader")

// We instiate the client and connect to database.
const client = new Discord.Client();
mongoose.connect(config.mongodbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
client.config = config;

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
                        })
                }/* else {
                    client.channels.cache.get(val.creator).parent.children.forEach(ch => {
                        if (ch.type == "voice")
                            if (ch.id != val.creator) checkchannel.push(ch.id)
                    })

                }*/
            })
        }
    })
    console.log(checkchannel)
    console.log(`機器人已就緒 (${client.guilds.cache.size} 伺服器 - ${client.channels.cache.size} 頻道 - ${client.users.cache.size} 使用者)`);
//- Dashboard(client);
    client.user.setActivity(`k3! | ${client.guilds.cache.size}伺服 - ${client.channels.cache.size}頻道 - ${client.users.cache.size}用戶`)
    setInterval(() => {
        client.user.setActivity(`k3! | ${client.guilds.cache.size}伺服 - ${client.channels.cache.size}頻道 - ${client.users.cache.size}用戶`)
    }, 60000)

});
client.on('shardReady', id => {
    console.log(`Shard with ID ${id} Ready.`)
    functions.log.stat(client, 10, id);
});
client.on('shardReconnecting', id => {
    console.log(`Shard with ID ${id} reconnected.`)
    functions.log.stat(client, 11, id);
});
client.on('shardDisconnect', id => {
    console.log(`Shard with ID ${id} reconnected.`)
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
        case "avatar": return await commands.info.avatar(message, args, client);
        case "help": return await commands.info.help(message, args, client, commands, storedSettings.prefix);
        case "ping": return await commands.utils.ping(message, client.ws.ping, client);
        case "poll": return await commands.utils.poll(message, args, client);
        case "sauce": return await commands.utils.sauce(message, args, client);
        case "saucenao": return await commands.utils.saucenao(message, args, client);
        case "userinfo": return await commands.info.userinfo(message, args, client);
        case "waifu2x": return await commands.utils.waifu2x(message, args, client);
        case "where": return await commands.info.where(message, args, client);
    }

    if (message.member.hasPermission("ADMINISTRATOR")) {
        switch (command) {
            case "voice": return await commands.admin.voice(message, args, client, storedSettings)
        }
    } else {
        return await message.channel.send(`${message.author}, 你沒有權限這麼做！`)
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
        const guildMember = newMember.member;
        const placeholder = {
            "{user.displayname}": guildMember.displayName,
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
            await newMember.guild.channels.create(channelSetting.channelName, { type: "voice", parent: category, bitrate: channelSetting.bitrate, permissionOverwrites: [{ id: newMember.member.id, allow: 57672464 }], reason: "自動創建語音頻道" })
                .then(async ch => {
                    await newMember.setChannel(ch);
                    checkchannel.push(ch.id);
                })
        }

        if (checkchannel.length == 0) return;
        if (oldMember.channel)
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
                        let allow = v.allow.bitfield;
                        let deny = 0;
                        if (k == oldMember.member.id) {
                            deny = 2097664;
                            if (v.allow.has(2097152)) allow -= 2097152;
                            if (v.allow.has(512)) allow -= 512;
                        }

                        permission.push({ id: k, allow: allow, deny: deny });
                        console.log(v.allow.has(2097664))
                    })
                    if (!oldMember.channel.permissionOverwrites.get(oldMember.member.id)) permission.push({ id: oldMember.member.id, deny: 2097664 });
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
//#endregion


client.login(config.token);