const { downloadContentFromMessage, jidDecode } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');
const config = require('../config');
const { ensureDir, randomString } = require('./utils');

/**
 * Download media from a message
 */
async function downloadMedia(message, type) {
  const stream = await downloadContentFromMessage(message, type);
  let buffer = Buffer.from([]);
  for await (const chunk of stream) {
    buffer = Buffer.concat([buffer, chunk]);
  }
  return buffer;
}

/**
 * Save buffer to tmp directory
 */
async function saveTmp(buffer, ext) {
  ensureDir(config.tmpPath);
  const filename = `${randomString(10)}.${ext}`;
  const filePath = path.join(config.tmpPath, filename);
  await fse.outputFile(filePath, buffer);
  return filePath;
}

/**
 * Extract JID numbers
 */
function decodeJid(jid) {
  if (!jid) return jid;
  const { user, server } = jidDecode(jid) || {};
  return user && server ? `${user}@${server}` : jid;
}

/**
 * Get sender info from message context
 */
function getSender(msg) {
  return msg.key.fromMe
    ? msg.key.remoteJid
    : msg.key.participant || msg.key.remoteJid;
}

/**
 * Get message body text
 */
function getBody(msg) {
  const m = msg.message;
  if (!m) return '';
  return (
    m.conversation ||
    m.extendedTextMessage?.text ||
    m.imageMessage?.caption ||
    m.videoMessage?.caption ||
    m.documentMessage?.caption ||
    m.buttonsResponseMessage?.selectedButtonId ||
    m.listResponseMessage?.singleSelectReply?.selectedRowId ||
    m.templateButtonReplyMessage?.selectedId ||
    ''
  );
}

/**
 * Get quoted message content
 */
function getQuoted(msg) {
  const m = msg.message;
  const ctx =
    m?.extendedTextMessage?.contextInfo ||
    m?.imageMessage?.contextInfo ||
    m?.videoMessage?.contextInfo ||
    m?.documentMessage?.contextInfo ||
    m?.stickerMessage?.contextInfo;
  return ctx?.quotedMessage || null;
}

/**
 * Get message type
 */
function getMsgType(msg) {
  const m = msg.message;
  if (!m) return 'unknown';
  const keys = Object.keys(m);
  return keys.find((k) => k !== 'messageContextInfo') || 'unknown';
}

/**
 * Check if chat is group
 */
function isGroup(jid) {
  return jid?.endsWith('@g.us');
}

module.exports = { downloadMedia, saveTmp, decodeJid, getSender, getBody, getQuoted, getMsgType, isGroup };
