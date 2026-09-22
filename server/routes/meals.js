const express = require('express');
const { pool } = require('../db');
const { upload } = require('../middleware/upload');
const { compressImage } = require('../services/compress');
const { saveToDisk } = require('../services/storage');
const { uploadToDrive } = require('../services/drive');
const { analyzeFood } = require('../services/analyze');

const router = express.Router();

router.post('/', upload.single('photo'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'multipart field "photo" is required' });
  }

  let compressed;
  try {
    compressed = await compressImage(req.file.buffer);
  } catch (err) {
    console.error('[meals] compression failed:', err.message);
    return res.status(500).json({ error: 'failed to process photo' });
  }

  const filename = `${Date.now()}-${Math.round(Math.random() * 1e6)}.jpg`;

  let photoDiskPath;
  try {
    photoDiskPath = await saveToDisk(compressed, filename);
  } catch (err) {
    console.error('[meals] disk save failed:', err.message);
    return res.status(500).json({ error: 'failed to save photo' });
  }

  // Best-effort backup — never fails the request.
  const photoDriveId = await uploadToDrive(compressed, filename);

  const analysis = await analyzeFood(compressed);

  try {
    const { rows } = await pool.query(
      `INSERT INTO meals
        (food_name, calories, protein_g, carbs_g, fat_g, confidence, provider,
         photo_disk_path, photo_drive_id, analysis_failed)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [
        analysis.food_name,
        analysis.calories,
        analysis.protein_g,
        analysis.carbs_g,
        analysis.fat_g,
        analysis.confidence,
        analysis.provider,
        photoDiskPath,
        photoDriveId,
        analysis.analysis_failed,
      ]
    );
    return res.status(201).json(rows[0]);
  } catch (err) {
    console.error('[meals] db insert failed:', err.message);
    return res.status(500).json({ error: 'failed to save meal' });
  }
});

function dayRange(dateStr) {
  // dateStr is YYYY-MM-DD, interpreted in the server's local timezone.
  const start = dateStr ? new Date(`${dateStr}T00:00:00`) : new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

async function fetchDay(dateStr) {
  const { start, end } = dayRange(dateStr);

  const { rows: meals } = await pool.query(
    `SELECT * FROM meals WHERE created_at >= $1 AND created_at < $2 ORDER BY created_at DESC`,
    [start, end]
  );

  const { rows: totalsRows } = await pool.query(
    `SELECT
       COALESCE(SUM(calories), 0)::int AS calories,
       COALESCE(SUM(protein_g), 0)::int AS protein_g,
       COALESCE(SUM(carbs_g), 0)::int AS carbs_g,
       COALESCE(SUM(fat_g), 0)::int AS fat_g
     FROM meals
     WHERE created_at >= $1 AND created_at < $2 AND analysis_failed = false`,
    [start, end]
  );

  return { date: start.toISOString().slice(0, 10), totals: totalsRows[0], meals };
}

router.get('/today', async (req, res) => {
  try {
    res.json(await fetchDay(null));
  } catch (err) {
    console.error('[meals] fetch today failed:', err.message);
    res.status(500).json({ error: 'failed to fetch meals' });
  }
});

// Per-day totals for the trailing `days` days (default 14, including today),
// oldest first. Missing days (nothing logged) come back as zeroed totals so
// the frontend doesn't have to special-case gaps.
router.get('/history', async (req, res) => {
  const days = Math.min(90, Math.max(1, parseInt(req.query.days, 10) || 14));

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(today);
  start.setDate(start.getDate() - (days - 1));

  try {
    const { rows } = await pool.query(
      `SELECT
         to_char(created_at, 'YYYY-MM-DD') AS date,
         COALESCE(SUM(calories), 0)::int AS calories,
         COALESCE(SUM(protein_g), 0)::int AS protein_g,
         COALESCE(SUM(carbs_g), 0)::int AS carbs_g,
         COALESCE(SUM(fat_g), 0)::int AS fat_g
       FROM meals
       WHERE created_at >= $1 AND analysis_failed = false
       GROUP BY to_char(created_at, 'YYYY-MM-DD')`,
      [start]
    );
    const byDate = new Map(rows.map((r) => [r.date, r]));

    const history = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const date = d.toISOString().slice(0, 10);
      history.push(
        byDate.get(date) || { date, calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
      );
    }

    res.json({ history });
  } catch (err) {
    console.error('[meals] fetch history failed:', err.message);
    res.status(500).json({ error: 'failed to fetch meal history' });
  }
});

router.get('/', async (req, res) => {
  const { date } = req.query;
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: 'query param "date" must be YYYY-MM-DD' });
  }
  try {
    res.json(await fetchDay(date));
  } catch (err) {
    console.error('[meals] fetch by date failed:', err.message);
    res.status(500).json({ error: 'failed to fetch meals' });
  }
});

module.exports = router;
