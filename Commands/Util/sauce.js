const {
  Colors,
  EmbedBuilder,
  SlashCommandAttachmentOption,
  SlashCommandBuilder,
} = require("discord.js");
const sagiri = require("sagiri")(process.env.SAUCENAO_KEY);
const tinycolor = require("tinycolor2");

const white = tinycolor("white");
const red = tinycolor("red");
const green = tinycolor("green");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("sauce")
    .setDescription("快給我那個醬汁")
    .addAttachmentOption(
      new SlashCommandAttachmentOption()
        .setName("圖片")
        .setDescription("要搜尋的圖片")
        .setRequired(true),
    ),
  defer: true,
  ephemeral: false,
  global: true,

  /**
   * @param {import("discord.js").ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const image = interaction.options.getAttachment("圖片", true);

    if (!image.contentType?.startsWith("image")) {
      return await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.Red)
            .setTitle("❌ 錯誤")
            .setDescription("檔案必須是圖片")
            .setFooter({ text: "ERR_FILE_TYPE" }),
        ],
      });
    }

    const results = await sagiri(image.url);

    const embeds = [
      new EmbedBuilder()
        .setColor(Colors.Green)
        .setThumbnail(image.url)
        .setAuthor({
          name: "SauceNAO",
          iconURL: "https://upload.cc/i1/2022/12/25/VYQN15.png",
          url: "https://saucenao.com",
        })
        .setTitle("Sauce found?")
        .setURL(`https://saucenao.com/search.php?db=999&url=${image.url}`),
    ];

    for (const result of results) {
      try {
        let description = "";

        description += result.authorName
          ? result.authorUrl
            ? `作者：[${result.authorName}](${result.authorUrl})`
            : `作者：${result.authorName}`
          : "";

        if (description.length) {
          description += "\n";
        }

        description +=
          "ext_urls" in result.raw.data
            ? result.raw.data.ext_urls?.length > 1
              ? `連結：\n${result.raw.data.ext_urls.map((v) => ` - ${v}`).join("\n")}`
              : `連結：${result.raw.data.ext_urls[0]}`
            : "";

        const embed = new EmbedBuilder()
          // eslint-disable-next-line array-bracket-newline, array-element-newline
          .setColor(
            tinycolor
              .mix(
                tinycolor.mix(white, green, result.similarity),
                red,
                100 - result.similarity,
              )
              .toHex(),
          )
          .setThumbnail(result.thumbnail)
          .setAuthor({
            name: `${result.index}: ${result.site} (${result.similarity}%)`,
          })
          .setTitle(result.raw?.header.index_name ?? "untitled")
          .setDescription(description)
          .setURL(result.url);

        if (description.length) {
          embed.setDescription(description);
        }

        embeds.push(embed);
      } catch (error) {
        embeds.push(
          new EmbedBuilder()
            .setColor(Colors.Red)
            .setDescription(`剖析結果時發生錯誤：${error}`),
        );
      }
    }

    await interaction.editReply({ embeds });
  },
};
