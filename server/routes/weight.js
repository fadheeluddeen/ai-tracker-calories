const express = require('express');
const { logWeight } = require('../services/profile');

const router = express.Router();

router.post('/', async (req, res) => {
  const { weight_kg } = req.body;

  if (!Number.isFinite(weight_kg) || weight_kg <= 0) {
    return res.status(400).json({ error: 'weight_kg must be a positive number' });
  }

  try {
    const entry = await logWeight(weight_kg);
    res.status(201).json(entry);
  } catch (err) {
    console.error('[weight] insert failed:', err.message);
    res.status(500).json({ error: 'failed to log weight' });
  }
});

module.exports = router;
