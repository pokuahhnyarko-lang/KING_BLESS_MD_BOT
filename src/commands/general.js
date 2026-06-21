const { getTime, getDate, getGreeting, formatBytes, measureTime, sleep } = require('../lib/utils');
const { log } = require('../lib/logger');
const config = require('../config');
const os = require('os');
const now = require('performance-now');

const commands = {};

commands['menu'] = commands['help'] = async (sock, msg, { reply }) => {
  const start = now();
  const time = getTime();
  const date = getDate();
  const greeting = getGreeting();
  const menu = `
╔══════════════════════════╗
║   👑 *KING BLESS MD BOT* 👑   ║
╠══════════════════════════╣
║  ${greeting}
║  🕐 *Time:* ${time}
║  📅 *Date:* ${date}
╠══════════════════════════╣
║       *GENERAL*
║  ${config.prefix}menu - Show this menu
║  ${config.prefix}ping - Bot response speed
║  ${config.prefix}info - Bot information
║  ${config.prefix}runtime - Bot uptime
║  ${config.prefix}alive - Check if bot is alive
║  ${config.prefix}speed - Speed test
╠══════════════════════════╣
║       *TOOLS*
║  ${config.prefix}tts [text] - Text to Speech
║  ${config.prefix}qr [text] - Generate QR code
║  ${config.prefix}time [zone] - World time
║  ${config.prefix}calc [expr] - Calculator
║  ${config.prefix}encode [text] - Base64 encode
║  ${config.prefix}decode [text] - Base64 decode
║  ${config.prefix}translate [lang] [text] - Translate
╠══════════════════════════╣
║       *MEDIA*
║  ${config.prefix}sticker - Image to sticker
║  ${config.prefix}toimg - Sticker to image
║  ${config.prefix}ytmp3 [url] - YT Audio download
║  ${config.prefix}ytmp4 [url] - YT Video download
║  ${config.prefix}ytsearch [query] - YT Music search
║  ${config.prefix}play [song] - Play music
╠══════════════════════════╣
║       *GROUP*
║  ${config.prefix}kick [@user] - Remove member
║  ${config.prefix}add [number] - Add member
║  ${config.prefix}promote [@user] - Make admin
║  ${config.prefix}demote [@user] - Remove admin
║  ${config.prefix}mute - Mute group
║  ${config.prefix}unmute - Unmute group
║  ${config.prefix}groupinfo - Group info
║  ${config.prefix}tagall - Tag everyone
╠══════════════════════════╣
║       *FUN*
║  ${config.prefix}joke - Random joke
║  ${config.prefix}quote - Random quote
║  ${config.prefix}fact - Random fact
║  ${config.prefix}flip - Coin flip
║  ${config.prefix}roll [sides] - Dice roll
╠══════════════════════════╣
║       *OWNER ONLY*
║  ${config.prefix}broadcast [msg] - Broadcast msg
║  ${config.prefix}block [@user] - Block user
║  ${config.prefix}unblock [@user] - Unblock user
║  ${config.prefix}shutdown - Shutdown bot
╚══════════════════════════╝
_Powered by KING BLESS MD BOT v${config.version}_`;
  await reply(menu);
  log.info(`Menu sent in ${measureTime(start)}`);
};

commands['ping'] = async (sock, msg, { reply }) => {
  const start = now();
  await reply('🏓 Pinging...');
  const ms = (now() - start).toFixed(2);
  await reply(`🏓 *Pong!*\n⚡ Response: *${ms}ms*`);
};

commands['speed'] = async (sock, msg, { reply }) => {
  const start = now();
  const msg1 = await reply('🚀 Running speed test...');
  const elapsed = (now() - start).toFixed(2);
  await reply(`✅ *Speed Test Complete!*\n⚡ Speed: *${elapsed}ms*\n📶 Status: Excellent`);
};

