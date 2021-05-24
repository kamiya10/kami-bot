const Discord = require('discord.js');
const functions = require("../../function/loader");
const Mee6LevelsApi = require("mee6-levels-api");

/**
 * userinfo
 * @param {Discord.Message} message 
 * @param {Array} args
 * @returns 
 */
async function userinfo(message, args, client) {
    try {
        functions.log.command(message, client, userinfo.prop.name)
        const options = {
            dateStyle: 'long',
            timeStyle: 'long'
        };

        const guildMember = message.mentions.members.first() || message.guild.members.cache.get(args.find(v => /\d+/.test(v))) || message.member;

        if (guildMember !== undefined) {
            let presence = [], voice = [], roles = [], online = [], boost;
            guildMember.roles.cache.forEach(v => roles.push(`<@&${v.id}>`))
            if (guildMember.presence.clientStatus) {
                const clientStatus = guildMember.presence.clientStatus;
                if (clientStatus.desktop) online.push(`桌面版: ${clientStatus.desktop == 'online' ? "<:online:832272180544274432> 上線" : clientStatus.desktop == 'idle' ? "<:idle:832272472375558184> 閒置" : clientStatus.desktop == 'dnd' ? "<:dnd:832272180510982224> 請勿打擾" : ":grey_question: 未知狀態"}`);
                if (clientStatus.mobile) online.push(`手機版: ${clientStatus.mobile == 'online' ? "<:mobile:832279180615876658> 上線" : clientStatus.mobile == 'idle' ? "<:idle:832272472375558184> 閒置" : clientStatus.mobile == 'dnd' ? "<:dnd:832272180510982224> 請勿打擾" : ":grey_question: 未知狀態"}`);
                if (clientStatus.web) online.push(`網頁版: ${clientStatus.web == 'online' ? "<:online:832272180544274432> 上線" : clientStatus.web == 'idle' ? "<:idle:832272472375558184> 閒置" : clientStatus.web == 'dnd' ? "<:dnd:832272180510982224> 請勿打擾" : ":grey_question: 未知狀態"}`);
                if (!online.length) online.push("<:invisible:832272180078706708> 離線"); 
            } else online.push("<:invisible:832272180078706708> 離線")
            if (guildMember.presence.activities.length) {
                guildMember.presence.activities.forEach(v => {
                    presence.push(`\`${v.type == 'PLAYING' ? "正在玩" : v.type == 'STREAMING' ? "正在直播" : v.type == 'LISTENING' ? "正在聽" : v.type == 'WATCHING' ? "正在看" : "自定狀態"}\`: ${v.type == 'CUSTOM_STATUS' ? v.emoji ? v.emoji : "" : ""} ${v.type == 'CUSTOM_STATUS' ? v.state ? `**${v.state}**` : "" : `**${v.name}**`} ${v.type == 'CUSTOM_STATUS' ? "" : v.assets ? v.assets.largeText ? `| ${v.assets.largeText}` : "" : ""}${v.type == 'CUSTOM_STATUS' ? "" : v.details ? "\n　　 　 " + v.details : ""}${v.type == 'CUSTOM_STATUS' ? "" : v.state ? "\n　　 　 " + v.state : ""}${v.type == 'CUSTOM_STATUS' ? "" : v.timestamps ? "\n　　 　 " + (v.type == 'CUSTOM_STATUS' ? "" : v.timestamps ? v.timestamps.end ? "" : "經過時間 " : "") + Math.round((new Date() - v.timestamps.start) / 1000).toString().toHHMMSS() : ""}${v.type == 'CUSTOM_STATUS' ? "" : v.timestamps ? v.timestamps.end ? " / " + Math.round((v.timestamps.end - v.timestamps.start) / 1000).toString().toHHMMSS() : "" : ""}`)
                })
            } else presence.push("`無狀態可顯示`");
            if (guildMember.voice.channelID) {
                const voiceStatus = guildMember.voice;
                voice.push(`ID: \`${voiceStatus.sessionID}\``);
                voice.push(`頻道: ${voiceStatus.channel}`);
                voice.push(`語音拒聽: \`${voiceStatus.deaf ? "是" : "否"}\` ${voiceStatus.serverDeaf ? "(伺服器)" : ""}`);
                voice.push(`語音靜音: \`${voiceStatus.mute ? "是" : "否"}\` ${voiceStatus.serverMute ? "(伺服器)" : ""}`);
                voice.push(`正在直播: \`${voiceStatus.streaming ? "是" : "否"}\``);
            } else voice.push("`未在語音頻道中`");
            if (guildMember.premiumSinceTimestamp) {
                boost = "自從 " + guildMember.premiumSince.toLocaleString('zh-TW', options);
            } else boost = "`無`"

            const info = new Discord.MessageEmbed()
                .setColor(guildMember.displayHexColor) //#ffcdbf
                .setAuthor(message.guild.name, message.guild.iconURL())
                .setTitle(guildMember.user.tag)
                .addField("聊天等級", "`獲取資料中...`", true)
                .setThumbnail(guildMember.user.displayAvatarURL({ dynamic: true }));
            if (guildMember.nickname)
                info.setDescription(`又稱為: ${guildMember.nickname}`);
            if (args.includes("-d")) {
                info.setTitle(guildMember.user.tag + " 的詳細資料")
                    .addField("上線狀態", online.join("\n"), true)
                    .addField("伺服器加成", boost, true)
                    .addField("使用者ID", `\`${guildMember.id}\``)
                    .addField("語音狀態", voice.join("\n"))
                    .addField("遊戲狀態", presence.join("\n"))
                    .addField("身分組", roles.join(", "))
            }
            info.addField(`加入 ${guildMember.guild.name}`, new Date(guildMember.joinedTimestamp).toLocaleString('zh-TW', options))
                .addField("加入 Discord", new Date(guildMember.user.createdTimestamp).toLocaleString('zh-TW', options))
            const sent = await message.reply({ embed: info, allowedMentions: { repliedUser: false } });

            // TODO: 待補其他等級系統
            // MEE6 only now
            let level, system;
            await Mee6LevelsApi.getUserXp(guildMember.guild.id, guildMember.user.id).then(user => {
                system = "MEE6";
                level = user;
            }).catch(__ => {
                level = undefined;
            });

            if (level != undefined) {
                const final = new Discord.MessageEmbed()
                    .setColor(guildMember.displayHexColor) //#ffcdbf
                    .setAuthor(message.guild.name, message.guild.iconURL())
                    .setTitle(guildMember.user.tag)
                    .addField(`聊天等級 (${system})`, `**${level.level} 等** (排名 #${level.rank})\n**${level.xp.userXp}** / ${level.xp.levelXp} (還差 ${level.xp.levelXp - level.xp.userXp})\n**${level.messageCount}** 訊息`, true)
                    .setThumbnail(guildMember.user.displayAvatarURL({ dynamic: true }));
                if (guildMember.nickname)
                    final.setDescription(`又稱為: ${guildMember.nickname}`);
                if (args.includes("-d")) {
                    final.setTitle(guildMember.user.tag + " 的詳細資料")
                        .addField("上線狀態", online.join("\n"), true)
                        .addField("伺服器加成", boost, true)
                        .addField("使用者ID", `\`${guildMember.id}\``)
                        .addField("語音狀態", voice.join("\n"))
                        .addField("遊戲狀態", presence.join("\n"))
                        .addField("身分組", roles.join(", "))
                }
                final.addField(`加入 ${guildMember.guild.name}`, new Date(guildMember.joinedTimestamp).toLocaleString('zh-TW', options))
                    .addField("加入 Discord", new Date(guildMember.user.createdTimestamp).toLocaleString('zh-TW', options))
                await sent.edit(final);
                return;
            } else {
                const final = new Discord.MessageEmbed()
                    .setColor(guildMember.displayHexColor) //#ffcdbf
                    .setAuthor(message.guild.name, message.guild.iconURL())
                    .setTitle(guildMember.user.tag)
                    .addField("聊天等級", "`未偵測到等級系統`", true)
                    .setThumbnail(guildMember.user.displayAvatarURL({ dynamic: true }));
                if (guildMember.nickname)
                    final.setDescription(`又稱為: ${guildMember.nickname}`);
                if (args.includes("-d")) {
                    final.setTitle(guildMember.user.tag + " 的詳細資料")
                        .addField("上線狀態", online.join("\n"), true)
                        .addField("伺服器加成", boost, true)
                        .addField("使用者ID", `\`${guildMember.id}\``)
                        .addField("語音狀態", voice.join("\n"))
                        .addField("遊戲狀態", presence.join("\n"))
                        .addField("身分組", roles.join(", "))
                }
                final.addField(`加入 ${guildMember.guild.name}`, new Date(guildMember.joinedTimestamp).toLocaleString('zh-TW', options))
                    .addField("加入 Discord", new Date(guildMember.user.createdTimestamp).toLocaleString('zh-TW', options))
                await sent.edit(final);
                return;
            }
        }
    } catch (e) {
        await message.reply(`發生了預料外的錯誤 \`${e.toString()}\``)
        return console.error(e)
    }
};
userinfo.prop = {
    name: "userinfo",
    desc: "查看成員資料",
    args: [
        {
            name: "使用者",
            type: "使用者ID|提及",
            desc: "指定要查看的使用者",
            option: true
        },
        {
            name: "-d",
            type: "",
            desc: "詳細資料",
            option: true
        }
    ],
    exam: ['', '<@632589168438149120> -d'],
    guild: true
};
module.exports = userinfo;

String.prototype.toHHMMSS = function () {
    var sec_num = parseInt(this, 10);
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);
    if (hours < 10 && hours != 0) hours = "0" + hours + "："; else hours = "";
    if (minutes < 10) minutes = "0" + minutes;
    if (seconds < 10) seconds = "0" + seconds;
    return hours + minutes + '：' + seconds;
};