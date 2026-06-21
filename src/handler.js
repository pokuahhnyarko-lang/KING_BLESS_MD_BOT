const config = require('./config');
const { log } = require('./lib/logger');
const { getBody, getSender, getQuoted, getMsgType, isGroup } = require('./lib/msg');
const { parseCommand, isOwner } = require('./lib/utils');
const { isSpamming } = require('./lib/cache');

// Load all command modules
const allCommands = {};
const modules = ['general', 'tools', 'media', 'group', 'owner'];
for (const mod of modules) {
  try {
    const cmds = require('./commands/' + mod);
    Object.assign(allCommands, cmds);
  } catch (err) {
    log.error(`Failed to load command module "${mod}": ${err.message}`);
  }
}

log.success(`Loaded ${Object.keys(allCommands).length} commands: ${Object.keys(allCommands).join(', ')}`);

async function handleMessage(sock, msg) {
  try {
    if (!msg.message) return;
    if (msg.key.fromMe) return; // Ignore self

    const jid = msg.key.remoteJid;
    const sender = getSender(msg);
    const body = getBody(msg);
    const group = isGroup(jid);
    const quoted = getQuoted(msg);
    const msgType = getMsgType(msg);
    const isOwnerSender = isOwner(sender);

    // Auto-read
    if (config.autoRead) {
      await sock.readMessages([msg.key]);
    }

    // Auto-typing presence
    if (config.autoTyping && body.startsWith(config.prefix)) {
      await sock.sendPresenceUpdate('composing', jid);
    }

    // Ignore non-command messages (unless you want to handle them)
    if (!body.startsWith(config.prefix)) return;

    const { cmd, args, text } = parseCommand(body, config.prefix);

    // Anti-spam check (skip for owner)
    if (!isOwnerSender && isSpamming(sender, cmd, 3000)) {
      return await sock.sendMessage(jid, { text: '⏳ Slow down! Wait a few seconds between commands.' }, { quoted: msg });
    }

    log.bot(`CMD: ${config.prefix}${cmd} | FROM: ${sender} | GROUP: ${group}`);

    // Get mentioned JIDs
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

    // Reply helper
    const reply = async (text, mentions) => {
      return sock.sendMessage(
        jid,
        { text, mentions: mentions || [] },
        { quoted: msg }
      );
    };

    const ctx = { jid, sender, cmd, args, text, body, quoted, mentioned, isGroup: group, isOwner: isOwnerSender, reply, msgType };

    // Execute command
    if (allCommands[cmd]) {
      try {
        await allCommands[cmd](sock, msg, ctx);
      } catch (err) {
        log.error(`Command ${cmd} failed: ${err.message}`);
        await reply(`❌ Command failed: ${err.message}`);
      }
    } else {
      // Unknown command — silent or respond
      if (config.publicMode) {
        await reply(`❓ Unknown command: *${config.prefix}${cmd}*\nType *${config.prefix}menu* for the command list.`);
      }
    }

    // Reset typing
    if (config.autoTyping) {
      await sock.sendPresenceUpdate('paused', jid);
    }
  } catch (err) {
    log.error('Handler error: ' + err.message);
  }
}

module.exports = { handleMessage, allCommands };
