const chalk = require("chalk");

class Logger {
  static info(...args) {
    console.log(chalk.blueBright("INFO:"), ...args);
  }

  static success(...args) {
    console.log(chalk.greenBright("SUCCESS:"), ...args);
  }

  static error(...args) {
    console.error(chalk.redBright("ERROR:"), ...args);
  }

  static fatal(...args) {
    console.log(chalk.whiteBright.bgRedBright.bold("FATAL:"), ...args);
  }

  static blank() {
    console.log("");
  }
}

module.exports = { Logger };