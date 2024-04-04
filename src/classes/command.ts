import type { AutocompleteInteraction, Awaitable, CacheType, ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder, SlashCommandSubcommandBuilder, SlashCommandSubcommandGroupBuilder, SlashCommandSubcommandsOnlyBuilder } from "discord.js";
import type { KamiClient } from "./client";

interface KamiCommandOptions {
  defer?: boolean;
  global?: boolean;
  dev?: boolean;
  filePath: string;
  builder: SlashCommandBuilder | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup"> | SlashCommandSubcommandBuilder | SlashCommandSubcommandsOnlyBuilder | SlashCommandSubcommandGroupBuilder | SlashCommandOptionsOnlyBuilder;
  execute: (interaction: ChatInputCommandInteraction<CacheType>) => Awaitable<void>;
  autocomplete?: (interaction: AutocompleteInteraction<CacheType>) => Awaitable<void>;
}

export interface CommandBuilder {
  build: (client: KamiClient) => KamiCommand;
}

export class KamiCommand implements KamiCommandOptions {
  defer: boolean;
  global: boolean;
  dev: boolean;
  filePath: string;
  builder: SlashCommandBuilder | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup"> | SlashCommandSubcommandBuilder | SlashCommandSubcommandsOnlyBuilder | SlashCommandSubcommandGroupBuilder | SlashCommandOptionsOnlyBuilder;
  execute: (interaction: ChatInputCommandInteraction<CacheType>) => Awaitable<void>;
  autocomplete?: ((interaction: AutocompleteInteraction<CacheType>) => Awaitable<void>) | undefined;

  constructor(options: KamiCommandOptions) {
    this.defer = options.defer ?? true;
    this.global = options.global ?? false;
    this.dev = options.dev ?? false;
    this.filePath = options.filePath;
    this.builder = options.builder;
    this.execute = options.execute;
    this.autocomplete = options.autocomplete;
  }
}