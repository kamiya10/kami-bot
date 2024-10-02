import { KamiCommand } from '@/class/command';
import { rtsChannel } from '@/database/schema';
import {
  ChannelType,
  Colors,
  EmbedBuilder,
  InteractionContextType,
  SlashCommandBooleanOption,
  SlashCommandBuilder,
  SlashCommandChannelOption,
} from 'discord.js';
import { eq } from 'drizzle-orm';
import { t as $t } from 'i18next';

/**
 * The /rts command.
 */
export default new KamiCommand({
  builder: new SlashCommandBuilder()
    .setName('rts')
    .setDescription('地動即時資訊推播設定')
    .setContexts(InteractionContextType.Guild)
    .addChannelOption(new SlashCommandChannelOption()
      .setName('channel')
      .setDescription('The channel rts alert message should be sent to.')
      .addChannelTypes(ChannelType.GuildText))
    .addBooleanOption(new SlashCommandBooleanOption()
      .setName('auto_delete')
      .setDescription('Whether should message be auto deleted when the alert expires.')),
  defer: true,
  ephemeral: true,
  async execute(interaction) {
    if (!interaction.inCachedGuild()) return;

    const channel = interaction.options.getChannel<ChannelType.GuildText>('channel');
    const autoDelete = interaction.options.getBoolean('auto_delete');

    let content = '';

    if (channel) {
      const setting = await this.database.query.rtsChannel.findFirst({ where: eq(rtsChannel.channelId, channel.id) });

      if (setting) {
        this.databa;
      }

      this.database.update(rtsChannel).set({
        channelId: channel.id,
      }).where();

      (interaction.guild.id).earthquake.rts.channelId = channel.id;
      content += `已將推播頻道設為 **${channel.toString()}**`;
      if (autoDelete == undefined) {
        content += `。`;
      }
    }
    else {
      this.database.guild(interaction.guild.id).earthquake.rts.channelId = null;
      content += `已**清除**推播頻道`;
      if (autoDelete == undefined) {
        content += `。`;
      }
    }

    if (autoDelete != undefined) {
      this.database.guild(interaction.guild.id).earthquake.rts.autoDelete = autoDelete;

      if (autoDelete) {
        if (channel) {
          content += `，並在警報結束後自動刪除訊息。`;
        }
        else {
          content += `已設定在警報結束後自動刪除訊息。`;
        }
      }
      else {
        if (channel) {
          content += `，且警報結束後將不再自動刪除訊息。`;
        }
        else {
          content += `警報結束後將不再自動刪除訊息。`;
        }
      }
    }

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: $t('header:rts', {
              lng: interaction.locale,
              0: interaction.guild.name,
            }),
            iconURL: interaction.guild.iconURL() ?? '',
          })
          .setColor(Colors.Green)
          .setDescription(content),
      ],
    });
  },
});
