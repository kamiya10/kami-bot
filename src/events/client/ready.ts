import { Events } from "discord.js";
import { Logger } from "../../classes/logger";

import type { KamiEventListener } from "@/events";

const name = Events.ClientReady;

export default {
  name,
  on(client) {
    Logger.info(`Client is ready as ${client.user.tag} with ${client.guilds.cache.size} guild${client.guilds.cache.size > 1 ? 's' : ''}.`);
  },
} as KamiEventListener<typeof name>;
