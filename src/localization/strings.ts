import slash_en from "./en/slash.json";
import header_en from "./en/header.json";
import common_en from "./en/common.json";
import slash_ja from "./ja/slash.json";
import header_ja from "./ja/header.json";
import common_ja from "./ja/common.json";
import slash_zhTW from "./zh-TW/slash.json";
import header_zhTW from "./zh-TW/header.json";
import common_zhTW from "./zh-TW/common.json";
import { Locale } from "discord.js";

export default {
  [Locale.EnglishUS]: {
    slash: slash_en,
    header: header_en,
    common: common_en,
  },
  [Locale.Japanese]: {
    slash: slash_ja,
    header: header_ja,
    common: common_ja,
  },
  [Locale.ChineseTW]: {
    slash: slash_zhTW,
    header: header_zhTW,
    common: common_zhTW,
  },
}; 