const { analyzeWithGemini } = require('./gemini');
const { recordGeminiError, clearGeminiError } = require('./settings');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Gemini (with one retry) -> analysis_failed placeholder.
 * Never throws: always resolves to a row-shaped result so the caller can
 * save the meal (photo included) even when Gemini is down. Clears the
 * settings-table error flag on any success, records it on total failure —
 * that's what the Settings screen shows.
 */
async function analyzeFood(buffer) {
  let lastErr;

  try {
    const result = await analyzeWithGemini(buffer);
    await clearGeminiError();
    return { ...result, provider: 'gemini', analysis_failed: false };
  } catch (err) {
    lastErr = err;
    console.error('[analyze] gemini attempt 1 failed:', err.message);
  }

  await sleep(1000);

  try {
    const result = await analyzeWithGemini(buffer);
    await clearGeminiError();
    return { ...result, provider: 'gemini', analysis_failed: false };
  } catch (err) {
    lastErr = err;
    console.error('[analyze] gemini retry failed:', err.message);
  }

  await recordGeminiError(lastErr);

  return {
    food_name: null,
    calories: null,
    protein_g: null,
    carbs_g: null,
    fat_g: null,
    confidence: null,
    provider: null,
    analysis_failed: true,
  };
}

module.exports = { analyzeFood };
