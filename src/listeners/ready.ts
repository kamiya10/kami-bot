import { Events } from "discord.js";
import { KamiListener } from "../classes/listener";
import { Logger } from "../classes/logger";

export const build = (): KamiListener => new KamiListener("ready")
  .on(Events.ClientReady, () => {
    Logger.info("client ready");
  });
