require('dotenv').config();
const chalk = require('chalk');
const { connectToWhatsApp } = require('./connection');
const { log } = require('./lib/logger');
const { ensureDir } = require('./lib/utils');
const config = require('./config');
const express = require('express');
const os = require('os');

// Ensure required directories
ensureDir(config.tmpPath);
ensureDir(config.downloadsPath);
ensureDir(config.sessionPath);

// Banner
console.log(chalk.bold.magenta(`
╔═══════════════════════════════════╗
║   👑  KING BLESS MD BOT  👑       ║
║   Advanced WhatsApp Bot           ║
║   Powered by @whiskeysockets/baileys ║
║   Version: ${config.version}                    ║
╚═══════════════════════════════════╝
`));

log.info(`Node.js: ${process.version}`);
log.info(`Platform: ${os.platform()} | Arch: ${os.arch()}`);
log.info(`Prefix: ${config.prefix} | Owner: ${config.ownerNumber}`);

// Optional Express health check server
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({
    status: 'running',
    bot: config.botName,
    version: config.version,
    uptime: process.uptime(),
    prefix: config.prefix,
  });
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  log.info(`Health server running on port ${PORT}`);
});

// Handle unhandled rejections
process.on('unhandledRejection', (reason) => {
  log.error('Unhandled Rejection: ' + reason);
});

process.on('uncaughtException', (err) => {
  log.error('Uncaught Exception: ' + err.message);
  process.exit(1);
});

// Start the bot
(async () => {
  try {
    log.bot('Starting KING BLESS MD BOT...');
    await connectToWhatsApp();
  } catch (err) {
    log.error('Failed to start: ' + err.message);
    process.exit(1);
  }
})();
