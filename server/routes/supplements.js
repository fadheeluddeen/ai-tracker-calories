const express = require('express');
const { pool } = require('../db');

const router = express.Router();

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

function validateScheduleTimes(times) {
  if (times === undefined) return [];
  if (!Array.isArray(times)) return null;
  if (!times.every((t) => typeof t === 'string' && TIME_RE.test(t))) return null;
  return times;
}

router.post('/', async (req, res) => {
  const { name, dosage, schedule_times, active } = req.body || {};
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: '"name" is required' });
  }
  const times = validateScheduleTimes(schedule_times);
  if (times === null) {
    return res.status(400).json({ error: '"schedule_times" must be an array of "HH:MM" strings' });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO supplements (name, dosage, schedule_times, active)
       VALUES ($1,$2,$3,$4)
       RETURNING *`,
      [name.trim(), dosage || null, times, active === undefined ? true : !!active]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('[supplements] create failed:', err.message);
    res.status(500).json({ error: 'failed to create supplement' });
  }
});

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM supplements ORDER BY created_at DESC');
    res.json({ supplements: rows });
  } catch (err) {
    console.error('[supplements] list failed:', err.message);
    res.status(500).json({ error: 'failed to fetch supplements' });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ error: 'id must be a number' });
  }
  try {
    const { rows } = await pool.query('SELECT * FROM supplements WHERE id = $1', [id]);
    if (!rows.length) return res.status(404).json({ error: 'not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('[supplements] fetch failed:', err.message);
    res.status(500).json({ error: 'failed to fetch supplement' });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ error: 'id must be a number' });
  }

  const { name, dosage, schedule_times, active } = req.body || {};
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: '"name" is required' });
  }
  const times = validateScheduleTimes(schedule_times);
  if (times === null) {
    return res.status(400).json({ error: '"schedule_times" must be an array of "HH:MM" strings' });
  }

  try {
    const { rows } = await pool.query(
      `UPDATE supplements SET name = $1, dosage = $2, schedule_times = $3, active = $4
       WHERE id = $5
       RETURNING *`,
      [name.trim(), dosage || null, times, active === undefined ? true : !!active, id]
    );
    if (!rows.length) return res.status(404).json({ error: 'not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('[supplements] update failed:', err.message);
    res.status(500).json({ error: 'failed to update supplement' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ error: 'id must be a number' });
  }
  try {
    const { rows } = await pool.query('DELETE FROM supplements WHERE id = $1 RETURNING *', [id]);
    if (!rows.length) return res.status(404).json({ error: 'not found' });
    res.json({ deleted: rows[0] });
  } catch (err) {
    console.error('[supplements] delete failed:', err.message);
    res.status(500).json({ error: 'failed to delete supplement' });
  }
});

module.exports = router;
