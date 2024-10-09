import type {
  AnySelectMenuInteraction,
  ApplicationCommandOptionChoiceData,
  AutocompleteInteraction,
  Awaitable,
  ButtonInteraction,
  ChatInputCommandInteraction,
  ModalBuilder,
  ModalSubmitInteraction,
  SharedSlashCommand,
  SlashCommandSubcommandBuilder,
} from 'discord.js';
import type { KamiClient } from '@/class/client';

export interface KamiCommandOptions {
  builder: SharedSlashCommand;
  defer: boolean;
  ephemeral: boolean;
  modals?: Record<string, ModalBuilder>;
  execute: (
    this: KamiClient,
    interaction: ChatInputCommandInteraction<'cached'>
  ) => Awaitable<void>;
  onAutocomplete?: (
    this: KamiClient,
    interaction: AutocompleteInteraction<'cached'>
  ) => Awaitable<readonly ApplicationCommandOptionChoiceData[]>;
  onButton?: (
    this: KamiClient,
    interaction: ButtonInteraction<'cached'>,
    buttonId: string
  ) => Awaitable<void>;
  onModalSubmit?: (
    this: KamiClient,
    interaction: ModalSubmitInteraction<'cached'>,
    modalId: string
  ) => Awaitable<void>;
  onSelectMenu?: (
    this: KamiClient,
    interaction: AnySelectMenuInteraction<'cached'>,
    menuId: string
  ) => Awaitable<void>;
}

export class KamiCommand implements KamiCommandOptions {
  builder: SharedSlashCommand;
  defer: boolean;
  ephemeral: boolean;
  modals?: Record<string, ModalBuilder>;
  execute: (
    this: KamiClient,
    interaction: ChatInputCommandInteraction<'cached'>
  ) => Awaitable<void>;

  onAutocomplete?: (
    this: KamiClient,
    interaction: AutocompleteInteraction<'cached'>
  ) => Awaitable<readonly ApplicationCommandOptionChoiceData[]>;

  onButton?: (
    this: KamiClient,
    interaction: ButtonInteraction<'cached'>,
    buttonId: string
  ) => Awaitable<void>;

  onModalSubmit?: (
    this: KamiClient,
    interaction: ModalSubmitInteraction<'cached'>,
    modalId: string
  ) => Awaitable<void>;

  onSelectMenu?: (
    this: KamiClient,
    interaction: AnySelectMenuInteraction<'cached'>,
    menuId: string
  ) => Awaitable<void>;

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
  ): Awaitable<boolean | void>;
  onAutocomplete?: (
    this: KamiClient,
    interaction: AutocompleteInteraction<'cached'>
  ) => Awaitable<readonly ApplicationCommandOptionChoiceData[]>;
  onButton?: (
    this: KamiClient,
    interaction: ButtonInteraction<'cached'>,
    buttonId: string
  ) => Awaitable<void>;
  onModalSubmit?: (
    this: KamiClient,
    interaction: ModalSubmitInteraction<'cached'>,
    modalId: string
  ) => Awaitable<void>;
  onSelectMenu?: (
    this: KamiClient,
    interaction: AnySelectMenuInteraction<'cached'>,
    menuId: string
  ) => Awaitable<void>;
}
