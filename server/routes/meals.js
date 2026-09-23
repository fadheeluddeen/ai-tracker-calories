const express = require('express');
const { pool } = require('../db');
const { upload } = require('../middleware/upload');
const { compressImage } = require('../services/compress');
const { saveToDisk } = require('../services/storage');
const { uploadToDrive } = require('../services/drive');
const { analyzeFood } = require('../services/analyze');

const router = express.Router();

// Log a meal without a photo — e.g. logging a chef suggestion or a pantry
// ingredient the user already has known nutrition for. No analysis, no
// disk/Drive write; photo_disk_path/photo_drive_id stay null.
router.post('/manual', async (req, res) => {
  const { food_name, calories, protein_g, carbs_g, fat_g } = req.body || {};

  if (!food_name || typeof food_name !== 'string') {
    return res.status(400).json({ error: 'food_name is required' });
  }

  const toInt = (v) => {
    const n = Math.round(Number(v));
    return Number.isFinite(n) ? n : 0;
  };

  try {
    const { rows } = await pool.query(
      `INSERT INTO meals
        (food_name, calories, protein_g, carbs_g, fat_g, confidence, provider,
         photo_disk_path, photo_drive_id, analysis_failed)
       VALUES ($1,$2,$3,$4,$5,NULL,'manual',NULL,NULL,false)
       RETURNING *`,
      [food_name.trim(), toInt(calories), toInt(protein_g), toInt(carbs_g), toInt(fat_g)]
    );
    return res.status(201).json(rows[0]);
  } catch (err) {
    console.error('[meals] manual insert failed:', err.message);
    return res.status(500).json({ error: 'failed to log meal' });
  }
});

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

  const analysis = await analyzeFood(compressed);

  // Confirmed non-food (e.g. a plant, a person) — don't save the photo or
  // create a meal row at all, so the diary doesn't get a 0-calorie entry.
  // Genuine analysis failures still fall through and get logged below,
  // flagged with analysis_failed, so the photo isn't silently lost.
  if (analysis.is_food === false) {
    return res.status(200).json({
      not_food: true,
      food_name: analysis.food_name,
      message: `That doesn't look like food${
        analysis.food_name ? ` — looks like ${analysis.food_name.toLowerCase()}` : ''
      }. Try retaking the photo.`,
    });
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
