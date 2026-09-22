const express = require('express');
const { pool } = require('../db');
const { suggestChef } = require('../services/suggestChef');

const router = express.Router();

router.get('/suggest', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT name, category, quantity FROM pantry_ingredients WHERE name IS NOT NULL ORDER BY date_added DESC`
    );
    const result = await suggestChef(rows);
    res.json(result);
  } catch (err) {
    console.error('[chef] suggest failed:', err.message);
    res.status(500).json({ error: 'failed to suggest dishes' });
  }
});

module.exports = router;
