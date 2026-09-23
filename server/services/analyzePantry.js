const { analyzeIngredientWithGemini } = require('./geminiPantry');
const { recordGeminiError, clearGeminiError } = require('./settings');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Gemini (with one retry) -> null-field placeholder. Never throws: always
 * resolves to a row-shaped result so the caller can save the pantry item
 * (photo included) even when Gemini is down. Same shape as analyze.js for
 * meals — pantry_ingredients has no analysis_failed column, so a null
 * `name` is the signal that identification failed. Same settings-table
 * error tracking as analyze.js.
 */
async function analyzePantryPhoto(buffer) {
  let lastErr;

  try {
    const result = await analyzeIngredientWithGemini(buffer);
    await clearGeminiError();
    return result;
  } catch (err) {
    lastErr = err;
    console.error('[analyzePantry] gemini attempt 1 failed:', err.message);
  }

  await sleep(1000);

  try {
    const result = await analyzeIngredientWithGemini(buffer);
    await clearGeminiError();
    return result;
  } catch (err) {
    lastErr = err;
    console.error('[analyzePantry] gemini retry failed:', err.message);
  }

  await recordGeminiError(lastErr);

  return {
    name: null,
    category: null,
    quantity: null,
    calories: null,
    protein_g: null,
    carbs_g: null,
    fat_g: null,
    expiry_days: null,
  };
}

module.exports = { analyzePantryPhoto };
