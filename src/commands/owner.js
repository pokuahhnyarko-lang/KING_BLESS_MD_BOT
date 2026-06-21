const { isOwner } = require('../lib/utils');
const { log } = require('../lib/logger');
const config = require('../config');

const commands = {};

function ownerGuard(fn) {
  return async (sock, msg, ctx) => {
    if (!isOwner(ctx.sender)) return ctx.reply('❌ This command is for the bot owner only');
    return fn(sock, msg, ctx);
  };
}

commands['broadcast'] = ownerGuard(async (sock, msg, { reply, text }) => {
  if (!text) return reply('❌ Usage: .broadcast [message]');
  try {
    const chats = await sock.groupFetchAllParticipating();
    const jids = Object.keys(chats);
    let sent = 0;
    for (const jid of jids) {
      try {
        await sock.sendMessage(jid, { text: `📢 *BROADCAST*\n\n${text}\n\n_— ${config.botName}_` });
        sent++;
      } catch {}
      await new Promise((r) => setTimeout(r, 1000));
    }
    await reply(`✅ Broadcast sent to ${sent}/${jids.length} groups`);
  } catch (err) {
    await reply('❌ Broadcast failed: ' + err.message);
  }
});

commands['block'] = ownerGuard(async (sock, msg, { reply, mentioned, args }) => {
  const target = mentioned?.[0] || (args[0]?.replace(/\D/g, '') + '@s.whatsapp.net');
  if (!target) return reply('❌ Mention or provide a number to block');
  try {
    await sock.updateBlockStatus(target, 'block');
    await reply(`✅ Blocked: @${target.split('@')[0]}`, [target]);
  } catch (err) {
    await reply('❌ Failed to block: ' + err.message);
  }
});

commands['unblock'] = ownerGuard(async (sock, msg, { reply, mentioned, args }) => {
  const target = mentioned?.[0] || (args[0]?.replace(/\D/g, '') + '@s.whatsapp.net');
  if (!target) return reply('❌ Mention or provide a number to unblock');
  try {
    await sock.updateBlockStatus(target, 'unblock');
    await reply(`✅ Unblocked: @${target.split('@')[0]}`, [target]);
  } catch (err) {
    await reply('❌ Failed to unblock: ' + err.message);
  }
});

commands['setname'] = ownerGuard(async (sock, msg, { reply, text }) => {
  if (!text) return reply('❌ Usage: .setname [new name]');
  try {
    await sock.updateProfileName(text);
    await reply(`✅ Bot name updated to: ${text}`);
  } catch (err) {
    await reply('❌ Failed to update name: ' + err.message);
  }
});

commands['setstatus'] = ownerGuard(async (sock, msg, { reply, text }) => {
  if (!text) return reply('❌ Usage: .setstatus [new status]');
  try {
    await sock.updateProfileStatus(text);
    await reply(`✅ Status updated to: ${text}`);
  } catch (err) {
    await reply('❌ Failed to update status: ' + err.message);
  }
});

commands['shutdown'] = ownerGuard(async (sock, msg, { reply }) => {
  await reply('🛑 *Shutting down KING BLESS MD BOT...*\nGoodbye! 👋');
  setTimeout(() => process.exit(0), 2000);
});

commands['restart'] = ownerGuard(async (sock, msg, { reply }) => {
  await reply('🔄 *Restarting KING BLESS MD BOT...*');
  setTimeout(() => process.exit(1), 2000);
});

commands['eval'] = ownerGuard(async (sock, msg, { reply, text }) => {
  if (!text) return reply('❌ Usage: .eval [code]');
  try {
    let result = eval(text);
    if (result instanceof Promise) result = await result;
    await reply('✅ Result:\n```' + JSON.stringify(result, null, 2) + '```');
  } catch (err) {
    await reply('❌ Error:\n```' + err.message + '```');
  }
});

module.exports = commands;
