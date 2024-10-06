import type {
  AnySelectMenuInteraction,
  ApplicationCommandOptionChoiceData,
  AutocompleteInteraction,
  ButtonInteraction,
  ChatInputCommandInteraction,
  ModalSubmitInteraction,
} from 'discord.js';
import type {
  ModalBuilder,
  SharedSlashCommand,
  SlashCommandSubcommandBuilder,
} from '@discordjs/builders';
import type { KamiClient } from '@/class/client';

export interface KamiCommandOptions {
  builder: SharedSlashCommand;
  defer: boolean;
  ephemeral: boolean;
  modals?: Record<string, ModalBuilder>;
  execute: (
    this: KamiClient,
    interaction: ChatInputCommandInteraction<'cached'>
  ) => void | Promise<void>;
  onAutocomplete?: (
    this: KamiClient,
    interaction: AutocompleteInteraction<'cached'>
  ) =>
    | readonly ApplicationCommandOptionChoiceData[]
    | Promise<readonly ApplicationCommandOptionChoiceData[]>;
  onButton?: (
    this: KamiClient,
    interaction: ButtonInteraction<'cached'>,
    buttonId: string
  ) => void | Promise<void>;
  onModalSubmit?: (
    this: KamiClient,
    interaction: ModalSubmitInteraction<'cached'>,
    modalId: string
  ) => void | Promise<void>;
  onSelectMenu?: (
    this: KamiClient,
    interaction: AnySelectMenuInteraction<'cached'>,
    menuId: string
  ) => void | Promise<void>;
}

export class KamiCommand implements KamiCommandOptions {
  builder: SharedSlashCommand;
  defer: boolean;
  ephemeral: boolean;
  modals?: Record<string, ModalBuilder>;
  execute: (
    this: KamiClient,
    interaction: ChatInputCommandInteraction<'cached'>
  ) => void | Promise<void>;

  onAutocomplete?: (
    this: KamiClient,
    interaction: AutocompleteInteraction<'cached'>
  ) =>
    | readonly ApplicationCommandOptionChoiceData[]
    | Promise<readonly ApplicationCommandOptionChoiceData[]>;

  onButton?: (
    this: KamiClient,
    interaction: ButtonInteraction<'cached'>,
    buttonId: string
  ) => void | Promise<void>;

  onModalSubmit?: (
    this: KamiClient,
    interaction: ModalSubmitInteraction<'cached'>,
    modalId: string
  ) => void | Promise<void>;

  onSelectMenu?: (
    this: KamiClient,
    interaction: AnySelectMenuInteraction<'cached'>,
    menuId: string
  ) => void | Promise<void>;

  constructor(options: KamiCommandOptions) {
    this.builder = options.builder;
    this.defer = options.defer;
    this.ephemeral = options.ephemeral;
    this.modals = options.modals;
    this.execute = options.execute;
    this.onAutocomplete = options.onAutocomplete;
    this.onButton = options.onButton;
    this.onModalSubmit = options.onModalSubmit;
    this.onSelectMenu = options.onSelectMenu;
  }
}

export interface KamiSubCommand<T = undefined> {
  builder: SlashCommandSubcommandBuilder;
  execute(
    this: KamiClient,
    interaction: ChatInputCommandInteraction<'cached'>,
    ..._: T extends undefined ? [undefined?] : [data: T]
  ): void | Promise<void>;
}
