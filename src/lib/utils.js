const { parsePhoneNumber } = require('libphonenumber-js');
const moment = require('moment-timezone');
const now = require('performance-now');
const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');
const config = require('../config');

/**
 * Format a phone number to international format
 */
function formatPhone(number) {
  try {
    const parsed = parsePhoneNumber('+' + number.replace(/\D/g, ''));
    return parsed ? parsed.formatInternational() : number;
  } catch {
    return number;
  }
}

/**
 * Get current time in Africa/Lagos timezone
 */
function getTime(timezone = 'Africa/Lagos') {
  return moment().tz(timezone).format('HH:mm:ss');
}

/**
 * Get current date in Africa/Lagos timezone
 */
function getDate(timezone = 'Africa/Lagos') {
  return moment().tz(timezone).format('dddd, MMMM Do YYYY');
}

/**
 * Get greeting based on time of day
 */
function getGreeting(timezone = 'Africa/Lagos') {
  const hour = parseInt(moment().tz(timezone).format('H'));
  if (hour >= 5 && hour < 12) return '🌅 Good Morning';
  if (hour >= 12 && hour < 17) return '☀️ Good Afternoon';
  if (hour >= 17 && hour < 21) return '🌆 Good Evening';
  return '🌙 Good Night';
}

/**
 * Convert bytes to human readable format
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Measure execution time in ms
 */
function measureTime(start) {
  return ((now() - start) / 1000).toFixed(2) + 's';
}

/**
 * Sleep for ms milliseconds
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Ensure directory exists
 */
function ensureDir(dir) {
  fse.ensureDirSync(dir);
}

/**
 * Generate a random string of length n
 */
function randomString(n = 8) {
  return Math.random().toString(36).substring(2, 2 + n).toUpperCase();
}

/**
 * Strip command prefix and return { cmd, args, text }
 */
function parseCommand(body, prefix) {
  const withoutPrefix = body.startsWith(prefix) ? body.slice(prefix.length) : body;
  const parts = withoutPrefix.trim().split(/\s+/);
  const cmd = parts[0].toLowerCase();
  const args = parts.slice(1);
  const text = args.join(' ');
  return { cmd, args, text };
}

/**
 * Check if sender is owner
 */
function isOwner(sender) {
  const clean = sender.replace(/[^0-9]/g, '');
  return clean === config.ownerNumber.replace(/[^0-9]/g, '');
}

/**
 * Convert seconds to readable duration
 */
function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return [h > 0 ? h + 'h' : '', m > 0 ? m + 'm' : '', s + 's'].filter(Boolean).join(' ');
}

/**
 * Truncate text to maxLength
 */
function truncate(text, maxLength = 200) {
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

/**
 * Clean tmp file after delay
 */
async function cleanFile(filePath, delay = 30000) {
  await sleep(delay);
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch {}
}

module.exports = {
  formatPhone,
  getTime,
  getDate,
  getGreeting,
  formatBytes,
  measureTime,
  sleep,
  ensureDir,
  randomString,
  parseCommand,
  isOwner,
  formatDuration,
  truncate,
  cleanFile,
};
