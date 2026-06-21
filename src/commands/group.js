const { log } = require('../lib/logger');
const { isOwner } = require('../lib/utils');
const config = require('../config');

const commands = {};

async function isAdmin(sock, jid, sender) {
  try {
    const meta = await sock.groupMetadata(jid);
    const admins = meta.participants.filter((p) => p.admin).map((p) => p.id);
    return admins.includes(sender);
  } catch {
    return false;
  }
}

async function isBotAdmin(sock, jid) {
  try {
    const meta = await sock.groupMetadata(jid);
    const botId = sock.user.id.replace(/:.*@/, '@');
    const admins = meta.participants.filter((p) => p.admin).map((p) => p.id.replace(/:.*@/, '@'));
    return admins.includes(botId);
  } catch {
    return false;
  }
}

commands['groupinfo'] = async (sock, msg, { reply, jid, isGroup }) => {
  if (!isGroup) return reply('❌ This command is for groups only');
  try {
    const meta = await sock.groupMetadata(jid);
    const admins = meta.participants.filter((p) => p.admin).map((p) => `@${p.id.split('@')[0]}`);
    const info = `
👥 *GROUP INFORMATION*

📛 *Name:* ${meta.subject}
🆔 *ID:* ${jid}
👤 *Members:* ${meta.participants.length}
👑 *Admins:* ${admins.join(', ') || 'None'}
📝 *Description:*\n${meta.desc || 'No description'}
📅 *Created:* ${new Date(meta.creation * 1000).toLocaleDateString()}`;
    await reply(info.trim());
  } catch (err) {
    await reply('❌ Could not fetch group info: ' + err.message);
  }
};

commands['tagall'] = commands['everyone'] = async (sock, msg, { reply, jid, isGroup, text }) => {
  if (!isGroup) return reply('❌ Groups only');
  try {
    const meta = await sock.groupMetadata(jid);
    const mentions = meta.participants.map((p) => p.id);
    const tags = mentions.map((id) => `@${id.split('@')[0]}`).join('\n');
    const announcement = text ? `📢 *${text}*\n\n${tags}` : `📢 *Tagging Everyone*\n\n${tags}`;
    await sock.sendMessage(jid, { text: announcement, mentions }, { quoted: msg });
  } catch (err) {
    await reply('❌ Failed to tag: ' + err.message);
  }
};

commands['kick'] = async (sock, msg, { reply, jid, isGroup, sender, mentioned }) => {
  if (!isGroup) return reply('❌ Groups only');
  const botAdmin = await isBotAdmin(sock, jid);
  if (!botAdmin) return reply('❌ Bot must be admin to kick members');
  const senderAdmin = await isAdmin(sock, jid, sender);
  if (!senderAdmin && !isOwner(sender)) return reply('❌ Only admins can use this command');
  if (!mentioned || mentioned.length === 0) return reply('❌ Mention the user to kick: .kick @user');
  try {
    await sock.groupParticipantsUpdate(jid, mentioned, 'remove');
    await reply(`✅ Successfully kicked ${mentioned.length} member(s)`);
  } catch (err) {
    await reply('❌ Failed to kick: ' + err.message);
  }
};

commands['add'] = async (sock, msg, { reply, jid, isGroup, sender, args }) => {
  if (!isGroup) return reply('❌ Groups only');
  const botAdmin = await isBotAdmin(sock, jid);
  if (!botAdmin) return reply('❌ Bot must be admin to add members');
  const senderAdmin = await isAdmin(sock, jid, sender);
  if (!senderAdmin && !isOwner(sender)) return reply('❌ Only admins can use this command');
  if (!args[0]) return reply('❌ Usage: .add [number]\nExample: .add 2348012345678');
  const number = args[0].replace(/\D/g, '') + '@s.whatsapp.net';
  try {
    await sock.groupParticipantsUpdate(jid, [number], 'add');
    await reply(`✅ Added ${args[0]} to the group`);
  } catch (err) {
    await reply('❌ Failed to add member: ' + err.message);
  }
};

