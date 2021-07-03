const Discord = require('discord.js');
const functions = require("../../function/loader");
const { Lyrics } = require('spotify-lyrics-api');
let spotify_lyrics = new Lyrics("D:/ouo/DiscordBot/Kamiya/# --- Version 3/cookies.txt");
const Kuroshiro = require("@dsquare-gbu/kuroshiro");
const kuroshiro = new Kuroshiro();
const KuromojiAnalyzer = require("kuroshiro-analyzer-kuromoji");
(async () => await kuroshiro.init(new KuromojiAnalyzer()))();

/**
 * 
 * @param {Discord.Message} message 
 * @param {Array} args
 * @param {Discord.Client} client
 * @returns 
 */
async function synclyric(message, args, client) {
    try {
        functions.log.command(message, client, synclyric.prop.name);

        if (typeof message.guild.musicData.songDispatcher == 'undefined' || message.guild.musicData.songDispatcher == null) {
            const embed = new Discord.MessageEmbed()
                .setColor(client.colors.error)
                .setTitle(client.embedStat.error)
                .setDescription('目前沒有在放音樂');
            await message.reply(embed);
            return;
        }

        const video = message.guild.musicData.nowPlaying;
        if (video.duration == 'Live Stream') {
            const embed = new Discord.MessageEmbed()
                .setColor(client.colors.error)
                .setTitle(client.embedStat.error)
                .setDescription('即時串流無法搜尋動態歌詞');
            await message.reply(embed);
        }

        let syncedlyric;

        if (!args.length) {
            syncedlyric = await spotify_lyrics.fromName(encodeURIComponent(video.title));
        } else if (args.includes("-id")) {
            args.splice(args.indexOf("-id"), 1);
            syncedlyric = await spotify_lyrics.fromID(args[0]);
        } else {
            songName = message.content.slice(14);
            syncedlyric = await spotify_lyrics.fromName(encodeURIComponent(songName));
        }
        let now = -1,
            count = 0,
            preline = "​　　",
            preconv = "​　　",
            nowline = " ▶ ​ ",
            nowconv = " ▶ ​ ",
            nexline = "​　　" + syncedlyric[0].words,
            nexconv = "",
            messageToEdit,
            syncing = true,
            offset = 0,
            stop = false,
            mode = 0;

        const tms = message.guild.musicData.songDispatcher.streamTime;
        const tmsobj = {
            seconds: Math.floor((tms / 1000) % 60),
            minutes: Math.floor((tms / (1000 * 60)) % 60),
            hours: Math.floor((tms / (1000 * 60 * 60)) % 24)
        };

        const videoEmbed = new Discord.MessageEmbed()
            .setAuthor(message.guild.name + " (同步歌詞中...)", message.guild.iconURL())
            .setTitle(video.title)
            .setDescription(`${preline}\n${nowline}\n${nexline}`)
            .setFooter(`${formatDuration(tmsobj)}${(offset == 0) ? "" : ` ${offset.toString()}ms`} | 歌詞來源: Spotify`);
        messageToEdit = await message.reply({ embed: videoEmbed, allowedMentions: { repliedUser: false } });
        sync();
        await messageToEdit.react("⏪");
        await messageToEdit.react("◀️");
        await messageToEdit.react("▶️");
        await messageToEdit.react("⏩");
        await messageToEdit.react("⏹️");
        await messageToEdit.react("🇷");
        await messageToEdit.react("🇭");
        await messageToEdit.react("🇴");
        const filter = (reaction, user) => (reaction.emoji.name == '⏪' ||
            reaction.emoji.name == '◀️' ||
            reaction.emoji.name == '▶️' ||
            reaction.emoji.name == '⏩' ||
            reaction.emoji.name == '⏹️' ||
            reaction.emoji.name == '🇷' ||
            reaction.emoji.name == '🇭' ||
            reaction.emoji.name == '🇴') && (user.id == message.author.id || user.id == "437158166019702805");
        const collector = messageToEdit.createReactionCollector(filter);
        collector.on('collect', async (r, u) => {
            if (r.emoji.name === '⏪') {
                await r.users.remove(u.id);
                if (offset > -10000) {
                    offset -= 500;
                    syncing = true;
                    changeline(now);
                }
            }
            if (r.emoji.name === '◀️') {
                await r.users.remove(u.id);
                if (offset > -10000) {
                    offset -= 100;
                    syncing = true;
                    changeline(now);
                }
            }
            if (r.emoji.name === '▶️') {
                await r.users.remove(u.id);
                if (offset < 10000) {
                    offset += 100;
                    syncing = true;
                    changeline(now);
                }
            }
            if (r.emoji.name === '⏩') {
                await r.users.remove(u.id);
                if (offset < 10000) {
                    offset += 500;
                    syncing = true;
                    changeline(now);
                }
            }
            if (r.emoji.name === '⏹️') {
                stop = true;
                await messageToEdit.delete();
            }
            if (r.emoji.name === '🇷') {
                await r.users.remove(u.id);
                mode = "romaji";
                changeline(now);
            } if (r.emoji.name === '🇭') {
                await r.users.remove(u.id);
                mode = "hiragana";
                changeline(now);
            } if (r.emoji.name === '🇴') {
                await r.users.remove(u.id);
                mode = 0;
                changeline(now);
            }
        });

        function sync() {
            let checktime = setInterval(function () {
                if (message.guild.musicData.songDispatcher.streamTime == null) return clearInterval(checktime);
                const passedTimeInMS = message.guild.musicData.songDispatcher.streamTime + 100 + offset;

                /*
                if (passedTimeInMS < syncedlyric[0].time) {
                    syncing = false;
                    changeline(now);
                }
                */

                if (syncing) {
                    syncedlyric.map((v, i, a) => {
                        if (i != a.length)
                            if (passedTimeInMS >= v.time && passedTimeInMS < a[i + 1].time) {
                                now = i;
                                syncing = false;
                                changeline(now);
                            }
                    })
                }

                if (passedTimeInMS >= syncedlyric[now + 1].time) {
                    now = now + 1;
                    if (!syncing) {
                        changeline(now);
                    }
                }
                /*
                if (syncing && !(passedTimeInMS >= syncedlyric[now + 1].time)) {
                    syncing = false;
                }
                */

                if (typeof syncedlyric[now + 1] == "undefined") {
                    clearInterval(checktime);
                    stop = true;
                    return;
                }

                if (stop) {
                    changeline(now);
                    clearInterval(checktime);
                    return;
                }
            }, 100);
        }

        async function changeline(now) {
            if (stop) return;
            preline = (now == -1) ? "​　" : (now == 0) ? "​　" : "▪️ ​ " + syncedlyric[now - 1].words;
            nowline = (now == -1) ? " ▶ ​ " : " ▶ ​ **" + syncedlyric[now].words + " **";
            nexline = (typeof syncedlyric[now + 1] == "undefined") ? "▪️ ​ 　*(END)*" : "▪️ ​ " + syncedlyric[now + 1].words;

            if (mode) {
                preconv = "\n" + ((now == -1) ? "​　" : (now == 0) ? "​　" : "▪️ ​ " + await kuroshiro.convert(syncedlyric[now - 1].words, { to: mode, mode: "spaced" }));
                nowconv = "\n" + ((now == -1) ? `${mode == "hiragana" ? "🇭" : "🇷"} ​ ` : `${mode == "hiragana" ? "🇭" : "🇷"} ​ **` + await kuroshiro.convert(syncedlyric[now].words, { to: mode, mode: "spaced" }) + " **");
                nexconv = "\n" + ((typeof syncedlyric[now + 1] == "undefined") ? "▪️ ​ 　*(END)*" : "▪️ ​ " + await kuroshiro.convert(syncedlyric[now + 1].words, { to: mode, mode: "spaced" }));
            } else {
                preconv = nowconv = nexconv = "";
            }

            // console.log(nowline);
            const passedTimeInMS = message.guild.musicData.songDispatcher.streamTime;
            const passedTimeInMSObj = {
                seconds: Math.floor((passedTimeInMS / 1000) % 60),
                minutes: Math.floor((passedTimeInMS / (1000 * 60)) % 60),
                hours: Math.floor((passedTimeInMS / (1000 * 60 * 60)) % 24)
            };

            const embed = new Discord.MessageEmbed()
                .setColor(client.colors.info)
                .setAuthor(`${message.guild.name}${syncing ? " (同步歌詞中...)" : ""}`, message.guild.iconURL())
                .setTitle(video.title)
                .setDescription(`${preline}${preconv}\n${nowline}${nowconv}\n${nexline}${nexconv}`)
                .setFooter(`${formatDuration(passedTimeInMSObj)}${(offset == 0) ? "" : ` ${offset.toString()}ms`} | 歌詞來源: Spotify`)
            await messageToEdit.edit(embed);
            if (typeof syncedlyric[now + 1] == "undefined") await messageToEdit.reactions.removeAll();
        }

        function formatDuration(durationObj) {
            const duration = `${durationObj.hours ? (durationObj.hours + ':') : ''}${durationObj.minutes ? durationObj.minutes : '00'
                }:${(durationObj.seconds < 10)
                    ? ('0' + durationObj.seconds)
                    : (durationObj.seconds
                        ? durationObj.seconds
                        : '00')
                }`;
            return duration;
        }

    } catch (e) {
        await message.reply(`找不到歌詞`);
        // functions.log.error(message, client, synclyric.prop.name, e);
        return console.error(e);
    }
}
synclyric.prop = {
    name: "synclyric",
    desc: "動態歌詞",
    args: [
        {
            name: "歌曲名稱|Spotify ID",
            type: "字串",
            desc: "指定歌曲",
            option: true
        },
        {
            name: "-id",
            type: "",
            desc: "指定為ID查詢",
            option: true
        }
    ],
    exam: [''],
    guild: true
};
module.exports = synclyric;