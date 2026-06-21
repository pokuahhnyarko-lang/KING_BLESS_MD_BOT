const NodeCache = require('node-cache');

// General purpose cache: TTL 10 minutes
const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

// Anti-spam cache: TTL 5 seconds per user-command
const spamCache = new NodeCache({ stdTTL: 5, checkperiod: 1 });

// Session cache for ongoing interactions
const sessionCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

/**
 * Check and set anti-spam guard
 * Returns true if user is spamming (should be blocked)
 */
function isSpamming(sender, cmd, limitMs = 3000) {
  const key = `${sender}:${cmd}`;
  if (spamCache.has(key)) return true;
  spamCache.set(key, true, limitMs / 1000);
  return false;
}

/**
 * Store a value in cache
 */
function set(key, value, ttl) {
  return cache.set(key, value, ttl);
}

/**
 * Get a value from cache
 */
function get(key) {
  return cache.get(key);
}

/**
 * Delete from cache
 */
function del(key) {
  return cache.del(key);
}

/**
 * Store session data
 */
function setSession(jid, key, value) {
  sessionCache.set(`${jid}:${key}`, value);
}

/**
 * Get session data
 */
function getSession(jid, key) {
  return sessionCache.get(`${jid}:${key}`);
}

/**
 * Clear session data
 */
function clearSession(jid) {
  const keys = sessionCache.keys().filter((k) => k.startsWith(jid));
  keys.forEach((k) => sessionCache.del(k));
}

module.exports = { cache, spamCache, sessionCache, isSpamming, set, get, del, setSession, getSession, clearSession };