commands['promote'] = async (sock, msg, { reply, jid, isGroup, sender, mentioned }) => {
  if (!isGroup) return reply('❌ Groups only');
  const botAdmin = await isBotAdmin(sock, jid);
  if (!botAdmin) return reply('❌ Bot must be admin');
  const senderAdmin = await isAdmin(sock, jid, sender);
  if (!senderAdmin && !isOwner(sender)) return reply('❌ Only admins can use this command');
  if (!mentioned || mentioned.length === 0) return reply('❌ Mention the user to promote');
  try {
    await sock.groupParticipantsUpdate(jid, mentioned, 'promote');
    await reply(`✅ Promoted ${mentioned.length} member(s) to admin`);
  } catch (err) {
    await reply('❌ Failed to promote: ' + err.message);
  }
};

commands['demote'] = async (sock, msg, { reply, jid, isGroup, sender, mentioned }) => {
  if (!isGroup) return reply('❌ Groups only');
  const botAdmin = await isBotAdmin(sock, jid);
  if (!botAdmin) return reply('❌ Bot must be admin');
  const senderAdmin = await isAdmin(sock, jid, sender);
  if (!senderAdmin && !isOwner(sender)) return reply('❌ Only admins can use this command');
  if (!mentioned || mentioned.length === 0) return reply('❌ Mention the user to demote');
  try {
    await sock.groupParticipantsUpdate(jid, mentioned, 'demote');
    await reply(`✅ Demoted ${mentioned.length} member(s) from admin`);
  } catch (err) {
    await reply('❌ Failed to demote: ' + err.message);
  }
};

commands['mute'] = async (sock, msg, { reply, jid, isGroup, sender }) => {
  if (!isGroup) return reply('❌ Groups only');
  const botAdmin = await isBotAdmin(sock, jid);
  if (!botAdmin) return reply('❌ Bot must be admin');
  const senderAdmin = await isAdmin(sock, jid, sender);
  if (!senderAdmin && !isOwner(sender)) return reply('❌ Only admins can use this command');
  try {
    await sock.groupSettingUpdate(jid, 'announcement');
    await reply('🔇 Group has been *muted*. Only admins can send messages.');
  } catch (err) {
    await reply('❌ Failed to mute group: ' + err.message);
  }
};

commands['unmute'] = async (sock, msg, { reply, jid, isGroup, sender }) => {
  if (!isGroup) return reply('❌ Groups only');
  const botAdmin = await isBotAdmin(sock, jid);
  if (!botAdmin) return reply('❌ Bot must be admin');
  const senderAdmin = await isAdmin(sock, jid, sender);
  if (!senderAdmin && !isOwner(sender)) return reply('❌ Only admins can use this command');
  try {
    await sock.groupSettingUpdate(jid, 'not_announcement');
    await reply('🔊 Group has been *unmuted*. Everyone can send messages.');
  } catch (err) {
    await reply('❌ Failed to unmute group: ' + err.message);
  }
};

commands['link'] = async (sock, msg, { reply, jid, isGroup, sender }) => {
  if (!isGroup) return reply('❌ Groups only');
  const senderAdmin = await isAdmin(sock, jid, sender);
  if (!senderAdmin && !isOwner(sender)) return reply('❌ Only admins can get the invite link');
  try {
    const link = await sock.groupInviteCode(jid);
    await reply(`🔗 *Group Invite Link*\nhttps://chat.whatsapp.com/${link}`);
  } catch (err) {
    await reply('❌ Failed to get invite link: ' + err.message);
  }
};

commands['revoke'] = async (sock, msg, { reply, jid, isGroup, sender }) => {
  if (!isGroup) return reply('❌ Groups only');
  const senderAdmin = await isAdmin(sock, jid, sender);
  if (!senderAdmin && !isOwner(sender)) return reply('❌ Only admins can revoke invite links');
  try {
    await sock.groupRevokeInvite(jid);
    await reply('✅ Invite link has been revoked. Generate a new one with .link');
  } catch (err) {
    await reply('❌ Failed to revoke invite link: ' + err.message);
  }
};

module.exports = commands;
