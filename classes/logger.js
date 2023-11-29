const chalk = require("chalk");

const now = () => {
  const t = new Date(Date.now());
  return `[${t.getFullYear()}/${`${t.getMonth() + 1}`.padStart(2, "0")}/${`${t.getDate()}`.padStart(2, "0")} ${`${t.getHours()}`.padStart(2, "0")}:${`${t.getMinutes()}`.padStart(2, "0")}:${`${t.getSeconds()}`.padStart(2, "0")}]`;
};

class Logger {
  static debug(...args) {
    console.log(chalk.blackBright(now()), chalk.yellowBright("INFO:"), ...args);
  }

  static info(...args) {
    console.log(chalk.blackBright(now()), chalk.blueBright("INFO:"), ...args);
  }

  static success(...args) {
    console.log(chalk.blackBright(now()), chalk.greenBright("SUCCESS:"), ...args);
  }

  static error(...args) {
    console.error(chalk.blackBright(now()), chalk.redBright("ERROR:"), ...args);
  }

  static fatal(...args) {
    console.log(chalk.blackBright(now()), chalk.whiteBright.bgRedBright.bold("FATAL:"), ...args);
  }

  static blank() {
    console.log("");
  }
}

module.exports = { Logger };