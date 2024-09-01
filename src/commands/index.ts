import type {
  ChatInputCommandInteraction,
  InteractionReplyOptions,
  MessageCreateOptions,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";

import type { KamiClient } from "@/classes/client";

// earthquake
import report from "@/commands/earthquake/report";
import rts from "@/commands/earthquake/rts";

// utils
import avatar from "@/commands/utils/avatar";
import banner from "@/commands/utils/banner";
import color from "@/commands/utils/color";
import ping from "@/commands/utils/ping";

// voice
import voice from "@/commands/voice/voice";

export interface KamiCommand {
  data:
    | SlashCommandBuilder
    | SlashCommandOptionsOnlyBuilder
    | SlashCommandSubcommandsOnlyBuilder;
  defer     : boolean;
  ephemeral : boolean;
  global : boolean;
  execute(
    this: KamiClient,
    interaction: ChatInputCommandInteraction<"cached">,
  ): Promise<SlashCommandResult | undefined>;
}

export enum ExecutionResultType {
  SingleSuccess,
}

export interface SlashCommandResult {
  type: ExecutionResultType;
  payload:  MessageCreateOptions & InteractionReplyOptions;
  delete?: number;
}

export default [
  report,
  rts,
  avatar,
  banner,
  color,
  ping,
  voice,
] as KamiCommand[];