const fs = require('fs');
const path = require('path');
const express = require('express');
const { pool } = require('../db');
const { upload } = require('../middleware/upload');
const { compressImage } = require('../services/compress');
const { saveToDisk } = require('../services/storage');
const { analyzePantryPhoto } = require('../services/analyzePantry');

const router = express.Router();

router.post('/', upload.single('photo'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'multipart field "photo" is required' });
  }

  let compressed;
  try {
    compressed = await compressImage(req.file.buffer);
  } catch (err) {
    console.error('[pantry] compression failed:', err.message);
    return res.status(500).json({ error: 'failed to process photo' });
  }

  const filename = `${Date.now()}-${Math.round(Math.random() * 1e6)}.jpg`;

  let photoDiskPath;
  try {
    photoDiskPath = await saveToDisk(compressed, filename);
  } catch (err) {
    console.error('[pantry] disk save failed:', err.message);
    return res.status(500).json({ error: 'failed to save photo' });
  }

  const ingredient = await analyzePantryPhoto(compressed);

  try {
    const { rows } = await pool.query(
      `INSERT INTO pantry_ingredients
        (name, category, quantity, calories, protein_g, carbs_g, fat_g,
         photo_disk_path, expiry_days)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [
        ingredient.name,
        ingredient.category,
        ingredient.quantity,
        ingredient.calories,
        ingredient.protein_g,
        ingredient.carbs_g,
        ingredient.fat_g,
        photoDiskPath,
        ingredient.expiry_days,
      ]
    );
    return res.status(201).json(rows[0]);
  } catch (err) {
    console.error('[pantry] db insert failed:', err.message);
    return res.status(500).json({ error: 'failed to save pantry ingredient' });
  }
});

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM pantry_ingredients ORDER BY date_added DESC');
    res.json({ ingredients: rows });
  } catch (err) {
    console.error('[pantry] list failed:', err.message);
    res.status(500).json({ error: 'failed to fetch pantry ingredients' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ error: 'id must be a number' });
  }

  let deletedRow;
  try {
    const { rows } = await pool.query('DELETE FROM pantry_ingredients WHERE id = $1 RETURNING *', [id]);
    if (!rows.length) {
      return res.status(404).json({ error: 'not found' });
    }
    deletedRow = rows[0];
  } catch (err) {
    console.error('[pantry] delete failed:', err.message);
    return res.status(500).json({ error: 'failed to delete pantry ingredient' });
  }

  if (deletedRow.photo_disk_path) {
    const fullPath = path.join(__dirname, '..', '..', deletedRow.photo_disk_path);
    fs.unlink(fullPath, (err) => {
      if (err) console.error('[pantry] photo cleanup failed (row already deleted):', err.message);
    });
  }

  res.json({ deleted: deletedRow });
});

module.exports = router;
