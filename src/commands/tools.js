const gtts = require('gtts');
const QRCode = require('qrcode');
const { randomString, sleep, cleanFile } = require('../lib/utils');
const { log } = require('../lib/logger');
const config = require('../config');
const path = require('path');
const fs = require('fs');
const fse = require('fs-extra');
const axios = require('axios');

const commands = {};

commands['tts'] = async (sock, msg, { args, text, reply, jid }) => {
  if (!text) return reply('❌ Usage: .tts [text]\nExample: .tts Hello world');
  const langArg = args[0]?.length === 2 ? args[0] : 'en';
  const ttsText = langArg !== args[0] ? text : args.slice(1).join(' ') || text;

  try {
    await reply('🔊 Generating audio...');
    fse.ensureDirSync(config.tmpPath);
    const outPath = path.join(config.tmpPath, `${randomString()}.mp3`);
    await new Promise((resolve, reject) => {
      const tts = new gtts(ttsText.substring(0, 200), langArg);
      tts.save(outPath, (err) => (err ? reject(err) : resolve()));
    });
    const audioBuffer = fs.readFileSync(outPath);
    await sock.sendMessage(jid, {
      audio: audioBuffer,
      mimetype: 'audio/mpeg',
      ptt: true,
    }, { quoted: msg });
    cleanFile(outPath);
  } catch (err) {
    log.error('TTS error: ' + err.message);
    await reply('❌ TTS failed: ' + err.message);
  }
};

commands['qr'] = async (sock, msg, { text, reply, jid }) => {
  if (!text) return reply('❌ Usage: .qr [text or URL]');
  try {
    await reply('🔲 Generating QR code...');
    fse.ensureDirSync(config.tmpPath);
    const outPath = path.join(config.tmpPath, `${randomString()}.png`);
    await QRCode.toFile(outPath, text, {
      color: { dark: '#000000', light: '#FFFFFF' },
      width: 512,
      margin: 2,
    });
    const imgBuffer = fs.readFileSync(outPath);
    await sock.sendMessage(jid, {
      image: imgBuffer,
      caption: `✅ *QR Code Generated*\n📝 Content: ${text.substring(0, 80)}`,
    }, { quoted: msg });
    cleanFile(outPath);
  } catch (err) {
    log.error('QR error: ' + err.message);
    await reply('❌ QR generation failed: ' + err.message);
  }
};

commands['weather'] = async (sock, msg, { text, reply }) => {
  if (!text) return reply('❌ Usage: .weather [city name]');
  try {
    const res = await axios.get(`https://wttr.in/${encodeURIComponent(text)}?format=4`, { timeout: 10000 });
    await reply(`🌤️ *Weather for ${text}*\n${res.data}`);
  } catch {
    await reply('❌ Could not fetch weather. Try again later.');
  }
};

commands['joke'] = async (sock, msg, { reply }) => {
  const jokes = [
    "Why don't scientists trust atoms? Because they make up everything! 😂",
    "I told my wife she was drawing her eyebrows too high. She looked surprised. 😂",
    "Why can't a bicycle stand on its own? Because it's two-tired! 😄",
    "What do you call a fake noodle? An impasta! 😂",
    "Why did the scarecrow win an award? He was outstanding in his field! 😄",
    "I'm reading a book about anti-gravity. It's impossible to put down! 📚",
    "Did you hear about the mathematician who's afraid of negative numbers? He'll stop at nothing to avoid them! 🔢",
    "Why did the bicycle fall over? Because it was two-tired! 😂",
    "What do you call cheese that isn't yours? Nacho cheese! 🧀",
    "Why don't eggs tell jokes? They'd crack each other up! 🥚",
  ];
  const joke = jokes[Math.floor(Math.random() * jokes.length)];
  await reply(`😂 *Random Joke*\n\n${joke}`);
};

commands['quote'] = async (sock, msg, { reply }) => {
  try {
    const res = await axios.get('https://api.quotable.io/random', { timeout: 8000 });
    await reply(`💬 *Quote of the Day*\n\n"${res.data.content}"\n\n— *${res.data.author}*`);
  } catch {
    const quotes = [
      '"The only way to do great work is to love what you do." — Steve Jobs',
      '"In the middle of every difficulty lies opportunity." — Albert Einstein',
      '"It does not matter how slowly you go as long as you do not stop." — Confucius',
      '"Life is what happens when you\'re busy making other plans." — John Lennon',
      '"The future belongs to those who believe in the beauty of their dreams." — Eleanor Roosevelt',
    ];
    await reply(`💬 *Quote*\n\n${quotes[Math.floor(Math.random() * quotes.length)]}`);
  }
};

commands['fact'] = async (sock, msg, { reply }) => {
  try {
    const res = await axios.get('https://uselessfacts.jsph.pl/random.json?language=en', { timeout: 8000 });
    await reply(`🧠 *Random Fact*\n\n${res.data.text}`);
  } catch {
    const facts = [
      '🐙 Octopuses have three hearts and blue blood.',
      '🍯 Honey never expires. Archaeologists found 3000-year-old honey in Egyptian tombs.',
      '🦈 Sharks are older than trees.',
      '⚡ Lightning strikes Earth about 100 times every second.',
      '🧬 Humans share 60% of their DNA with bananas.',
    ];
    await reply(`🧠 *Random Fact*\n\n${facts[Math.floor(Math.random() * facts.length)]}`);
  }
};

commands['translate'] = async (sock, msg, { args, reply }) => {
  if (args.length < 2) return reply('❌ Usage: .translate [lang] [text]\nExample: .translate fr Hello world');
  const lang = args[0];
  const text = args.slice(1).join(' ');
  try {
    const res = await axios.get(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${lang}`,
      { timeout: 10000 }
    );
    const translated = res.data?.responseData?.translatedText;
    if (!translated) return reply('❌ Translation failed');
    await reply(`🌐 *Translation*\n📝 Original: ${text}\n🔄 Translated (${lang}): ${translated}`);
  } catch {
    await reply('❌ Translation service unavailable');
  }
};

commands['ip'] = async (sock, msg, { text, reply }) => {
  const ip = text || 'me';
  try {
    const res = await axios.get(`http://ip-api.com/json/${ip === 'me' ? '' : ip}`, { timeout: 10000 });
    const d = res.data;
    await reply(
      `🌐 *IP Information*\n` +
      `📍 IP: ${d.query}\n` +
      `🏳️ Country: ${d.country} ${d.countryCode}\n` +
      `🏙️ City: ${d.city}\n` +
      `📮 Region: ${d.regionName}\n` +
      `🌍 Timezone: ${d.timezone}\n` +
      `📡 ISP: ${d.isp}`
    );
  } catch {
    await reply('❌ Could not fetch IP info');
  }
};

module.exports = commands;
