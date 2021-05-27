const Discord = require('discord.js');
const functions = require("../../function/loader");

/**
 * 
 * @param {Discord.Message} message 
 * @param {Array} args
 * @param {Discord.Client} client
 * @returns 
 */
async function nowplaying(message, __args, client) {
    try {
        functions.log.command(message, client, nowplaying.prop.name);

        if (message.guild.musicData.queue.length == 0) {
            const embed = new Discord.MessageEmbed()
                .setColor(client.colors.error)
                .setDescription('目前沒有在放音樂');
            await message.reply(embed);
            return;
        }

        const video = message.guild.musicData.nowPlaying;
        let description;
        if (video.duration == 'Live Stream')
            description = '即時串流';
        else
            description = playbackBar(message, video);


        const videoEmbed = new Discord.MessageEmbed()
            .setThumbnail(video.thumbnail)
            .setColor(client.colors.info)
            .setTitle(video.title)
            .setURL(video.url)
            .setDescription(description);
        await message.reply({ embed: videoEmbed, allowedMentions: { repliedUser: false } });
        return;

        function playbackBar(message, video) {
            const passedTimeInMS = message.guild.musicData.songDispatcher.streamTime;
            const passedTimeInMSObj = {
                seconds: Math.floor((passedTimeInMS / 1000) % 60),
                minutes: Math.floor((passedTimeInMS / (1000 * 60)) % 60),
                hours: Math.floor((passedTimeInMS / (1000 * 60 * 60)) % 24)
            };
            const passedTimeFormatted = formatDuration(passedTimeInMSObj);

            const totalDurationObj = video.rawDuration;
            const totalDurationFormatted = formatDuration(totalDurationObj);

            let totalDurationInMS = 0;
            Object.keys(totalDurationObj).forEach((key) => {
                if (key == 'hours') {
                    totalDurationInMS = totalDurationInMS + totalDurationObj[key] * 3600000;
                } else if (key == 'minutes') {
                    totalDurationInMS = totalDurationInMS + totalDurationObj[key] * 60000;
                } else if (key == 'seconds') {
                    totalDurationInMS = totalDurationInMS + totalDurationObj[key] * 100;
                }
            });
            const playBackBarLocation = Math.round((passedTimeInMS / totalDurationInMS) * 10);
            let playBack = '';
            for (let i = 1; i < 11; i++) {
                if (playBackBarLocation == 0) {
                    playBack = ':radio_button:　　　　　　　　　';
                    break;
                } else if (playBackBarLocation == 10) {
                    playBack = '　　　　　　　　　:radio_button:';
                    break;
                } else if (i == playBackBarLocation) {
                    playBack = playBack + ':radio_button:';
                } else {
                    playBack = playBack + '　';
                }
            }
            playBack = `${passedTimeFormatted}  ~~​${playBack}​~~  ${totalDurationFormatted}`;
            return playBack;
        }
        // prettier-ignore
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
        functions.log.error(message, client, nowplaying.prop.name, e);
        return console.error(e)
    }
}
nowplaying.prop = {
    name: "nowplaying",
    desc: "顯示目前播放",
    args: [],
    exam: [''],
    guild: true
};
module.exports = nowplaying;