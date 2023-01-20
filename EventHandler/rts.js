/* eslint-disable no-inline-comments */
const { Collection, Colors, EmbedBuilder, Message } = require("discord.js");
const logger = require("../Core/logger");

const test_channels
= [
  "926547824362016771", // exptech
  "949333369869701230", // 火柴
  "927820595712909353", // 黑科技喵喵
];

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

    const embed = new EmbedBuilder()
      .setAuthor({ name: "地震檢知" })
      .setFooter({ text: "此為實驗性功能，即時資料由 ExpTech 探索科技提供。", iconURL: "https://upload.cc/i1/2023/01/16/mtKV7B.png" });

    embed
      .setColor(data.cancel ? Colors.LightGrey : data.alert ? Colors.Red : Colors.Orange)
      .setDescription(`${data.final ? "\\⚫已停止追蹤" : "\\📡 追蹤中"}`)
      .addFields({
        name  : "發布狀態",
        value : `${data.cancel ? "**已取消**" : data.final ? "**最終報**" : `第 **${data.number}** 報`} （接收於 <t:${~~(data.timestamp / 1000)}:f>）`,
      });

    if (data.cancel) embed_cache[data.id].cancelled = true;

    if (Object.keys(data.list).length)
      if (Object.keys(data.list).length > 10) {
        const ids = Object.keys(data.list);
        const int = {};

        for (let i = 0; i < ids.length; i++)
          if (data.list[ids[i]] > int[client.data.rts_stations.get(ids[i]).area])
            int[client.data.rts_stations.get(ids[i]).area] = data.list[ids[i]];

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
            .map(id => ({ name: client.data.rts_stations.get(id).Loc, intensity: data.list[id] }))
            .sort((a, b) => b.intensity - a.intensity)
            .map(area => `${area.name} ${intensesTW[area.intensity] ?? "\\◾誤報"}`)
            .join("\n"),
        });
      }

    if (!embed_cache[data.id]) {
      const timer = () => {
        if (embed_cache[data.id].update) {
          for (const channelID of test_channels) {
            const message = client.data.rts_list.get(data.id).get(channelID);

            if (message) {
              if (message instanceof Message)
                message.edit({ embeds: [embed_cache[data.id].embed] }).catch(console.error);
              else
                message.then(m => m.edit({ embeds: [embed_cache[data.id].embed] }).catch(console.error));
            } else {
              const channel = client.channels.cache.get(channelID);

              const sent = channel.send({ embeds: [embed_cache[data.id].embed] }).catch(console.error);
              client.data.rts_list.get(data.id).set(channelID, sent);
              sent.then(v => client.data.rts_list.get(data.id).set(channelID, v));
            }
          }

          embed_cache[data.id].update = false;
          logger.debug("rts updated");
        }

        if (embed_cache[data.id].end) {
          clearInterval(embed_cache[data.id].timer);
          setTimeout(() => {
            for (const channelID of test_channels) {
              const message = client.data.rts_list.get(data.id).get(channelID);

              if (message) message.delete();
            }

            if (embed_cache[data.id].cancelled)
              client.data.rts_list.delete(data.id);

            delete embed_cache[data.id];
          }, 15000).unref();
        }
      };

      embed_cache[data.id] = {
        embed,
        update    : true,
        cancelled : false,
        end       : false,
        timer     : setInterval(timer, 1500),
      };
      timer();
    } else {
      embed_cache[data.id].embed = embed;
      embed_cache[data.id].update = true;

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
