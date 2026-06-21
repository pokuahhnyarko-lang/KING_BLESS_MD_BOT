const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  isJidBroadcast,
} = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const pino = require('pino');
const qrcode = require('qrcode-terminal');
const path = require('path');
const fse = require('fs-extra');
const { log } = require('./lib/logger');
const { handleMessage } = require('./handler');
const config = require('./config');

const SESSION_PATH = path.join(config.sessionPath, config.sessionId);

async function connectToWhatsApp() {
  fse.ensureDirSync(SESSION_PATH);

  const { state, saveCreds } = await useMultiFileAuthState(SESSION_PATH);
  const { version, isLatest } = await fetchLatestBaileysVersion();
  log.info(`Using WA v${version.join('.')}, isLatest: ${isLatest}`);

  const sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
    },
    generateHighQualityLinkPreview: true,
    getMessage: async (key) => {
      return { conversation: '' };
    },
    shouldIgnoreJid: (jid) => isJidBroadcast(jid),
  });

  // QR Code handling
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      log.bot('Scan the QR code below to connect:');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'close') {
      const statusCode = new Boom(lastDisconnect?.error)?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      log.warn(`Connection closed (${statusCode}). Reconnecting: ${shouldReconnect}`);

      if (shouldReconnect) {
        setTimeout(connectToWhatsApp, 5000);
      } else {
        log.error('Logged out. Delete the session folder and restart.');
        process.exit(1);
      }
    }

    if (connection === 'open') {
      log.success(`✅ KING BLESS MD BOT Connected as: ${sock.user?.id}`);
      log.success(`📡 Prefix: ${config.prefix} | Version: ${config.version}`);
    }
  });

  // Save credentials on update
  sock.ev.on('creds.update', saveCreds);

  // Handle incoming messages
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    for (const msg of messages) {
      await handleMessage(sock, msg);
    }
  });

  // Group participant updates
  sock.ev.on('group-participants.update', async ({ id, participants, action }) => {
    try {
      const meta = await sock.groupMetadata(id);
      if (action === 'add') {
        for (const jid of participants) {
          const num = jid.split('@')[0];
          await sock.sendMessage(id, {
            text: `👋 Welcome to *${meta.subject}*, @${num}!\nEnjoying the group? Type ${config.prefix}menu to see bot commands.`,
            mentions: [jid],
          });
        }
      } else if (action === 'remove') {
        for (const jid of participants) {
          const num = jid.split('@')[0];
          await sock.sendMessage(id, {
            text: `👋 Goodbye @${num}. Hope to see you again!`,
            mentions: [jid],
          });
        }
      }
    } catch {}
  });

  return sock;
}

module.exports = { connectToWhatsApp };
