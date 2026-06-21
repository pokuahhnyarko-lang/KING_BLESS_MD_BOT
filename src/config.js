require('dotenv').config();

module.exports = {
  botName: process.env.BOT_NAME || 'KING BLESS MD BOT',
  prefix: process.env.PREFIX || '.',
  ownerNumber: process.env.OWNER_NUMBER || '2348000000000',
  botNumber: process.env.BOT_NUMBER || '',
  sessionId: process.env.SESSION_ID || 'king_bless_session',
  autoRead: process.env.AUTO_READ === 'true',
  autoTyping: process.env.AUTO_TYPING === 'true',
  autoRecording: process.env.AUTO_RECORDING === 'true',
  publicMode: process.env.PUBLIC_MODE === 'true',
  logLevel: process.env.LOG_LEVEL || 'info',
  removeBgKey: process.env.REMOVE_BG_KEY || '',
  openaiKey: process.env.OPENAI_KEY || '',
  version: '1.0.0',
  packname: 'KING BLESS MD',
  author: 'KING BLESS',
  github: 'https://github.com/KINGBLESS',
  sessionPath: './session',
  tmpPath: './tmp',
  downloadsPath: './downloads',
};