commands['alive'] = async (sock, msg, { reply }) => {
  await reply(`✅ *KING BLESS MD BOT is ALIVE!*\n👑 Version: ${config.version}\n🕐 Time: ${getTime()}\n📅 Date: ${getDate()}`);
};

commands['info'] = async (sock, msg, { reply }) => {
  const uptime = process.uptime();
  const h = Math.floor(uptime / 3600);
  const m = Math.floor((uptime % 3600) / 60);
  const s = Math.floor(uptime % 60);
  const info = `
👑 *BOT INFORMATION*

📛 *Name:* ${config.botName}
🔖 *Version:* ${config.version}
⚙️ *Prefix:* ${config.prefix}
🌐 *Node.js:* ${process.version}
🖥️ *Platform:* ${process.platform}
💾 *Memory:* ${formatBytes(process.memoryUsage().rss)}
⏰ *Uptime:* ${h}h ${m}m ${s}s
📦 *Library:* @whiskeysockets/baileys
👨‍💻 *Author:* KING BLESS`;
  await reply(info);
};

commands['runtime'] = async (sock, msg, { reply }) => {
  const uptime = process.uptime();
  const h = Math.floor(uptime / 3600);
  const m = Math.floor((uptime % 3600) / 60);
  const s = Math.floor(uptime % 60);
  await reply(`⏰ *Bot Runtime*\n${h} hours, ${m} minutes, ${s} seconds`);
};

commands['calc'] = async (sock, msg, { args, text, reply }) => {
  if (!text) return reply('❌ Usage: .calc [expression]\nExample: .calc 2+2*10');
  try {
    // Safe evaluation using Function constructor restricted to math
    const sanitized = text.replace(/[^0-9+\-*/.()%\s]/g, '');
    if (!sanitized) return reply('❌ Invalid expression');
    const result = Function(`"use strict"; return (${sanitized})`)();
    await reply(`🧮 *Calculator*\n📝 Expression: ${text}\n✅ Result: *${result}*`);
  } catch {
    await reply('❌ Invalid mathematical expression');
  }
};

commands['encode'] = async (sock, msg, { text, reply }) => {
  if (!text) return reply('❌ Usage: .encode [text]');
  const encoded = Buffer.from(text).toString('base64');
  await reply(`🔒 *Base64 Encoded:*\n\`\`\`${encoded}\`\`\``);
};

commands['decode'] = async (sock, msg, { text, reply }) => {
  if (!text) return reply('❌ Usage: .decode [base64text]');
  try {
    const decoded = Buffer.from(text, 'base64').toString('utf8');
    await reply(`🔓 *Base64 Decoded:*\n${decoded}`);
  } catch {
    await reply('❌ Invalid base64 string');
  }
};

commands['flip'] = async (sock, msg, { reply }) => {
  const result = Math.random() < 0.5 ? '🪙 HEADS' : '🪙 TAILS';
  await reply(`*Coin Flip Result:* ${result}`);
};

commands['roll'] = async (sock, msg, { args, reply }) => {
  const sides = parseInt(args[0]) || 6;
  if (sides < 2) return reply('❌ Dice must have at least 2 sides');
  const result = Math.floor(Math.random() * sides) + 1;
  await reply(`🎲 *Dice Roll (${sides} sides):* ${result}`);
};

commands['time'] = async (sock, msg, { args, text, reply }) => {
  const zones = {
    lagos: 'Africa/Lagos',
    london: 'Europe/London',
    newyork: 'America/New_York',
    tokyo: 'Asia/Tokyo',
    dubai: 'Asia/Dubai',
    nairobi: 'Africa/Nairobi',
    accra: 'Africa/Accra',
  };
  const zone = zones[text?.toLowerCase().replace(/\s/g, '')] || text || 'Africa/Lagos';
  const { getTime: gt, getDate: gd } = require('../lib/utils');
  await reply(`🌍 *World Time*\n📍 Timezone: ${zone}\n🕐 Time: ${gt(zone)}\n📅 Date: ${gd(zone)}`);
};

module.exports = commands;
