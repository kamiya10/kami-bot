/* eslint-disable no-inline-comments */
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, Collection, Colors, ComponentType, EmbedBuilder, Message, TextChannel, TimestampStyles, time } = require("discord.js");
const chalk = require("chalk");
const logger = require("../Core/logger");

const intensesTW = [
  "\\⚫０級",
  "\\⚪１級",
  "\\🔵２級",
  "\\🟢３級",
  "\\🟡４級",
  "\\🟠５弱",
  "\\🟤５強",
  "\\🔴６弱",
  "\\🟣６強",
  "\\🛑７級",
];

const embed_cache = {};

module.exports = {
  name  : "rts",
  event : "rts",
  once  : false,

  /**
   *
   * @param {import("discord.js").Client} client
   * @param {data} data
   */
  execute(client, data) {
    if (!client.data.rts_list.has(data.id))
      client.data.rts_list.set(data.id, new Collection());

    const GuildSetting = client.database.GuildDatabase.getAll(["rts_channel", "rts_metion", "rts_alert"]);
    const rts_channels = Object.keys(GuildSetting).filter(v => GuildSetting[v].rts_channel != null).map(v => [GuildSetting[v].rts_channel, GuildSetting[v].rts_metion, GuildSetting[v].rts_alert]);

    const embed = new EmbedBuilder()
      .setAuthor({ name: "地震檢知" })
      .setFooter({ text: "此為實驗性功能，即時資料由 ExpTech 探索科技提供。", iconURL: "https://upload.cc/i1/2023/01/16/mtKV7B.png" });

    embed
      .setColor(data.cancel ? Colors.LightGrey : data.alert ? Colors.Red : Colors.Orange)
      .setDescription(`${data.final ? "\\⚫已停止追蹤" : "\\📡 追蹤中"}`)
      .addFields({
        name  : "發布狀態",
        value : `${data.cancel ? "**已取消**" : data.final ? "**最終報**" : `第 **${data.number}** 報`} （接收於 ${time(~~(data.timestamp / 1000), TimestampStyles.ShortDateTime)}）`,
      });

    if (Object.keys(data.list).length)
      if (Object.keys(data.list).length > 10) {
        const uuids = Object.keys(data.list);

        /**
         * @type {Record<string, number>}
         */
        const int = {};

        for (let i = 0; i < uuids.length; i++)
          if (data.list[uuids[i]] > (int[client.data.rts_stations.get(uuids[i]).area] ?? -1))
            int[client.data.rts_stations.get(uuids[i]).area] = data.list[uuids[i]];

        embed.addFields({
          name  : "各地最大測得震度",
          value : Object.keys(int)
            .map(area => ({ name: area, intensity: int[area] }))
            .sort((a, b) => b.intensity - a.intensity)
            .map(area => `${area.name} ${intensesTW[area.intensity]}`)
            .join("\n"),
        });
      } else {
        embed.addFields({
          name  : "各地最大測得震度",
          value : Object.keys(data.list)
            .map(uuid => ({ name: client.data.rts_stations.get(uuid).Loc, intensity: data.list[uuid] }))
            .sort((a, b) => b.intensity - a.intensity)
            .map(area => `${area.name} ${intensesTW[area.intensity] ?? "\\◾誤報"}`)
            .join("\n"),
        });
      }

    logger.debug(`${chalk.magenta("[rts]")} ${data.alert ? chalk.redBright(data.id) : data.id} ${(data.cancel ? chalk.gray : chalk.yellow)(`#${data.number}`)}${chalk.gray(data.final ? "（最終報）" : "")}`);

    if (!embed_cache[data.id]) {
      const button = new ButtonBuilder()
        .setCustomId("felt")
        .setEmoji("😣")
        .setLabel("我有感覺")
        .setStyle(data.alert ? ButtonStyle.Primary : ButtonStyle.Secondary);

      const timer = () => {
        if (embed_cache[data.id].update) {
          if (embed_cache[data.id].alert)
            button.setStyle(ButtonStyle.Primary);

          for (const setting of rts_channels) {
            if (rts_channels[2] == true && embed_cache[data.id].alert != true) continue;

            const message = client.data.rts_list.get(data.id).get(setting[0]);

            if (message) {
              if (message instanceof Message)
                message.edit({ embeds: [embed_cache[data.id].embed], components: [new ActionRowBuilder({ components: [button] })] }).catch(console.error);
              else
                message.then(m => m.edit({ embeds: [embed_cache[data.id].embed], components: [new ActionRowBuilder({ components: [button] })] }).catch(console.error));
            } else {
              const channel = client.channels.cache.get(setting[0]);

              if (channel instanceof TextChannel) {
                const sent = channel.send({ content: `⚠ 地震檢知 ${setting[1] ? channel.guild.roles.cache.get(setting[1]) : ""}`, embeds: [embed_cache[data.id].embed], components: embed_cache.end ? [] : [new ActionRowBuilder({ components: [button] })], ...(setting[1] ? { allowedMentions: { roles: [setting[1]] }, parse: ["roles"] } : {}) }).catch(console.error);
                client.data.rts_list.get(data.id).set(setting[0], sent);
                sent.then(v => {
                  if (!(v instanceof Message)) return;
                  client.data.rts_list.get(data.id).set(setting[0], v);
                  const collector = v.createMessageComponentCollector({ componentType: ComponentType.Button, idle: 300_000 });
                  collector.on("collect", async i => {
                    const replyEmbed = new EmbedBuilder();

                    if (embed_cache[data.id].felt.find(value => value.id == i.user.id) == undefined) {
                      embed_cache[data.id].felt.push({ id: i.user.id, timestamp: i.createdTimestamp });
                      replyEmbed
                        .setColor(Colors.Green)
                        .setDescription("感謝你的回報！");
                    } else {
                      replyEmbed
                        .setColor(Colors.Red)
                        .setDescription("你已經回報過了，一個人對同一檢知只能回報一次。");
                    }

                    await i.reply({ embeds: [replyEmbed], ephemeral: true });
                  });
                });
              }
            }
          }

          embed_cache[data.id].update = false;
        }

        if (embed_cache[data.id].end) {
          const max = Object.keys(embed_cache[data.id].maxints)
            .map(uuid => ({ name: client.data.rts_stations.get(uuid).Loc, intensity: embed_cache[data.id].maxints[uuid] }))
            .sort((a, b) => b.intensity - a.intensity)[0];

          const endEmbed = new EmbedBuilder()
            .setColor(data.alert ? Colors.Red : Colors.Orange)
            .setAuthor({ name: "地震檢知" })
            .addFields(...[
              {
                name   : "🕐 起始時間",
                value  : time(~~(data.time / 1000), TimestampStyles.ShortDateTime),
                inline : true,
              },
              {
                name   : "⏹️ 結束時間",
                value  : time(~~(embed_cache[data.id].lastTimestamp / 1000), TimestampStyles.ShortDateTime),
                inline : true,
              },
              {
                name   : "📊 計測最大震度",
                value  : `${max.name} ${intensesTW[max.intensity]}`,
                inline : true,
              },
              {
                name  : "😣 體感回報",
                value : `這次${embed_cache[data.id].alert ? "警報" : "檢知"}${embed_cache[data.id].felt.length == 0 ? "沒有人" : `${embed_cache[data.id].felt.length < 2 ? "只" : "共"}有 **${embed_cache[data.id].felt.length}** 人`}回報`,
              }])
            .setFooter({ text: "此為實驗性功能，即時資料由 ExpTech 探索科技提供。", iconURL: "https://upload.cc/i1/2023/01/16/mtKV7B.png" });

          const urlButton = new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setLabel("檢知報告")
            .setURL(`https://exptech.com.tw/report?id=${data.report_id}`);

          for (const setting of rts_channels) {
            const message = client.data.rts_list.get(data.id).get(setting[0]);

            if (message instanceof Message)
              if (!embed_cache[data.id].cancelled) {
                message.edit({ embeds: [embed_cache[data.id].embed], components: [] }).catch(console.error);

                if (embed_cache[data.id].felt.length) {
                  embed_cache[data.id].felt = embed_cache[data.id].felt.sort((a, b) => a.timestamp - b.timestamp);

                  const ranking = [];
                  for (const index in embed_cache[data.id].felt)
                    if (message.guild.members.cache.has(embed_cache[data.id].felt[index].id))
                      ranking.push(`${["🥇", "🥈", "🥉"][index] ?? `\`${+index + 1}.\``} ${message.guild.members.cache.get(embed_cache[data.id].felt[index].id)} ${index > 0 ? `+${parseFloat(((embed_cache[data.id].felt[index].timestamp - embed_cache[data.id].felt[index - 1].timestamp) / 1000).toFixed(2))}s` : ""}`);

                  if (ranking.length) {
                    const sendEmbed = new EmbedBuilder(endEmbed.data);

                    sendEmbed.addFields({
                      name  : "🏆 回報排行榜",
                      value : `${ranking.length > 10 ? "*（僅展示前十位）*" : ""}\n${(ranking.length > 10 ? ranking.slice(0, 10) : ranking).join("\n")}`,
                    });

                    message.reply({ embeds: [sendEmbed], components: embed_cache[data.id].alert ? [new ActionRowBuilder({ components: [urlButton] })] : [], allowedMentions: { parse: [], roles: [], users: [], repliedUser: false } }).catch(() => void 0);
                  } else {
                    message.reply({ embeds: [endEmbed], components: embed_cache[data.id].alert ? [new ActionRowBuilder({ components: [urlButton] })] : [], allowedMentions: { parse: [], roles: [], users: [], repliedUser: false } }).catch(() => void 0);
                  }
                }
              }
          }

          clearInterval(embed_cache[data.id].timer);
          setTimeout(() => {
            for (const setting of rts_channels) {
              const message = client.data.rts_list.get(data.id).get(setting[0]);

              if (message instanceof Message)
                if (embed_cache[data.id].cancelled)
                  message.delete();
            }

            delete embed_cache[data.id];
          }, 15_000).unref();
        }
      };

      embed_cache[data.id] = {
        embed,
        update        : true,
        cancelled     : false,
        end           : false,
        alert         : data.alert,
        lastTimestamp : data.timestamp,
        felt          : [],
        maxints       : data.list,
        timer         : setInterval(timer, 1500),
      };
      timer();
    } else {
      embed_cache[data.id].embed = embed;
      embed_cache[data.id].update = true;
      embed_cache[data.id].lastTimestamp = data.timestamp;

      if (Object.keys(data.list).length)
        for (const uuid in data.list)
          if ((embed_cache[data.id].maxints[uuid] ?? -1) > data.list[uuid])
            embed_cache[data.id].maxints[uuid] = data.list[uuid];

      if (data.cancel) embed_cache[data.id].cancelled = true;

      if (data.alert)
        embed_cache[data.id].alert = true;

      if (data.cancel || data.final) embed_cache[data.id].end = true;
    }
  },
};

/**
* @typedef {object} data
* @property {string} type
* @property {number} format
* @property {number} time 第一站觸發時間
* @property {number} timestamp 發送時間
* @property {number} number 報數
* @property {number} data_count 資料數
* @property {number} id 檢知編號
* @property {number} report_id 檢知報告 id
* @property {Record<string, number} list 測站震度
* @property {number} total_station 測站總數
* @property {boolean} alert 警報
* @property {boolean} cancel 取消
* @property {boolean} final 最終報
*/
