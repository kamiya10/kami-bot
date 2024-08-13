import type { AutocompleteInteraction, Awaitable, CacheType, ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder, SlashCommandSubcommandsOnlyBuilder } from "discord.js";

import type { KamiClient } from "@/classes/client";

type AnySlashCommandBuilder =
  | SlashCommandBuilder
  | SlashCommandSubcommandsOnlyBuilder
  | SlashCommandOptionsOnlyBuilder;

interface KamiCommandOptions {
  defer?: boolean;
  global?: boolean;
  dev?: boolean;
  ephemeral?: boolean;
  filePath: string;
  builder: AnySlashCommandBuilder;
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
  ephemeral: boolean;
  filePath: string;
  builder: AnySlashCommandBuilder;
  execute: (interaction: ChatInputCommandInteraction<CacheType>) => Awaitable<void>;
  autocomplete?: ((interaction: AutocompleteInteraction<CacheType>) => Awaitable<void>) | undefined;

  constructor(options: KamiCommandOptions) {
    this.defer = options.defer ?? true;
    this.global = options.global ?? false;
    this.dev = options.dev ?? false;
    this.ephemeral = options.ephemeral ?? false;
    this.filePath = options.filePath;
    this.builder = options.builder;
    this.execute = options.execute;
    this.autocomplete = options.autocomplete;
  }
}