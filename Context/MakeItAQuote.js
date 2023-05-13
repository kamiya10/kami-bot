const { ApplicationCommandType, Colors, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const { ContextMenuCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName("Make It A Quote")
    .setNameLocalization("zh-TW", "讓他變名言")
    .setType(ApplicationCommandType.Message)
    .setDMPermission(false),
  defer     : true,
  ephemeral : true,

  /**
   * @param {import("discord.js").MessageContextMenuCommandInteraction} interaction
   */
  async execute(interaction) {
    const embed = new EmbedBuilder();

    if ((interaction.client.database.UserDatabase.get(interaction.targetMessage.author.id)?.allow_quote ?? true) != true) {
      embed
        .setColor(Colors.Red)
        .setDescription("❌ 這個訊息的作者不允許任何人把它變成名言");
      await interaction.editReply({ embeds: [embed] });
      return;
    }

    const content = interaction.targetMessage.content;

    if (interaction.targetMessage.member == null)
      await interaction.guild.members.fetch({ force: true });

    if (!content.length) {
      embed
        .setColor(Colors.Red)
        .setDescription("沒有可以變成名言的東西");

      await interaction.editReply({ embeds: [embed] });
      return;
    }

    const quote = "***❝  " + content.split("\n").join("***\n***　") + " ❞***" + `\n　　　　　　　　—— ${interaction.targetMessage.member?.displayName ?? interaction.targetMessage.author.username} (${new Date(Date.now()).getFullYear()})`;
    embed
      .setColor(interaction.targetMessage.member.displayHexColor)
      .setDescription(quote)
      .setFields({ name: "樣式碼", value: "```md\n" + quote + "\n```" });
    await interaction.editReply({ embeds: [embed] });
  },
};