const Discord = require('discord.js');
const waifu = require("waifu2x").default;
const fs = require('fs');
const request = require('request');
const sizeOf = require('image-size');
const filesize = require("filesize");
const imgur = require('imgur-upload');
imgur.setClientID("e7c7974aa20c63c");

const functions = require("../../function/loader");

/**
 * 
 * @param {Discord.Message} message 
 * @param {Array} args
 * @param {Discord.Client} client
 * @returns 
 */
async function waifu2x(message, args, client) {
    try {
        functions.log.command(message, client, waifu2x.prop.name)
        if (message.attachments.size) {
            message.attachments.forEach(a => {
                download(a.attachment, a.name, () => {
                    console.log('done');
                    scale(message, args, a.name);
                })
            });
        } else {
            await message.reply("你沒有提供圖片");
        }
    } catch (e) {
        await message.reply(`發生了預料外的錯誤 \`${e.toString()}\``)
        return console.error(e)
    }
}
waifu2x.prop = {
    name: "waifu2x",
    desc: "",
    args: [
        {
            name: "圖片",
            type: "檔案<圖片>",
            desc: "要搜尋的圖片",
            option: false
        },
        {
            name: "-scale 數值",
            type: "數字",
            desc: "要放大的倍率 (1~4)",
            option: true
        },
        {
            name: "-noise 數值",
            type: "數字",
            desc: "要減噪的倍率 (0/1/2/3)",
            option: true
        }
    ],
    exam: [''],
    guild: true
};
module.exports = waifu2x;

var download = function (uri, filename, callback) {
    request.head(uri, function (__err, res, __body) {
        console.log('content-type:', res.headers['content-type']);
        console.log('content-length:', res.headers['content-length']);

        request(uri).pipe(fs.createWriteStream(`./cache/${filename}`)).on('close', callback);
    });
};

/**
 * 
 * @param {Discord.Message} message 
 * @param {*} args 
 * @param {*} file 
 */
async function scale(message, args, file) {
    const noises = parseInt(args[args.indexOf("-noise") + 1]) ? parseInt(args[args.indexOf("-noise") + 1]) : 0;
    const scales = parseInt(args[args.indexOf("-scale") + 1]) ? parseInt(args[args.indexOf("-scale") + 1]) : 2;
    if (noises > 3 || noises < 0) return await message.channel.send(`${message.author}, 除噪等級只能介於 0 ~ 3`);
    if (scales <= 0 || scales > 4) return await message.channel.send(`${message.author}, 縮放倍率只能介於 0 ~ 4`);

    await waifu.upscaleImage(`./cache/${file}`, `./cache/scaled/${file}`, { scale: scales, noise: noises });
    const dimensions = sizeOf(`./cache/scaled/${file}`);
    const stats = fs.statSync(`./cache/scaled/${file}`);
    const fileSizeInMb = filesize(stats.size);

    console.log(stats.size, fileSizeInMb);
    if (stats.size < 8388600) {
        const attachment = new Discord.MessageAttachment()
            .setFile(`./cache/scaled/${file}`)
        await message.reply(`你要的 ${scales} 倍大 :P \n${file} | ${dimensions.width}x${dimensions.height} | ${fileSizeInMb}`, { files: [attachment] });
        return;
    } else {
        imgur.upload(`./cache/scaled/${file}`, async (err, res) => {
            console.log(res.data.link); //log the imgur url
            await message.reply(`你要的 ${scales} 倍大 :P \n${file} | ${dimensions.width}x${dimensions.height} | ${fileSizeInMb}\n${res.data.link}`);
            return;
        });
        return;
    }

}