const express = require('express');
const { pool } = require('../db');
const { sendToAllSubscriptions } = require('../services/push');

const router = express.Router();

router.get('/public-key', (req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY || null });
});

router.post('/subscribe', async (req, res) => {
  const { endpoint, keys } = req.body || {};
  if (!endpoint || typeof endpoint !== 'string') {
    return res.status(400).json({ error: '"endpoint" is required' });
  }
  if (!keys || typeof keys.p256dh !== 'string' || typeof keys.auth !== 'string') {
    return res.status(400).json({ error: '"keys.p256dh" and "keys.auth" are required' });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO push_subscriptions (endpoint, p256dh_key, auth_key)
       VALUES ($1,$2,$3)
       ON CONFLICT (endpoint) DO UPDATE SET p256dh_key = EXCLUDED.p256dh_key, auth_key = EXCLUDED.auth_key
       RETURNING *`,
      [endpoint, keys.p256dh, keys.auth]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('[push] subscribe failed:', err.message);
    res.status(500).json({ error: 'failed to save subscription' });
  }
});

// Test-only: fires an immediate notification to every subscribed device,
// without waiting for a supplement's scheduled time to roll around. Proves
// the delivery pipeline end to end.
router.post('/test', async (req, res) => {
  try {
    const sent = await sendToAllSubscriptions({
      title: 'Calorie Tracker',
      body: 'Test notification — push is working.',
    });
    res.json({ sent });
  } catch (err) {
    console.error('[push] test send failed:', err.message);
    res.status(500).json({ error: 'failed to send test notification' });
  }
});

module.exports = router;
