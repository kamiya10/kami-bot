import { AutocompleteInteraction, CacheType, ChatInputCommandInteraction } from "discord.js";
import { Awaitable } from "@discordjs/util";
import { SlashCommandBuilder, SlashCommandOptionsOnlyBuilder, SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder, SlashCommandSubcommandsOnlyBuilder } from "@discordjs/builders/dist";

interface KamiCommandConstructor {
  defer?: boolean;
  global?: boolean;
  dev?: boolean;
  filePath: string;
  builder: SlashCommandBuilder | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup"> | SlashCommandSubcommandBuilder | SlashCommandSubcommandsOnlyBuilder | SlashCommandSubcommandGroupBuilder | SlashCommandOptionsOnlyBuilder;
  execute: (interaction: ChatInputCommandInteraction<CacheType>) => Awaitable<void>;
  autocomplete?: (interaction: AutocompleteInteraction<CacheType>) => Awaitable<void>;
}

export class KamiCommand {
  constructor(options: KamiCommandConstructor);
  
  public defer: boolean;
  public global: boolean;
  public dev: boolean;
  public filePath: string;
  public builder: SlashCommandBuilder;

  public execute(interaction: ChatInputCommandInteraction<CacheType>): Awaitable<void>;
  public autocomplete?(interaction: AutocompleteInteraction<CacheType>): Awaitable<void>;
}