const express = require('express');
const { getGeminiKey, setGeminiKey, getLastGeminiError, clearGeminiError } = require('../services/settings');

const router = express.Router();

function maskKey(key) {
  if (!key) return null;
  return '••••••••' + key.slice(-4);
}

// Shared-PIN gate for these two endpoints only — not a full auth system.
// Fails closed if SETTINGS_PIN was never configured.
function requirePin(req, res, next) {
  const configuredPin = process.env.SETTINGS_PIN;
  if (!configuredPin) {
    return res.status(503).json({ error: 'SETTINGS_PIN is not configured on the server' });
  }
  if (req.header('x-settings-pin') !== configuredPin) {
    return res.status(401).json({ error: 'invalid or missing PIN' });
  }
  next();
}

router.use(requirePin);

router.get('/', async (req, res) => {
  try {
    const key = await getGeminiKey();
    const lastError = await getLastGeminiError();
    res.json({ gemini_key_masked: maskKey(key), last_error: lastError });
  } catch (err) {
    console.error('[settings] fetch failed:', err.message);
    res.status(500).json({ error: 'failed to fetch settings' });
  }
});

router.post('/gemini-key', async (req, res) => {
  const { key } = req.body || {};
  if (!key || typeof key !== 'string' || !key.trim()) {
    return res.status(400).json({ error: '"key" is required' });
  }

  try {
    const trimmed = key.trim();
    await setGeminiKey(trimmed);
    await clearGeminiError();
    res.json({ gemini_key_masked: maskKey(trimmed), last_error: null });
  } catch (err) {
    console.error('[settings] update failed:', err.message);
    res.status(500).json({ error: 'failed to update settings' });
  }
});

module.exports = router;
