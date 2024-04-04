import { Locale } from "discord.js";
import i18next from "i18next";

export const $at = (key: string): Record<Locale, string> =>
  ([Locale.Japanese, Locale.ChineseTW] as const)
    .reduce((msg, lng) => {
      msg[lng] = i18next.t(key, { lng });
      return msg;
    }, <Record<Locale, string>>{});
