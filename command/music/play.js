const Discord = require('discord.js');
const functions = require("../../function/loader");
const youtubeAPI = require('../../config').youtubeAPI;
const Youtube = require('simple-youtube-api');
const youtube = new Youtube(youtubeAPI);
const ytdl = require('ytdl-core');

/**
 * 
 * @param {Discord.Message} message 
 * @param {Array} args
 * @param {Discord.Client} client
 * @returns 
 */
async function play(message, args, client) {
    try {
        functions.log.command(message, client, play.prop.name);
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            const embed = new Discord.MessageEmbed()
                .setColor(client.colors.error)
                .setTitle(client.embedStat.error)
                .setDescription('你要在語音頻道裡才能使用這個指令');
            await message.reply(embed);
            return;
        }
        if (!args.length) return;

        if (!message.guild.musicData.bindmsg) {
            message.guild.musicData.bindmsg = message;
            const embed = new Discord.MessageEmbed()
                .setColor(client.colors.success)
                .setDescription(`已綁定到語音 ${voiceChannel}, 文字 ${message.channel}`)
            await message.reply({ embed: embed, allowedMentions: { repliedUser: false } })
        }

        if (args.includes("-v") || args.includes("-volume")) {
            const vol = +args[(args.includes("-volume") ? args.indexOf("-volume") : args.indexOf("-v")) + 1];

            if (vol > 200) {
                const embed = new Discord.MessageEmbed()
                    .setColor(client.colors.error)
                    .setTitle(client.embedStat.error)
                    .setDescription('音量不能超過 `200%` (保護你的耳朵 :D');
                await message.reply(embed);
                return;
            }
            if (vol < 0) {
                const embed = new Discord.MessageEmbed()
                    .setColor(client.colors.error)
                    .setTitle(client.embedStat.error)
                    .setDescription('音量不能小於 `0%`');
                await message.reply(embed);
                return;
            }
            message.guild.musicData.volume = vol / 100;
            const embed = new Discord.MessageEmbed()
                .setColor(client.colors.success)
                .setTitle(client.embedStat.success)
                .setDescription(`音量已設成 \`${vol}%\``);
            message.reply({ embed: embed, allowedMentions: { repliedUser: false } })
            args.splice(args.includes("-volume") ? args.indexOf("-volume") : args.indexOf("-v"), 2);
        }
        if (args.includes("-l") || args.includes("-loop")) {
            const none = new Discord.MessageEmbed()
                .setColor(client.colors.info)
                .setDescription(':arrow_right: 重複模式: 已關閉');
            const repeat = new Discord.MessageEmbed()
                .setColor(client.colors.info)
                .setDescription(':repeat: 重複模式: 佇列重複');
            const repeatOne = new Discord.MessageEmbed()
                .setColor(client.colors.info)
                .setDescription(':repeat_one: 重複模式: 單首重複');
            const loop = args[(args.includes("-loop") ? args.indexOf("-loop") : args.indexOf("-l")) + 1];
            if (loop == 'none') {
                message.guild.musicData.loopingMode = 'none';
                await message.reply({ embed: none, allowedMentions: { repliedUser: false } });
            } else if (loop == 'repeat') {
                message.guild.musicData.loopingMode = 'repeat';
                await message.reply({ embed: repeat, allowedMentions: { repliedUser: false } });
            } else if (loop == 'repeatOne') {
                message.guild.musicData.loopingMode = 'repeatOne';
                await message.reply({ embed: repeatOne, allowedMentions: { repliedUser: false } });
            } else {
                const embed = new Discord.MessageEmbed()
                    .setColor(client.colors.error)
                    .setTitle(client.embedStat.error)
                    .setDescription('無效的參數');
                await message.reply(embed);
            }

            args.splice(args.includes("-loop") ? args.indexOf("-loop") : args.indexOf("-l"), 2);
        }

        args.forEach(async v => {
            //#region Playlist
            if (v.match(/^(?!.*\?.*\bv=)https:\/\/www\.youtube\.com\/.*\?.*\blist=.*$/)) {
                const playlist = await youtube.getPlaylist(v).catch(function () {
                    const embed = new Discord.MessageEmbed()
                        .setColor(client.colors.error)
                        .setTitle(client.embedStat.error)
                        .setDescription('播放清單不存在或未公開');
                    message.reply(embed);
                    return;
                });
                const videosArr = await playlist.getVideos().catch(function () {
                    const embed = new Discord.MessageEmbed()
                        .setColor(client.colors.error)
                        .setTitle(client.embedStat.error)
                        .setDescription('獲取播放清單中的影片時發生錯誤');
                    message.reply(embed);
                    return;
                });
                let songs = [];
                for (let i = 0; i < (videosArr.length > 10 ? 11 : videosArr.length); i++) {
                    if (videosArr[i].raw.status.privacyStatus == 'private') {
                        continue;
                    } else {
                        try {
                            if (i < 10) {
                                const video = await videosArr[i].fetch();
                                message.guild.musicData.queue.push(constructSongObj(video, voiceChannel, message.member.user, message.channel));
                                songs.push(`${i < 9 ? " " : ""}${songs.length + 1}. ${video.title}`);
                            } else {
                                songs.push(`  ...(還有 ${videosArr.length - 10} 項)`);
                            }
                        } catch (err) {
                            return console.error(err);
                        }
                    }
                }

                if (message.guild.musicData.isPlaying == false) {
                    message.guild.musicData.isPlaying = true;
                    const embed = new Discord.MessageEmbed()
                        .setColor(client.colors.success)
                        .setTitle(client.embedStat.success)
                        .setDescription(`:musical_note: 播放清單 - ${playlist.title} 已加到佇列`)
                    await message.reply(`**已新增**\`\`\`py\n${songs.join("\n")}\n\`\`\``, { embed: embed, allowedMentions: { repliedUser: false } });
                    await message.suppressEmbeds(true);
                    return playSong(message.guild.musicData.queue);
                } else if (message.guild.musicData.isPlaying == true) {
                    const embed = new Discord.MessageEmbed()
                        .setColor(client.colors.success)
                        .setTitle(client.embedStat.success)
                        .setDescription(`:musical_note: 播放清單 - ${playlist.title} 已加到佇列`)
                        .addField("已新增", songs.join("\n"));
                    await message.reply(`**已新增**\`\`\`py\n${songs.join("\n")}\n\`\`\``, { embed: embed, allowedMentions: { repliedUser: false } });
                    await message.suppressEmbeds(true);
                    return;
                }
            }
            //#endregion

            //#region Video
            if (v.match(/^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/)) {
                query = v
                    .replace(/(>|<)/gi, '')
                    .split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
                const id = query[2].split(/[^0-9a-z_\-]/i)[0];
                const video = await youtube.getVideoByID(id).catch(async () => {
                    const embed = new Discord.MessageEmbed()
                        .setColor(client.colors.error)
                        .setTitle(client.embedStat.error)
                        .setDescription('獲取影片資訊時發生錯誤');
                    await message.reply(embed);
                    return;
                })
                //
                const error = new Discord.MessageEmbed()
                    .setColor(client.colors.error)
                    .setTitle(client.embedStat.error);

                // 不支援直播
                if (video.raw.snippet.liveBroadcastContent === 'live') {
                    error.setDescription('不支援直播');
                    return message.reply(error);
                }
                // // 不支援大於1小時
                // if (video.duration.hours !== 0) {
                //   error.setDescription('影片大於1小時');
                //   return message.reply(error);
                // }
                // // 限制佇列數量
                // if (message.guild.musicData.queue.length > 10) {
                //   error.setDescription('佇列已有太多影片了');
                //   return message.reply(error);
                // }
                //
                message.guild.musicData.queue.push(
                    constructSongObj(video, voiceChannel, message.member.user, message.channel)
                );

                if (!message.guild.musicData.bindmsg) {
                    message.guild.musicData.bindmsg = message;
                    const embed = new Discord.MessageEmbed()
                        .setColor(client.colors.success)
                        .setDescription(`已綁定到語音 ${voiceChannel}, 文字 ${message.guild.musicData.bindmsg.channel}`)
                    await message.reply({ embed: embed, allowedMentions: { repliedUser: false } })
                }

                if (message.guild.musicData.isPlaying == false || typeof message.guild.musicData.isPlaying == 'undefined') {
                    message.guild.musicData.isPlaying = true;
                    const embed = new Discord.MessageEmbed()
                        .setColor(client.colors.success)
                        .setTitle(client.embedStat.success)
                        .setDescription(`:musical_note: ${video.title} 已加到佇列`);
                    await message.reply({ embed: embed, allowedMentions: { repliedUser: false } });
                    await message.suppressEmbeds(true);
                    playSong(message.guild.musicData.queue);
                    return;
                } else if (message.guild.musicData.isPlaying == true) {
                    const embed = new Discord.MessageEmbed()
                        .setColor(client.colors.success)
                        .setTitle(client.embedStat.success)
                        .setDescription(`:musical_note: ${video.title} 已加到佇列`);
                    await message.reply({ embed: embed, allowedMentions: { repliedUser: false } });
                    await message.suppressEmbeds(true);
                    return;
                }
            }
            //#endregion
        })

        /**
         * 
         * @param {{url: string, title: string, rawDuration: { years: number months: number, weeks: number, days: number, hours: number, minutes: number, seconds: number },duration: string, thumbnail: video.string, voiceChannel: VoiceChannel, memberDisplayName: string, memberAvatar: string, messageChannel: Discord.TextChannel }[]} queue 
         * @returns {void}
         */
        function playSong(queue) {
            if (!queue[0]) {
                message.guild.musicData.isPlaying = false;
                message.guild.musicData.nowPlaying = null;
                message.guild.musicData.songDispatcher = null;
                /*
                if (message.guild.me.voice.channel) {
                    message.guild.me.voice.channel.leave();
                }
                */
                return;
            };

            (message.guild.musicData.nowPlaying ? message.guild.musicData.nowPlaying.voiceChannel : queue[0].voiceChannel)
                .join()
                .then(async connection => {
                    await connection.voice.setSelfDeaf(true);
                    const dispatcher = connection
                        .play(
                            ytdl(queue[0].url, {
                                filter: format => format.contentLength,
                                quality: 'highestaudio',
                                highWaterMark: 1 << 25
                            }))
                        .on('start', async () => {
                            message.guild.musicData.songDispatcher = dispatcher;
                            dispatcher.setVolume(message.guild.musicData.volume);
                            const videoEmbed = new Discord.MessageEmbed()
                                .setColor(client.colors.info)
                                .setAuthor(message.guild.musicData.bindmsg.guild.name, message.guild.musicData.bindmsg.guild.iconURL({ dynamic: true }))
                                .setDescription(`語音 ${voiceChannel}, 文字 ${message.guild.musicData.bindmsg.channel}`)
                                .addField('正在播放:', `[${queue[0].title}](${queue[0].url})`, true)
                                .addField('長度:', queue[0].duration, true)
                                .setThumbnail(queue[0].thumbnail)
                                .setFooter(`${queue[0].memberDisplayName} 點的歌 • 音量 ${message.guild.musicData.volume * 100} %`, queue[0].memberAvatar);
                            if (queue[1]) videoEmbed.addField('\u200B', '\u200B', true).addField('下一首:', `[${queue[1].title}](${queue[1].url})`, true).addField('長度:', queue[1].duration, true).addField('\u200B', '\u200B', true);

                            // if there's no np message
                            if (!message.guild.musicData.npmsg) {
                                message.guild.musicData.npmsg = await message.guild.musicData.bindmsg.channel.send(videoEmbed);
                            };

                            // check if message is the last one in the binded channel
                            await message.guild.musicData.bindmsg.channel.messages.fetch({ limit: 1 }).then(async messages => {
                                let lastMessage = messages.first();
                                if (lastMessage.id == message.guild.musicData.npmsg.id) {
                                    message.guild.musicData.npmsg = await message.guild.musicData.npmsg.edit(videoEmbed);
                                } else {
                                    await message.guild.musicData.npmsg.delete();
                                    message.guild.musicData.npmsg = await message.guild.musicData.bindmsg.channel.send(videoEmbed);
                                }
                            }).catch(console.error);

                            message.guild.musicData.nowPlaying = queue[0];
                            return;
                        })
                        .on('finish', async () => {
                            if (queue.length >= 1) {
                                if (message.guild.musicData.loopingMode == 'none') { //no repeat
                                    queue.shift()
                                } else if (message.guild.musicData.loopingMode == 'repeat') { // repeat queue
                                    queue.push(queue.shift())
                                }; // if not passing any, repeat one

                                playSong(queue, message);
                                return;
                            } else {
                                if (message.guild.musicData.npmsg) {
                                    await message.guild.musicData.npmsg.delete();
                                    message.guild.musicData.bindmsg = null;
                                    message.guild.musicData.npmsg = null;
                                };
                                message.guild.musicData.isPlaying = false;
                                message.guild.musicData.nowPlaying = null;
                                message.guild.musicData.songDispatcher = null;
                                /*
                                if (message.guild.me.voice.channel) {
                                    message.guild.me.voice.channel.leave();
                                    return;
                                }
                                */
                            }
                        })
                        .on('error', async e => {
                            const embed = new Discord.MessageEmbed()
                                .setColor(client.colors.error)
                                .setTitle(client.embedStat.error)
                                .setDescription(`無法播放影片 \`${e.toString()}\``);
                            await message.channel.send(embed);
                            console.error(e);
                            message.guild.musicData.queue.length = 0;
                            message.guild.musicData.isPlaying = false;
                            message.guild.musicData.nowPlaying = null;
                            message.guild.musicData.songDispatcher = null;
                            message.guild.musicData.bindmsg = null;
                            message.guild.musicData.npmsg = null;
                            message.guild.me.voice.channel.leave();
                            return;
                        });
                })
            /*.catch(function () {
                message.say('我沒有權限進入語音頻道!');
                message.guild.musicData.queue.length = 0;
                message.guild.musicData.isPlaying = false;
                message.guild.musicData.nowPlaying = null;
                message.guild.musicData.songDispatcher = null;
                if (message.guild.me.voice.channel) {
                    message.guild.me.voice.channel.leave();
                }
                return;
            });*/
        }

        /**
         * 
         * @param {*} video 
         * @param {Discord.VoiceChannel} voiceChannel 
         * @param {Discord.User} user 
         * @returns {{ url: string, title: string, rawDuration: { years: number, months: number, weeks: number, days: number, hours: number, minutes: number, seconds: number }, duration: string, thumbnail: string, voiceChannel: Discord.VoiceChannel, memberDisplayName: string, memberAvatar: string, messageChannel: Discord.TextChannel}}
         */
        function constructSongObj(video, voiceChannel, user, textChannel) {
            let duration = formatDuration(video.duration);
            if (duration == '00:00') duration = 'Live Stream';
            return {
                url: `https://www.youtube.com/watch?v=${video.raw.id}`,
                title: video.title,
                rawDuration: video.duration,
                duration,
                thumbnail: video.thumbnails.high.url,
                voiceChannel,
                memberDisplayName: user.username,
                memberAvatar: user.avatarURL({ dynamic: true }),
                messageChannel: textChannel
            };
        }

        /**
         * 
         * @param {{ years: number, months: number, weeks: number, days: number, hours: number, minutes: number, seconds: number }} durationObj 
         * @returns {string}
         */
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
        await message.reply(`發生了預料外的錯誤 \`${e.toString()}\``);
        functions.log.error(message, client, play.prop.name, e);
        return console.error(e)
    }
}
play.prop = {
    name: "play",
    desc: "播放音樂",
    args: [
        {
            name: "音樂",
            type: "連結|檔案",
            desc: "要播放的音樂",
            option: false
        }
    ],
    exam: ['https://www.youtube.com/watch?v=Lrj2Hq7xqQ8'],
    guild: true
};
module.exports = play;