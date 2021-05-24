const Discord = require('discord.js');
const functions = require("../../function/loader");
const SauceNAO = require('saucenao')
let mySauce = new SauceNAO('05e07f80d5ad365cb7c6c58568c21345f5c145d3')

/**
 * saucenao
 * @param {Discord.Message} message 
 * @param {Array} args
 * @returns 
 */
async function saucenao(message, args = undefined, client) {

    try {
        functions.log.command(message, client, saucenao.prop.name)
        if (args.length) {
            if (args[0].startsWith('https://discord.com/channels/')) {
                message.channel.messages.fetch(args[0].slice(67, args[0].length))
                    .then(messages => {
                        const lastMessage = messages;
                        lastMessage.attachments.forEach(attachment => {
                            // do something with the attachment
                            const url = attachment.url;
                            mySauce(url).then((response) => {
                                console.log('Request successful')
                                console.dir(response.json)
                                console.log(response.json.results[0])
                                if (response.json.results[0].header.index_name.match(/(nhentai)/gi) && lastMessage.channel.nsfw === false) {
                                    const saucenotfound = new Discord.MessageEmbed()
                                        .setColor(message.member.displayHexColor)
                                        .setAuthor('SauceNAO', 'https://www.userlogos.org/files/logos/zoinzberg/SauceNAO_2.png', `https://saucenao.com/search.php?db=999&url=${url}`)
                                        .setTitle('Sauce not found')
                                        .setDescription("很遺憾地我無法顯示結果，這可能是因為這個頻道未標記為nsfw或無搜尋結果")
                                        .setTimestamp()
                                        .setFooter(`餘額: ${response.json.header.long_remaining} / 200`)
                                    message.channel.send(saucenotfound);
                                    return;
                                } else {
                                    if ('ext_urls' in response.json.results[0].data) {
                                        const saucefound = new Discord.MessageEmbed()
                                            .setColor(message.member.displayHexColor)
                                            .setTitle(response.json.results[0].data.title)
                                            .setURL(response.json.results[0].data.source || response.json.results[0].data.ext_urls[0])
                                            .setAuthor(`SauceNAO (${('source' in response.json.results[0].data) ? (response.json.results[0].data.source !== '') ? response.json.results[0].data.source.match(/(twitter|Yande\.re)/gi)[0] : response.json.results[0].header.index_name.match(/(pixiv|gelbooru|Yande\.re|danbooru|twitter)/gi)[0] : response.json.results[0].header.index_name.match(/(pixiv|gelbooru|Yande\.re|danbooru|twitter)/gi)[0]})`, 'https://www.userlogos.org/files/logos/zoinzberg/SauceNAO_2.png', `https://saucenao.com/search.php?db=999&url=${url}`)
                                            .setDescription(`相似度: **${response.json.results[0].header.similarity}%**\n標題: ${response.json.results[0].data.title}\n作者: ${response.json.results[0].data.member_name} (${response.json.results[0].data.member_id})`)
                                            .setThumbnail(response.json.results[0].header.thumbnail)
                                            .setTimestamp()
                                            .setFooter(`餘額: ${response.json.header.long_remaining} / 200`)
                                        message.channel.send(saucefound);
                                    } else {
                                        const saucefound = new Discord.MessageEmbed()
                                            .setColor(message.member.displayHexColor)
                                            .setTitle(response.json.results[0].data.title || response.json.results[0].data.source)
                                            .setAuthor(`SauceNAO (${response.json.results[0].header.index_name.match(/(pixiv|gelbooru|Yande\.re|danbooru|twitter)/gi)[0]})`, 'https://www.userlogos.org/files/logos/zoinzberg/SauceNAO_2.png', `https://saucenao.com/search.php?db=999&url=${url}`)
                                            .setDescription(`相似度: **${response.json.results[0].header.similarity}%**\n標題: ${response.json.results[0].data.title || response.json.results[0].data.jp_name}\n作者: ${response.json.results[0].data.member_name || response.json.results[0].data.creator.join(', ')} ${('member_id' in response.json.results[0].data) ? "(" + response.json.results[0].data.member_id + ")" : ""})`)
                                            .setThumbnail(response.json.results[0].header.thumbnail)
                                            .setTimestamp()
                                            .setFooter(`餘額: ${response.json.header.long_remaining} / 200`)
                                        message.channel.send(saucefound);
                                        return;
                                    }
                                }
                            }, (error) => {
                                console.error('Request encountered an error')
                                console.dir(error.request)
                                const sauceerror = new Discord.MessageEmbed()
                                    .setColor('red')
                                    .setAuthor('SauceNAO', 'https://www.userlogos.org/files/logos/zoinzberg/SauceNAO_2.png', `https://saucenao.com/search.php?db=999&url=${url}`)
                                    .setTitle(":x: 錯誤")
                                    .setDescription("請求時發生錯誤")
                                    .setTimestamp()
                                message.channel.send(sauceerror);
                            })
                        });
                    });
            } else if (args[0].startsWith('https://')) {
                mySauce(args[0]).then((response) => {
                    console.log('Request successful')
                    console.dir(response.json)
                    console.log(response.json.results[0])
                    if (response.json.results[0].header.index_name.match(/(nhentai)/gi) && lastMessage.channel.nsfw === false) {
                        const saucenotfound = new Discord.MessageEmbed()
                            .setColor(message.member.displayHexColor)
                            .setAuthor('SauceNAO', 'https://www.userlogos.org/files/logos/zoinzberg/SauceNAO_2.png', `https://saucenao.com/search.php?db=999&url=${args[0]}`)
                            .setTitle('Sauce not found')
                            .setDescription("很遺憾地我無法顯示結果，這可能是因為這個頻道未標記為nsfw或無搜尋結果")
                            .setTimestamp()
                            .setFooter(`餘額: ${response.json.header.long_remaining} / 200`)
                        message.channel.send(saucenotfound);
                        return;
                    } else {
                        if ('ext_urls' in response.json.results[0].data) {
                            const saucefound = new Discord.MessageEmbed()
                                .setColor(message.member.displayHexColor)
                                .setTitle(response.json.results[0].data.title)
                                .setURL(response.json.results[0].data.source || response.json.results[0].data.ext_urls[0])
                                .setAuthor(`SauceNAO (${('source' in response.json.results[0].data) ? (response.json.results[0].data.source !== '') ? response.json.results[0].data.source.match(/(twitter)/gi)[0] : response.json.results[0].header.index_name.match(/(pixiv|gelbooru|Yande\.re|danbooru|twitter|deviantArt)/gi)[0] : response.json.results[0].header.index_name.match(/(pixiv|gelbooru|Yande\.re|danbooru|twitter|deviantArt)/gi)[0]})`, 'https://www.userlogos.org/files/logos/zoinzberg/SauceNAO_2.png', `https://saucenao.com/search.php?db=999&url=${args[0]}`)
                                .setDescription(`相似度: **${response.json.results[0].header.similarity}%**\n標題: ${response.json.results[0].data.title}\n作者: ${response.json.results[0].data.member_name} (${response.json.results[0].data.member_id})`)
                                .setThumbnail(response.json.results[0].header.thumbnail)
                                .setTimestamp()
                                .setFooter(`餘額: ${response.json.header.long_remaining} / 200`)
                            message.channel.send(saucefound);
                        } else {
                            const saucefound = new Discord.MessageEmbed()
                                .setColor(message.member.displayHexColor)
                                .setTitle(response.json.results[0].data.title || response.json.results[0].data.source)
                                .setAuthor(`SauceNAO (${response.json.results[0].header.index_name.match(/(pixiv|gelbooru|Yande\.re|danbooru|twitter|deviantArt)/gi)[0]})`, 'https://www.userlogos.org/files/logos/zoinzberg/SauceNAO_2.png', `https://saucenao.com/search.php?db=999&url=${args[0]}`)
                                .setDescription(`相似度: **${response.json.results[0].header.similarity}%**\n標題: ${response.json.results[0].data.title || response.json.results[0].data.jp_name}\n作者: ${response.json.results[0].data.member_name || response.json.results[0].data.creator.join(', ')} ${('member_id' in response.json.results[0].data) ? "(" + response.json.results[0].data.member_id + ")" : ""})`)
                                .setThumbnail(response.json.results[0].header.thumbnail)
                                .setTimestamp()
                                .setFooter(`餘額: ${response.json.header.long_remaining} / 200`)
                            message.channel.send(saucefound);
                            return;
                        }
                    }
                }, (error) => {
                    console.error('Request encountered an error')
                    console.dir(error.request)
                    const sauceerror = new Discord.MessageEmbed()
                        .setColor('red')
                        .setAuthor('SauceNAO', 'https://www.userlogos.org/files/logos/zoinzberg/SauceNAO_2.png', `https://saucenao.com/search.php?db=999&url=${url}`)
                        .setTitle(":x: 錯誤")
                        .setDescription("請求時發生錯誤")
                        .setTimestamp()
                    message.channel.send(sauceerror);
                })
            } else {
                message.channel.messages.fetch(args[0])
                    .then(messages => {
                        const lastMessage = messages;
                        lastMessage.attachments.forEach(attachment => {
                            // do something with the attachment
                            const url = attachment.url;
                            mySauce(url).then((response) => {
                                console.log('Request successful')
                                console.dir(response.json)
                                console.log(response.json.results[0])
                                if (response.json.results[0].header.index_name.match(/(nhentai)/gi) && lastMessage.channel.nsfw === false) {
                                    const saucenotfound = new Discord.MessageEmbed()
                                        .setColor(message.member.displayHexColor)
                                        .setAuthor('SauceNAO', 'https://www.userlogos.org/files/logos/zoinzberg/SauceNAO_2.png', `https://saucenao.com/search.php?db=999&url=${url}`)
                                        .setTitle('Sauce not found')
                                        .setDescription("很遺憾地我無法顯示結果，這可能是因為這個頻道未標記為nsfw或無搜尋結果")
                                        .setTimestamp()
                                        .setFooter(`餘額: ${response.json.header.long_remaining} / 200`)
                                    message.channel.send(saucenotfound);
                                    return;
                                } else {
                                    if ('ext_urls' in response.json.results[0].data) {
                                        const saucefound = new Discord.MessageEmbed()
                                            .setColor(message.member.displayHexColor)
                                            .setTitle(response.json.results[0].data.title)
                                            .setURL(response.json.results[0].data.source || response.json.results[0].data.ext_urls[0])
                                            .setAuthor(`SauceNAO (${('source' in response.json.results[0].data) ? response.json.results[0].data.source.match(/(twitter)/gi)[0] : response.json.results[0].header.index_name.match(/(pixiv|gelbooru|Yande\.re|danbooru|twitter|deviantArt)/gi)[0]})`, 'https://www.userlogos.org/files/logos/zoinzberg/SauceNAO_2.png', `https://saucenao.com/search.php?db=999&url=${url}`)
                                            .setDescription(`相似度: **${response.json.results[0].header.similarity}%**\n標題: ${response.json.results[0].data.title}\n作者: ${response.json.results[0].data.member_name} (${response.json.results[0].data.member_id})`)
                                            .setThumbnail(response.json.results[0].header.thumbnail)
                                            .setTimestamp()
                                            .setFooter(`餘額: ${response.json.header.long_remaining} / 200`)
                                        message.channel.send(saucefound);
                                    } else {
                                        const saucefound = new Discord.MessageEmbed()
                                            .setColor(message.member.displayHexColor)
                                            .setTitle(response.json.results[0].data.title || response.json.results[0].data.source)
                                            .setAuthor(`SauceNAO (${response.json.results[0].header.index_name.match(/(pixiv|gelbooru|Yande\.re|danbooru|twitter|deviantArt)/gi)[0]})`, 'https://www.userlogos.org/files/logos/zoinzberg/SauceNAO_2.png', `https://saucenao.com/search.php?db=999&url=${url}`)
                                            .setDescription(`相似度: **${response.json.results[0].header.similarity}%**\n標題: ${response.json.results[0].data.title || response.json.results[0].data.jp_name}\n作者: ${response.json.results[0].data.member_name || response.json.results[0].data.creator.join(', ')} ${('member_id' in response.json.results[0].data) ? "(" + response.json.results[0].data.member_id + ")" : ""})`)
                                            .setThumbnail(response.json.results[0].header.thumbnail)
                                            .setTimestamp()
                                            .setFooter(`餘額: ${response.json.header.long_remaining} / 200`)
                                        message.channel.send(saucefound);
                                        return;
                                    }
                                }
                            }, (error) => {
                                console.error('Request encountered an error')
                                console.dir(error.request)
                                const sauceerror = new Discord.MessageEmbed()
                                    .setColor('red')
                                    .setAuthor('SauceNAO', 'https://www.userlogos.org/files/logos/zoinzberg/SauceNAO_2.png', `https://saucenao.com/search.php?db=999&url=${url}`)
                                    .setTitle(":x: 錯誤")
                                    .setDescription("請求時發生錯誤")
                                    .setTimestamp()
                                message.channel.send(sauceerror);
                            })
                        });
                    });
            }
        } else {
            message.channel.messages.fetch().then((messages) => {
                const lastMessage = messages.sort((a, b) => b.createdTimestamp - a.createdTimestamp).filter((m) => m.attachments.size > 0).first();
                lastMessage.attachments.forEach(attachment => {
                    // do something with the attachment
                    const url = attachment.url;
                    mySauce(url).then((response) => {
                        console.log('Request successful')
                        console.dir(response.json)
                        console.log(response.json.results[0])
                        if (response.json.results[0].header.index_name.match(/(nhentai)/gi) && lastMessage.channel.nsfw === false) {
                            const saucenotfound = new Discord.MessageEmbed()
                                .setColor(message.member.displayHexColor)
                                .setAuthor('SauceNAO', 'https://www.userlogos.org/files/logos/zoinzberg/SauceNAO_2.png', `https://saucenao.com/search.php?db=999&url=${url}`)
                                .setTitle('Sauce not found')
                                .setDescription("很遺憾地我無法顯示結果，這可能是因為這個頻道未標記為nsfw或無搜尋結果")
                                .setTimestamp()
                                .setFooter(`餘額: ${response.json.header.long_remaining} / 200`)
                            message.channel.send(saucenotfound);
                            return;
                        } else {
                            const reg_site = /(pixiv|gelbooru|yande\.re|yandere|danbooru|twitter|deviantart)/gi
                            if ('ext_urls' in response.json.results[0].data) {
                                const saucefound = new Discord.MessageEmbed()
                                    .setColor(message.member.displayHexColor)
                                    .setTitle(response.json.results[0].data.title)
                                    .setURL(('source' in response.json.results[0].data) ? (response.json.results[0].data.source.startsWith("http")) ? response.json.results[0].data.source : response.json.results[0].data.ext_urls[0] : response.json.results[0].data.ext_urls[0])
                                //  .setAuthor(`SauceNAO (${('source' in response.json.results[0].data) ? (response.json.results[0].data.source.startsWith("http")) ? response.json.results[0].data.source.match(/(pixiv|gelbooru|yande\.re|danbooru|twitter|deviantart)/gi)[0] : response.json.results[0].data.source : response.json.results[0].header.index_name.match(/(pixiv|gelbooru|Yande\.re|danbooru|twitter|deviantart)/gi)[0]})`, 'https://www.userlogos.org/files/logos/zoinzberg/SauceNAO_2.png', `https://saucenao.com/search.php?db=999&url=${url}`)
                                    .setAuthor(`SauceNAO (${response.json.results[0].header.index_name.match(reg_site)[0]})`, 'https://www.userlogos.org/files/logos/zoinzberg/SauceNAO_2.png', `https://saucenao.com/search.php?db=999&url=${url}`)
                                    .setDescription(`相似度: **${response.json.results[0].header.similarity}%**\n標題: ${response.json.results[0].data.title ? response.json.results[0].data.title : ""}\n作者: ${response.json.results[0].data.member_name || response.json.results[0].data.creator} ${response.json.results[0].data.member_id ? "(" + response.json.results[0].data.member_id + ")" : ""}`)
                                    .setThumbnail(response.json.results[0].header.thumbnail)
                                    .setTimestamp()
                                    .setFooter(`餘額: ${response.json.header.long_remaining} / 200`)
                                message.channel.send(saucefound);
                            } else {
                                const saucefound = new Discord.MessageEmbed()
                                    .setColor(message.member.displayHexColor)
                                    .setTitle(response.json.results[0].data.title || response.json.results[0].data.source)
                                    .setAuthor(`SauceNAO (${response.json.results[0].header.index_name.match(reg_site)[0]})`, 'https://www.userlogos.org/files/logos/zoinzberg/SauceNAO_2.png', `https://saucenao.com/search.php?db=999&url=${url}`)
                                    .setDescription(`相似度: **${response.json.results[0].header.similarity}%**\n標題: ${response.json.results[0].data.title || response.json.results[0].data.jp_name}\n作者: ${response.json.results[0].data.member_name || response.json.results[0].data.creator.join(', ')} ${('member_id' in response.json.results[0].data) ? "(" + response.json.results[0].data.member_id + ")" : ""})`)
                                    .setThumbnail(response.json.results[0].header.thumbnail)
                                    .setTimestamp()
                                    .setFooter(`餘額: ${response.json.header.long_remaining} / 200`)
                                message.channel.send(saucefound);
                                return;
                            }
                        }
                    }, (error) => {
                        console.error('Request encountered an error')
                        console.dir(error.request)
                        const sauceerror = new Discord.MessageEmbed()
                            .setColor('red')
                            .setAuthor('SauceNAO', 'https://www.userlogos.org/files/logos/zoinzberg/SauceNAO_2.png', `https://saucenao.com/search.php?db=999&url=${url}`)
                            .setTitle(":x: 錯誤")
                            .setDescription("請求時發生錯誤")
                            .setTimestamp()
                        message.channel.send(sauceerror);
                    })
                });
            });
        }
    } catch (e) {
        await message.reply(`發生了預料外的錯誤 \`${e.toString()}\``)
        return console.error(e)
    }
};
saucenao.prop = {
    name: "saucenao",
    desc: "用 SauceNAO 查尋圖源",
    args: [
        {
            name: "圖片",
            type: "訊息ID|訊息連結|圖片連結|檔案<圖片>",
            desc: "要搜尋的圖片",
            option: true
        }
    ],
    exam: [''],
    guild: true
};
module.exports = saucenao;