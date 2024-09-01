/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */

import c from "chalk";

const getCurrentTime = () => {
  const time = new Date(Date.now());
  return c.blackBright([
    [
      time.getFullYear(),
      time.getMonth().toString().padStart(2, "0"),
      time.getDate().toString().padStart(2, "0"),
    ].join("/"),
    [
      time.getHours().toString().padStart(2, " "),
      time.getMinutes().toString().padStart(2, "0"),
      time.getSeconds().toString().padStart(2, "0"),
    ].join(":"),
  ].join(" "));
};

export class Logger {
  static debug(message: string, ...args: any[]) {
    console.debug(getCurrentTime(), c.cyan.italic("Debug"), c.gray.italic(message));
    for (const arg of args) {
      console.debug(c.gray.italic(Bun.inspect(arg, { colors: true })));
    }
  }

  static info(...args: any[]) {
    console.log(getCurrentTime(), c.blueBright("Info"), ...args);
  }

  static warn(...args: any[]) {
    console.warn(getCurrentTime(), c.yellow("Warn"), ...args);
  }

  static error(message: string, ...args: any[]) {
    console.error(getCurrentTime(), c.redBright("Error"), c.gray.italic(message));
    for (const arg of args) {
      console.error(arg);
    }
  }

  static fatal(...args: any[]) {
    console.log(getCurrentTime(), c.whiteBright.bgRedBright.bold("FATAL"), ...args);
  }

  static blank() {
    console.log("");
  }
}