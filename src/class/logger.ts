/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */

import chalk from 'chalk';

const time = () => {
  const date = new Date(Date.now());
  const timestamp = [
    [
      date.getFullYear(),
      (date.getMonth() + 1).toString().padStart(2, '0'),
      date.getDate().toString().padStart(2, '0'),
    ].join('/'),
    [
      date.getHours().toString().padStart(2, '0'),
      date.getMinutes().toString().padStart(2, '0'),
      date.getSeconds().toString().padStart(2, '0'),
    ].join(':'),
  ].join(' ');
  return chalk.gray(`[${timestamp}]`);
};

const pad = (label: string) => label.padEnd(5, ' ');

export default {
  trace(...args: any[]) {
    console.trace(`${time()} ${chalk.gray.italic(pad('Trace'))}`, ...args);
  },
  debug(message: string, ...args: any[]) {
    console.debug(
      `${time()} ${chalk.cyan.italic(pad('Debug'))}`,
      chalk.gray.italic(message),
      ...args,
    );
  },
  info(message: string, ...args: any[]) {
    console.info(
      chalk.blue(`${time()} ${pad('Info')}`),
      message,
      ...args,
    );
  },
  warn(message: string, ...args: any[]) {
    console.warn(
      `${time()} ${chalk.yellow.bold(pad('Warn'))}`,
      message,
      ...args,
    );
  },
  error(message: string, ...args: any[]) {
    console.error(
      `${time()} ${chalk.red.bold(pad('Error'))}`,
      chalk.bold(message),
      ...args,
    );
  },
};
