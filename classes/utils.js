const { Locale } = require("discord.js");
const i18next = require("i18next");

const $at = (key) => [Locale.Japanese, Locale.ChineseTW]
  .reduce((msg, lng) => {
    msg[lng] = i18next.t(key, { lng });
    return msg;
  }, {});

module.exports = { $at };