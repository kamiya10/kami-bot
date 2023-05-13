const { SlashCommandBooleanOption, SlashCommandBuilder, SlashCommandSubcommandBuilder } = require("discord.js");
const UserDatabaseModel = require("../../Model/UserDatabaseModel");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("function")
    .setNameLocalization("zh-TW", "功能")
    .setDescription("Disable or enable some functionality of the bot for you.")
    .setDescriptionLocalization("zh-TW", "啟用或停用機器人的功能。")
    .addSubcommand(new SlashCommandSubcommandBuilder()
      .setName("messagemention")
      .setNameLocalization("zh-TW", "提及訊息")
      .setDescription("Send the original message aside when you mentioned it by URL.")
      .setDescriptionLocalization("zh-TW", "傳送原始訊息到你的訊息下方。")
      .addBooleanOption(new SlashCommandBooleanOption()
        .setName("enabled")
        .setNameLocalization("zh-TW", "啟用")
        .setDescription("If true, the bot will try to fetch the original message and reply aside of your URL.")
        .setDescriptionLocalization("zh-TW", "如果為 true ，機器人將會偵測你的訊息是否含有訊息連結，並嘗試傳送原始訊息到你的訊息下方。")
        .setRequired(true)))
    .addSubcommand(new SlashCommandSubcommandBuilder()
      .setName("quote")
      .setNameLocalization("zh-TW", "允許名言")
      .setDescription("Allows people transform your message into quotes.")
      .setDescriptionLocalization("zh-TW", "允許其他人把你的訊息變成名言。")
      .addBooleanOption(new SlashCommandBooleanOption()
        .setName("allow")
        .setNameLocalization("zh-TW", "允許")
        .setDescription("If true, people can transform your messages into quotes.")
        .setDescriptionLocalization("zh-TW", "如果為 true ，其他人可以把你的訊息變成名言。")
        .setRequired(true))),
  defer     : false,
  ephemeral : true,

  /**
   * @param {import("discord.js").ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    const UserSettings = interaction.client.database.UserDatabase.get(interaction.user.id);

    if (!UserSettings)
      interaction.client.database.UserDatabase.set(interaction.user.id, UserDatabaseModel());

    switch (subcommand) {
      case "messagemention":{
        const state = interaction.options.getBoolean("enabled");
        UserSettings.allow_quote = state;
        break;
      }

      case "quote":{
        const state = interaction.options.getBoolean("allow");
        UserSettings.allow_quote = state;

        break;
      }

      default:
        break;
    }

    interaction.client.database.UserDatabase.save();
    await interaction.reply({ content: "✅", ephemeral: this.ephemeral });
  },
};