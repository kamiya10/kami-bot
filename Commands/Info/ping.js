const { stripIndents } = require("common-tags");
const { Colors, EmbedBuilder, SlashCommandBuilder } = require("discord.js");

const ReplyMessages = [
  "🏓碰！",
  "🏓嘿嘿，小球在這裡！",
  "🏓碰！嘿嘿，我打到了！",
  "🏓碰！耶！我又贏了一次",
  "🏓碰！嘻嘻，我又接住了！",
  "🏓耶！又有人來找我玩啦！",
  "🏓碰！嘿嘿，我表現如何？",
  "🏓碰！看我的殺球！",
  "🏓碰！好開心～",
  "🏓碰！嘿嘿，我又贏了一次！",
  "喵喵！🐱 剛剛閃得很漂亮對吧？再來一次，看我怎麼閃！",
  "嗚～🐱 剛剛差點就抓到了，不過沒關係，我會更努力的，喵！",
  "🐱喵～輪到我出場了！",
  "🐾喵喵！嘿咻～",
  "🐾嗚～別打擾我打盹啦～",
];

const time = (date) =>
  [
    [
      `${date.getFullYear()}`,
      `${date.getMonth() + 1}`.padStart(2, "0"),
      `${date.getDate()}`.padStart(2, "0"),
    ].join("/"),
    " ",
    [
      `${date.getHours()}`.padStart(2, "0"),
      `${date.getMinutes()}`.padStart(2, "0"),
      `${date.getSeconds()}`.padStart(2, "0"),
    ].join(":"),
    ".",
    `${date.getMilliseconds()}`.padStart(3, "0"),
  ].join("");

module.exports = {
  data: new SlashCommandBuilder().setName("ping").setDescription("Ping"),
  defer: true,
  ephemeral: false,
  global: true,

  /**
   *
   * @param {import("discord.js").ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const receviedTimestamp = Date.now();
    const content =
      ReplyMessages[Math.floor(Math.random() * ReplyMessages.length)];
    await interaction.editReply({ content });
    const roundTripTimestamp = Date.now();
    const latency = roundTripTimestamp - receviedTimestamp;
    const embed = new EmbedBuilder()
      .setColor(
        latency <= 500
          ? Colors.Green
          : latency <= 1500
            ? Colors.Yellow
            : Colors.Red,
      )
      .setAuthor({
        name: "機器人延遲",
        iconURL: interaction.client.user.avatarURL(),
      })
      .addFields({
        name: "時間",
        value: stripIndents`
          💬 訊息時間 **${time(new Date(interaction.createdTimestamp))}**
          ⏱ 主機時間 **${time(new Date(Date.now()))}**
        `,
      })
      .addFields({
        name: "延遲",
        value: stripIndents`
          ⌛ 延遲 **${roundTripTimestamp - receviedTimestamp}ms**
          🌐 WebSocket 延遲 **${interaction.client.ws.ping}ms**
        `,
      });
    await interaction.editReply({ content, embeds: [embed] });
  },
};
