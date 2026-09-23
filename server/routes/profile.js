const fs = require('fs');
const path = require('path');
const express = require('express');
const { upload } = require('../middleware/upload');
const { compressBackgroundImage } = require('../services/compress');
const { saveToDisk } = require('../services/storage');
const {
  getProfile,
  upsertProfile,
  setBackgroundImage,
  setCustomCalorieGoal,
  getLatestWeight,
  calculateGoals,
} = require('../services/profile');

const router = express.Router();

function deleteOldPhoto(relativePath) {
  if (!relativePath) return;
  const fullPath = path.join(__dirname, '..', '..', relativePath);
  fs.unlink(fullPath, (err) => {
    if (err) console.error('[profile] old background cleanup failed:', err.message);
  });
}

const VALID_SEX = ['male', 'female'];
const VALID_ACTIVITY = ['sedentary', 'light', 'moderate', 'active', 'very_active'];
const VALID_GOAL = ['lose', 'maintain', 'gain'];

router.get('/', async (req, res) => {
  try {
    const profile = await getProfile();
    const latestWeight = await getLatestWeight();
    const goals =
      profile && latestWeight ? calculateGoals(profile, Number(latestWeight.weight_kg)) : null;

    res.json({ profile, latest_weight: latestWeight, goals });
  } catch (err) {
    console.error('[profile] fetch failed:', err.message);
    res.status(500).json({ error: 'failed to fetch profile' });
  }
});

router.put('/', async (req, res) => {
  const { sex, age, height_cm, activity_level, goal } = req.body;

  if (!VALID_SEX.includes(sex)) {
    return res.status(400).json({ error: `sex must be one of: ${VALID_SEX.join(', ')}` });
  }
  if (!Number.isFinite(age) || age <= 0) {
    return res.status(400).json({ error: 'age must be a positive number' });
  }
  if (!Number.isFinite(height_cm) || height_cm <= 0) {
    return res.status(400).json({ error: 'height_cm must be a positive number' });
  }
  if (!VALID_ACTIVITY.includes(activity_level)) {
    return res.status(400).json({ error: `activity_level must be one of: ${VALID_ACTIVITY.join(', ')}` });
  }
  if (!VALID_GOAL.includes(goal)) {
    return res.status(400).json({ error: `goal must be one of: ${VALID_GOAL.join(', ')}` });
  }

  try {
    const profile = await upsertProfile({ sex, age, height_cm, activity_level, goal });
    res.json(profile);
  } catch (err) {
    console.error('[profile] update failed:', err.message);
    res.status(500).json({ error: 'failed to update profile' });
  }
});

// Fixed daily calorie goal that overrides the calculated one. Send
// { calorie_goal: null } to go back to the calculated goal.
router.put('/calorie-goal', async (req, res) => {
  const { calorie_goal } = req.body;
  if (calorie_goal !== null && (!Number.isInteger(calorie_goal) || calorie_goal < 800 || calorie_goal > 6000)) {
    return res.status(400).json({ error: 'calorie_goal must be a whole number between 800 and 6000, or null' });
  }

  try {
    const profile = await setCustomCalorieGoal(calorie_goal);
    if (!profile) {
      return res.status(400).json({ error: 'Set up your profile before choosing a calorie goal.' });
    }
    res.json(profile);
  } catch (err) {
    console.error('[profile] calorie goal update failed:', err.message);
    res.status(500).json({ error: 'failed to update calorie goal' });
  }
});

// Custom app background — a user photo behind the glass panels instead of
// the default gradient/orbs. Requires a profile row to already exist.
router.post('/background', upload.single('photo'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'multipart field "photo" is required' });
  }

  const existing = await getProfile();
  if (!existing) {
    return res.status(400).json({ error: 'Set up your profile before choosing a background image.' });
  }

  let compressed;
  try {
    compressed = await compressBackgroundImage(req.file.buffer);
  } catch (err) {
    console.error('[profile] background compression failed:', err.message);
    return res.status(500).json({ error: 'failed to process photo' });
  }

  const filename = `bg-${Date.now()}-${Math.round(Math.random() * 1e6)}.jpg`;
  let photoDiskPath;
  try {
    photoDiskPath = await saveToDisk(compressed, filename);
  } catch (err) {
    console.error('[profile] background save failed:', err.message);
    return res.status(500).json({ error: 'failed to save photo' });
  }

  try {
    const profile = await setBackgroundImage(photoDiskPath);
    deleteOldPhoto(existing.background_image_path);
    res.status(201).json(profile);
  } catch (err) {
    console.error('[profile] background update failed:', err.message);
    res.status(500).json({ error: 'failed to save background' });
  }
});

router.delete('/background', async (req, res) => {
  const existing = await getProfile();
  if (!existing) {
    return res.status(400).json({ error: 'no profile exists yet' });
  }

  try {
    const profile = await setBackgroundImage(null);
    deleteOldPhoto(existing.background_image_path);
    res.json(profile);
  } catch (err) {
    console.error('[profile] background reset failed:', err.message);
    res.status(500).json({ error: 'failed to reset background' });
  }
});

module.exports = router;
