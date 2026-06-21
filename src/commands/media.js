const { downloadMedia, saveTmp, getQuoted, getMsgType } = require('../lib/msg');
const { cleanFile, randomString, formatDuration, sleep } = require('../lib/utils');
const { log } = require('../lib/logger');
const config = require('../config');
const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');
const axios = require('axios');
const FormData = require('form-data');
const ffmpeg = require('fluent-ffmpeg');
const AdmZip = require('adm-zip');

const commands = {};

commands['sticker'] = commands['s'] = async (sock, msg, { reply, quoted, jid }) => {
  try {
    const target = quoted?.message || msg.message;
    let buffer, mime;

    if (target?.imageMessage) {
      buffer = await downloadMedia(target.imageMessage, 'image');
      mime = 'image';
    } else if (target?.videoMessage) {
      buffer = await downloadMedia(target.videoMessage, 'video');
      mime = 'video';
    } else {
      return reply('❌ Send or reply to an image/video to convert to sticker');
    }

    await reply('🎨 Creating sticker...');
    const inPath = await saveTmp(buffer, mime === 'image' ? 'jpg' : 'mp4');
    const outPath = path.join(config.tmpPath, `${randomString()}.webp`);

    await new Promise((resolve, reject) => {
      let cmd = ffmpeg(inPath).outputOptions([
        '-vf', 'scale=512:512:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000',
        '-loop', '0',
      ]);
      if (mime === 'video') {
        cmd = cmd.outputOptions(['-t', '6', '-r', '15']);
      }
      cmd.save(outPath).on('end', resolve).on('error', reject);
    });

    const stickerBuffer = fs.readFileSync(outPath);
    await sock.sendMessage(jid, {
      sticker: stickerBuffer,
    }, { quoted: msg });

    cleanFile(inPath);
    cleanFile(outPath);
  } catch (err) {
    log.error('Sticker error: ' + err.message);
    await reply('❌ Failed to create sticker: ' + err.message);
  }
};

commands['toimg'] = async (sock, msg, { reply, quoted, jid }) => {
  try {
    const target = quoted?.message || msg.message;
    if (!target?.stickerMessage) return reply('❌ Reply to a sticker to convert to image');

    await reply('🖼️ Converting sticker to image...');
    const buffer = await downloadMedia(target.stickerMessage, 'sticker');
    const inPath = await saveTmp(buffer, 'webp');
    const outPath = path.join(config.tmpPath, `${randomString()}.png`);

    await new Promise((resolve, reject) => {
      ffmpeg(inPath).outputOptions(['-frames:v', '1']).save(outPath)
        .on('end', resolve).on('error', reject);
    });

    const imgBuffer = fs.readFileSync(outPath);
    await sock.sendMessage(jid, { image: imgBuffer, caption: '✅ Here is your image!' }, { quoted: msg });

    cleanFile(inPath);
    cleanFile(outPath);
  } catch (err) {
    log.error('toimg error: ' + err.message);
    await reply('❌ Failed to convert sticker: ' + err.message);
  }
};

commands['ytmp3'] = commands['play'] = async (sock, msg, { args, text, reply, jid }) => {
  if (!text) return reply('❌ Usage: .ytmp3 [YouTube URL or song name]');
  try {
    await reply('🎵 Searching and downloading audio...');
    // Use youtube-music search if not a URL
    let url = text;
    if (!text.includes('youtube.com') && !text.includes('youtu.be')) {
      const { searchMusics } = require('node-youtube-music');
      const results = await searchMusics(text);
      if (!results || results.length === 0) return reply('❌ No results found for: ' + text);
      const top = results[0];
      url = `https://www.youtube.com/watch?v=${top.youtubeId}`;
      await reply(`🎵 Found: *${top.title}* by *${top.artists?.[0]?.name || 'Unknown'}*\n⏱️ Duration: ${formatDuration(top.duration?.totalSeconds || 0)}\n📥 Downloading...`);
    }

    // Download via yt-dlp style (use axios to a public API)
    const apiUrl = `https://api.dorleco.com/api/ytmp3?url=${encodeURIComponent(url)}`;
    const res = await axios.get(apiUrl, { timeout: 30000 });
    if (!res.data?.link) return reply('❌ Could not get download link. Try again later.');
    const audioRes = await axios.get(res.data.link, { responseType: 'arraybuffer', timeout: 60000 });
    const audioBuffer = Buffer.from(audioRes.data);
    await sock.sendMessage(jid, {
      audio: audioBuffer,
      mimetype: 'audio/mpeg',
      ptt: false,
    }, { quoted: msg });
    await reply('✅ Audio sent!');
  } catch (err) {
    log.error('ytmp3 error: ' + err.message);
    await reply('❌ Audio download failed: ' + err.message);
  }
};

commands['ytsearch'] = async (sock, msg, { text, reply }) => {
  if (!text) return reply('❌ Usage: .ytsearch [song name]');
  try {
    await reply('🔍 Searching YouTube Music...');
    const { searchMusics } = require('node-youtube-music');
    const results = await searchMusics(text);
    if (!results || results.length === 0) return reply('❌ No results found');
    const top5 = results.slice(0, 5);
    let response = `🎵 *YouTube Music Search Results*\nQuery: "${text}"\n\n`;
    top5.forEach((track, i) => {
      response += `*${i + 1}.* ${track.title}\n`;
      response += `   👤 ${track.artists?.[0]?.name || 'Unknown'}\n`;
      response += `   ⏱️ ${formatDuration(track.duration?.totalSeconds || 0)}\n`;
      response += `   🔗 https://youtu.be/${track.youtubeId}\n\n`;
    });
    await reply(response.trim());
  } catch (err) {
    log.error('ytsearch error: ' + err.message);
    await reply('❌ Search failed: ' + err.message);
  }
};

commands['ytmp4'] = async (sock, msg, { text, reply, jid }) => {
  if (!text) return reply('❌ Usage: .ytmp4 [YouTube URL]');
  if (!text.includes('youtube.com') && !text.includes('youtu.be')) return reply('❌ Please provide a valid YouTube URL');
  try {
    await reply('🎬 Downloading video...');
    const apiUrl = `https://api.dorleco.com/api/ytmp4?url=${encodeURIComponent(text)}`;
    const res = await axios.get(apiUrl, { timeout: 30000 });
    if (!res.data?.link) return reply('❌ Could not get download link');
    const videoRes = await axios.get(res.data.link, { responseType: 'arraybuffer', timeout: 120000 });
    const videoBuffer = Buffer.from(videoRes.data);
    await sock.sendMessage(jid, {
      video: videoBuffer,
      mimetype: 'video/mp4',
      caption: '✅ Downloaded by KING BLESS MD BOT',
    }, { quoted: msg });
  } catch (err) {
    log.error('ytmp4 error: ' + err.message);
    await reply('❌ Video download failed: ' + err.message);
  }
};

module.exports = commands;
