const Discord = require('discord.js');
const functions = require("../../function/loader");
const Sauce = require('node-sauce')
let saucenao = new Sauce("05e07f80d5ad365cb7c6c58568c21345f5c145d3")
saucenao.numres = 5;
const fetchTweetAst = require('static-tweets').fetchTweetAst;
const _ = require('lodash');

let results = [];
/**
 * @type {Discord.Message} - message
 */
let m;
/**
 * @type {number} count
 */
let c;

/**
 * sauce
 * @param {Discord.Message} message 
 * @param {Array} args
 * @returns 
 */
async function sauce(message, args = undefined, client) {
    try {
        functions.log.command(message, client, sauce.prop.name)
        results = [];
        if (args.length) {
            args.forEach(v => {
                if (v.match(/(?<=https:\/\/discord\.com\/channels.*)\d+$/i).length) {
                    message.channel.messages.fetch(v.match(/(?<=https:\/\/discord\.com\/channels.*)\d+$/i)[0])
                        .then(msg => {
                            const lastMessage = msg;
                            lastMessage.attachments.forEach(async attachment => {
                                const url = attachment.url;
                                await get_nao(url)
                            })
                            m = message;
                            c = lastMessage.attachments.size;
                        });
                } else if (v.match(/(https?:\/\/.*\.(?:png|jpe?g))/i)) {
                    return;
                }
            })
        } else {
            message.channel.messages.fetch().then((messages) => {
                const lastMessage = messages.sort((a, b) => b.createdTimestamp - a.createdTimestamp).filter((m) => m.attachments.size > 0).first();
                lastMessage.attachments.forEach(async attachment => {
                    const url = attachment.url;
                    await get_nao(url)
                })
                m = message;
                c = lastMessage.attachments.size;
            })
        }
    } catch (e) {
        await message.reply(`發生了預料外的錯誤 \`${e.toString()}\``)
        return console.error(e)
    }
};
sauce.prop = {
    name: "sauce",
    desc: "*(beta)* 查尋圖源",
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
module.exports = sauce;

async function get_nao(url) {
    await saucenao(url).then(async matches => {
        console.log(matches)
        const obj = await parse_nao(matches, url);
        return pushresult(obj, matches);
    })
}

/**
 * 
 * @param {array} matches 
 * @param {string} url 
 */
async function parse_nao(matches, url) {
    const sites = new Array(999)
    sites[5] = "pixiv";
    sites[9] = "Danbooru";
    sites[12] = "Yande.re";
    sites[25] = "Gelbooru";
    sites[26] = "Konachan";
    sites[34] = "deviantArt";
    sites[38] = "H-Misc";
    sites[41] = "Twitter";
    sites[999] = "ALL";
    if (matches.length) {
        for (i = 0; i < matches.length; i++) {
            const match = matches[i];
            const site_index = match.index_id;
            const site = sites[site_index];
            if (site) {
                const similarity = match.similarity;
                const thumbnail = match.thumbnail;
                const urls = _.flattenDeep(matches.map(a => "source" in a ?a.source ? [a.source, a.ext_urls] :a.ext_urls : a.ext_urls));
                let result = {
                    found: site ? true : false,
                    origin: url,
                    request: `https://saucenao.com/search.php?db=999&url=${url}`,
                    similarity: similarity,
                    thumbnail: thumbnail,
                    site: site,
                    artwork: {
                        name: null,
                        id: null,
                        url: null
                    },
                    author: {
                        name: null,
                        id: null
                    },
                    ext_url: urls
                }
                // pixiv
                if (site_index == 5) {
                    result.title = match.title;

                    result.artwork.name = match.title;
                    result.artwork.id = match.pixiv_id;
                    result.artwork.url = `https://www.pixiv.net/artworks/${match.pixiv_id}`;

                    result.author.name = match.member_name;
                    result.author.id = match.member_id;
                }
                // danbooru
                if (site_index == 9) {
                    result.title = match.index_name.match(/\w*\.(?:png|je?pg)$/i)[0];

                    result.artwork.name = match.index_name.match(/\w*\.(?:png|je?pg)$/i)[0];
                    result.artwork.id = match.danbooru_id;
                    result.artwork.url = `https://danbooru.donmai.us/post/show/${match.danbooru_id}`;

                    result.author.name = match.creator;
                }
                // yandere
                if (site_index == 12) {
                    result.title = match.index_name.match(/\w*\.(?:png|je?pg)$/i)[0];

                    result.artwork.name = match.index_name.match(/\w*\.(?:png|je?pg)$/i)[0];
                    result.artwork.id = match.danbooru_id;
                    result.artwork.url = match.ext_urls[0];

                    result.author.name = match.creator;
                }
                // danbooru
                if (site_index == 26) {
                    result.title = match.index_name.match(/\w*\.(?:png|je?pg)$/i)[0];

                    result.artwork.name = match.index_name.match(/\w*\.(?:png|je?pg)$/i)[0];
                    result.artwork.id = match.konachan_id;
                    result.artwork.url = `https://konachan.com/post/show/${match.konachan_id}`;

                    result.author.name = match.creator;
                }
                // H-Misc
                if (site_index == 38) {
                    result.title = match?.jp_name || match.eng_name;

                    result.artwork.name = match.index_name.match(/\w*\.(?:png|je?pg)$/i)[0];

                    result.author.name = match.creator.join(", ");
                }
                // twitter
                if (site_index == 41) {
                    const tweets = await fetchTweetAst(match.tweet_id);
                    if (tweets.length) {
                        const tweet = tweets[0];
                        let paragraph = [];
                        _.result(_.find(tweet.nodes, ["tag", "p"]), "nodes", "").forEach(v => {
                            if (typeof v == "object") paragraph.push(v.nodes); else
                                paragraph.push(v)
                        })
                        result.title = match.index_name.match(/\w*\.(?:png|je?pg)$/i)[0];

                        result.artwork.name = _.flattenDeep(paragraph).join("");
                        result.artwork.id = match.tweet_id;
                        result.artwork.url = `https://twitter.com/${match.twitter_user_handle}/status/${match.tweet_id}`;

                        result.author.name = `${tweet.data.name} (${match.twitter_user_handle})`;
                        result.author.id = match.twitter_user_id;
                    } else console.log("unable to fetch tweet")
                }
                return result;
            }
        }
    } else {
        return undefined;
    }
}
/**
 * @param {{request: string, similarity: string, thumbnail: string, site: string, ext_url: string|string[], title: string, artwork: {name: string, id?: string, url?: string}, author: {name: string, id?: string}}} obj
 */
function pushresult(obj, matches) {
    console.log(obj)
    if (obj.found)
        results.push({ name: `${obj.site} | ${obj.title}`, value: `相似度: ${obj.similarity}%\n作者: ${obj.author.name}${obj.author.id ? ` (${obj.author.id})` : ""}\n連結: ${obj.ext_url.length == 1 ? `[SauceNAO](${obj.request}) | [${obj.site}](${obj.ext_url[0]})` : `[SauceNAO](${obj.request}) | ${formatURL(matches).join(" | ")}`}` });
    if (results.length == c) {
        const send = new Discord.MessageEmbed()
            .setAuthor("SauceNAO", "")
            .setColor(m.member.displayHexColor)
            .setTitle("搜尋結果")
            .setURL(obj.request)
            .setThumbnail(obj.thumbnail)
            .addFields(results)
            .setTimestamp();
        m.reply(send);
    }
    if (results.length == 0) {
        const send = new Discord.MessageEmbed()
            .setAuthor("SauceNAO", "")
            .setColor(m.member.displayHexColor)
            .setTitle("搜尋結果")
            .setURL(obj.request)
            .setThumbnail(obj.origin)
            .setDescription("無搜尋結果")
            .setTimestamp();
        m.reply(send);
    }
}

function formatURL(matches) {
    let final = [];
    matches.forEach(v => {
        if (parseFloat(v.similarity) >= matches[0].similarity - 10) {
            if ("ext_urls" in v) {
                if ("source" in v) {
                    if (v.source) {
                        const domain = v.source.replace("www.", "").match(/[-a-zA-Z0-9@:%_\+~#=]{1,256}(?=\.)/).length ? v.source.replace("www.", "").match(/[-a-zA-Z0-9@:%_\+~#=]{1,256}(?=\.)/)[0] : undefined;
                        if (domain) final.push(`[${domain}](${v.source})`)
                    }
                    }
                v.ext_urls.forEach(val => {
                    const domain = val.replace("www.", "").match(/[-a-zA-Z0-9@:%_\+~#=]{1,256}(?=\.)/).length ? val.replace("www.", "").match(/[-a-zA-Z0-9@:%_\+~#=]{1,256}(?=\.)/)[0] : undefined;
                    if (domain) final.push(`[${domain}](${val})`)
                })
            }
        };
    })
    console.log(final);
    return final;
}