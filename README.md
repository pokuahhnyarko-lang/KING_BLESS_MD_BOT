# 👑 KING BLESS MD BOT

> An extreme, powerful and advanced WhatsApp Bot powered by [@whiskeysockets/baileys](https://github.com/WhiskeySockets/Baileys)

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org)
[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)
[![WhatsApp](https://img.shields.io/badge/WhatsApp-Bot-brightgreen)](https://github.com)

---

## ✨ Features

- 🎵 **YouTube Music** — Search, download audio & video
- 🎨 **Sticker Maker** — Convert images/videos to stickers
- 🔊 **Text-to-Speech** — Convert text to audio in multiple languages
- 🔲 **QR Code Generator** — Generate QR codes from any text/URL
- 👥 **Group Management** — Kick, add, promote, demote, mute, tag all
- 🌍 **World Time** — Get time in any timezone
- 🧮 **Calculator** — Evaluate math expressions
- 🌐 **Translator** — Translate text to any language
- 🌤️ **Weather** — Get real-time weather data
- 😂 **Fun Commands** — Jokes, quotes, facts, dice, coin flip
- 🔒 **Anti-Spam** — Built-in rate limiting per user
- 📢 **Auto Welcome/Goodbye** — Greet new group members
- 👑 **Owner Commands** — Broadcast, block/unblock, shutdown

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- ffmpeg installed on system (`sudo apt install ffmpeg`)

### Installation

```bash
# Clone the repository
git clone https://github.com/YOURUSERNAME/KING_BLESS_MD_BOT.git
cd KING_BLESS_MD_BOT

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your settings
nano .env
```

### Configuration

Edit `.env`:

```env
BOT_NAME=KING BLESS MD BOT
PREFIX=.
OWNER_NUMBER=2348000000000    # Your WhatsApp number with country code, no +
SESSION_ID=king_bless_session
AUTO_READ=true
AUTO_TYPING=true
PUBLIC_MODE=true
```

### Running

```bash
# Start the bot
npm start

# Development with auto-restart
npm run dev
```

Scan the QR code that appears in the terminal with your WhatsApp.

---

## 📋 Command List

Use `.menu` or `.help` to see all commands in WhatsApp.

### General
| Command | Description |
|---------|-------------|
| `.menu` | Show full command menu |
| `.ping` | Check bot response speed |
| `.alive` | Check if bot is running |
| `.info` | Bot information |
| `.runtime` | Bot uptime |
| `.calc [expr]` | Calculator |
| `.encode [text]` | Base64 encode |
| `.decode [text]` | Base64 decode |
| `.flip` | Coin flip |
| `.roll [sides]` | Dice roll |
| `.time [zone]` | World time |

### Media
| Command | Description |
|---------|-------------|
| `.sticker` / `.s` | Convert image/video to sticker |
| `.toimg` | Convert sticker to image |
| `.ytmp3 [url/name]` | Download YouTube audio |
| `.ytmp4 [url]` | Download YouTube video |
| `.ytsearch [query]` | Search YouTube Music |
| `.play [song]` | Play music by name |

### Tools
| Command | Description |
|---------|-------------|
| `.tts [text]` | Text to Speech |
| `.qr [text]` | Generate QR code |
| `.translate [lang] [text]` | Translate text |
| `.weather [city]` | Weather info |
| `.joke` | Random joke |
| `.quote` | Random quote |
| `.fact` | Random fact |
| `.ip [address]` | IP information |

### Group Management *(Admin only)*
| Command | Description |
|---------|-------------|
| `.groupinfo` | Group details |
| `.tagall [msg]` | Tag all members |
| `.kick @user` | Remove member |
| `.add [number]` | Add member |
| `.promote @user` | Make admin |
| `.demote @user` | Remove admin |
| `.mute` | Mute group |
| `.unmute` | Unmute group |
| `.link` | Get invite link |
| `.revoke` | Revoke invite link |

### Owner Only
| Command | Description |
|---------|-------------|
| `.broadcast [msg]` | Broadcast to all groups |
| `.block @user` | Block user |
| `.unblock @user` | Unblock user |
| `.setname [name]` | Change bot name |
| `.setstatus [text]` | Change bot status |
| `.shutdown` | Shutdown bot |
| `.restart` | Restart bot |

---

## 📁 Project Structure

```
KING_BLESS_MD_BOT/
├── src/
│   ├── index.js          # Entry point
│   ├── config.js         # Configuration
│   ├── connection.js     # Baileys WhatsApp connection
│   ├── handler.js        # Command dispatcher
│   ├── commands/
│   │   ├── general.js    # General commands
│   │   ├── media.js      # Media commands
│   │   ├── tools.js      # Utility tools
│   │   ├── group.js      # Group management
│   │   └── owner.js      # Owner-only commands
│   └── lib/
│       ├── logger.js     # Logging utility
│       ├── utils.js      # Helper functions
│       ├── cache.js      # NodeCache anti-spam
│       └── msg.js        # Message parsing helpers
├── session/              # WhatsApp session (gitignored)
├── tmp/                  # Temporary files (gitignored)
├── downloads/            # Downloaded media (gitignored)
├── .env.example          # Environment template
├── .gitignore
├── package.json
└── README.md
```

---

## ⚙️ Stack

| Package | Purpose |
|---------|---------|
| `@whiskeysockets/baileys` | WhatsApp Web API |
| `node-cache` | Anti-spam caching |
| `libphonenumber-js` | Phone number parsing |
| `moment-timezone` | Time/timezone handling |
| `node-youtube-music` | YouTube Music search |
| `performance-now` | High-res timing |
| `pino` | Fast logging |
| `fluent-ffmpeg` | Media conversion |
| `gtts` | Text-to-Speech |
| `qrcode` | QR code generation |
| `qrcode-terminal` | Terminal QR display |
| `adm-zip` | ZIP handling |
| `axios` | HTTP requests |
| `chalk` | Terminal colors |
| `dotenv` | Environment config |
| `express` | Health check server |
| `form-data` | Multipart form data |
| `fs-extra` | Enhanced file system |

---

## 🛡️ License

MIT License — see [LICENSE](LICENSE)

---

## 👑 Author

**KING BLESS** — KING BLESS MD BOT

> _"Power is nothing without control"_ — KING BLESS MD BOT
