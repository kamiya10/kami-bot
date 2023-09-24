import { AutocompleteInteraction, ChatInputCommandInteraction } from "discord.js";
import { Awaitable } from "@discordjs/util";
import { SlashCommandBuilder } from "@discordjs/builders/dist";

interface KamiCommandConstructor {
  defer: boolean;
  global: boolean;
  dev: boolean;
  filePath: string;
  builder: SlashCommandBuuilder;
  execute: (interaction: ChatInputCommandInteraction) => Awaitable<void>;
  autocomplete?: (interaction: AutocompleteInteraction) => Awaitable<void>;
}

export class KamiCommand {
  constructor(options: KamiCommandConstructor);
  
  public defer: boolean;
  public global: boolean;
  public dev: boolean;
  public filePath: string;
  public builder: SlashCommandBuilder;

  public execute(interaction: ChatInputCommandInteraction): Awaitable<void>;
  public autocomplete?(interaction: AutocompleteInteraction): Awaitable<void>;
}