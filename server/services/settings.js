const { pool } = require('../db');

// In-memory cache, single Node process (pm2 fork mode). Invalidated only by
// explicit writes through setSetting — no TTL, no polling needed.
const cache = new Map();

async function getSetting(key) {
  if (cache.has(key)) return cache.get(key);
  const { rows } = await pool.query('SELECT value FROM settings WHERE key = $1', [key]);
  const value = rows[0] ? rows[0].value : null;
  cache.set(key, value);
  return value;
}

async function setSetting(key, value) {
  await pool.query(
    `INSERT INTO settings (key, value, updated_at) VALUES ($1, $2, now())
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
    [key, value]
  );
  cache.set(key, value);
}

/**
 * First-boot only: copies .env's GEMINI_API_KEY into the settings table if
 * no row exists yet. After this, .env is just the initial default — the
 * settings table (editable live via POST /api/settings/gemini-key) is the
 * source of truth.
 */
async function ensureSeeded() {
  await pool.query(
    `INSERT INTO settings (key, value) VALUES ('gemini_api_key', $1)
     ON CONFLICT (key) DO NOTHING`,
    [process.env.GEMINI_API_KEY || '']
  );
}

async function getGeminiKey() {
  return getSetting('gemini_api_key');
}

async function setGeminiKey(key) {
  await setSetting('gemini_api_key', key);
}

function classifyGeminiError(err) {
  const msg = (err && err.message) || String(err);
  if (/api key not valid|401|api_key_invalid/i.test(msg)) return 'invalid_key';
  if (/429|quota|rate limit/i.test(msg)) return 'rate_limit';
  if (/503|overloaded|high demand|unavailable/i.test(msg)) return 'unavailable';
  if (/econnrefused|enotfound|eai_again|fetch failed|network/i.test(msg)) return 'network';
  return 'unknown';
}

async function recordGeminiError(err) {
  const info = {
    type: classifyGeminiError(err),
    message: (err && err.message) || String(err),
    at: new Date().toISOString(),
  };
  await setSetting('last_gemini_error', JSON.stringify(info));
}

async function clearGeminiError() {
  await setSetting('last_gemini_error', null);
}

async function getLastGeminiError() {
  const raw = await getSetting('last_gemini_error');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

module.exports = {
  getSetting,
  setSetting,
  ensureSeeded,
  getGeminiKey,
  setGeminiKey,
  recordGeminiError,
  clearGeminiError,
  getLastGeminiError,
  classifyGeminiError,
};
