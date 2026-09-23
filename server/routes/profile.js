const express = require('express');
const { getProfile, upsertProfile, getLatestWeight, calculateGoals } = require('../services/profile');

const router = express.Router();

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

module.exports = router;
