const { pool } = require('../db');

const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const GOAL_ADJUSTMENTS = {
  lose: -500,
  maintain: 0,
  gain: 400,
};

// Single-row table: always the most recently created/updated one.
async function getProfile() {
  const { rows } = await pool.query('SELECT * FROM profile ORDER BY id DESC LIMIT 1');
  return rows[0] || null;
}

async function upsertProfile({ sex, age, height_cm, activity_level, goal }) {
  const existing = await getProfile();

  if (existing) {
    const { rows } = await pool.query(
      `UPDATE profile
       SET sex = $1, age = $2, height_cm = $3, activity_level = $4, goal = $5, updated_at = now()
       WHERE id = $6
       RETURNING *`,
      [sex, age, height_cm, activity_level, goal, existing.id]
    );
    return rows[0];
  }

  const { rows } = await pool.query(
    `INSERT INTO profile (sex, age, height_cm, activity_level, goal)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [sex, age, height_cm, activity_level, goal]
  );
  return rows[0];
}

async function getLatestWeight() {
  const { rows } = await pool.query('SELECT * FROM weight_logs ORDER BY logged_at DESC LIMIT 1');
  return rows[0] || null;
}

async function logWeight(weightKg) {
  const { rows } = await pool.query(
    'INSERT INTO weight_logs (weight_kg) VALUES ($1) RETURNING *',
    [weightKg]
  );
  return rows[0];
}

/**
 * Mifflin-St Jeor BMR -> TDEE -> calorie goal -> macro goals. Always derived
 * live from the current profile + latest weight entry, never stored — a new
 * weigh-in or profile edit changes the answer on the very next read.
 * Protein is a fixed body-composition target (1.8g/kg bodyweight), fat is
 * 25% of the calorie goal, and carbs absorb whatever calories are left.
 */
function calculateGoals(profile, weightKg) {
  const heightCm = Number(profile.height_cm);
  const base = 10 * weightKg + 6.25 * heightCm - 5 * profile.age;
  const bmr = profile.sex === 'male' ? base + 5 : base - 161;

  const tdee = bmr * ACTIVITY_MULTIPLIERS[profile.activity_level];
  const calorieGoal = tdee + GOAL_ADJUSTMENTS[profile.goal];

  const proteinG = 1.8 * weightKg;
  const fatG = (calorieGoal * 0.25) / 9;
  const carbsG = Math.max(0, (calorieGoal - proteinG * 4 - fatG * 9) / 4);

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    calorie_goal: Math.round(calorieGoal),
    protein_g: Math.round(proteinG),
    fat_g: Math.round(fatG),
    carbs_g: Math.round(carbsG),
  };
}

module.exports = {
  ACTIVITY_MULTIPLIERS,
  GOAL_ADJUSTMENTS,
  getProfile,
  upsertProfile,
  getLatestWeight,
  logWeight,
  calculateGoals,
};
