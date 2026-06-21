const pino = require('pino');
const chalk = require('chalk');
const config = require('../config');

const logger = pino({
  level: config.logLevel,
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  },
});

const log = {
  info: (msg) => console.log(chalk.cyan(`[INFO] ${msg}`)),
  success: (msg) => console.log(chalk.green(`[SUCCESS] ${msg}`)),
  warn: (msg) => console.log(chalk.yellow(`[WARN] ${msg}`)),
  error: (msg) => console.log(chalk.red(`[ERROR] ${msg}`)),
  debug: (msg) => console.log(chalk.gray(`[DEBUG] ${msg}`)),
  bot: (msg) => console.log(chalk.magenta(`[BOT] ${msg}`)),
};

module.exports = { logger, log };
