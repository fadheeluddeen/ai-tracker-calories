const { analyzeWithGemini } = require('./gemini');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Gemini (with one retry) -> analysis_failed placeholder.
 * Never throws: always resolves to a row-shaped result so the caller can
 * save the meal (photo included) even when Gemini is down.
 */
async function analyzeFood(buffer) {
  try {
    const result = await analyzeWithGemini(buffer);
    return { ...result, provider: 'gemini', analysis_failed: false };
  } catch (err) {
    console.error('[analyze] gemini attempt 1 failed:', err.message);
  }

  await sleep(1000);

  try {
    const result = await analyzeWithGemini(buffer);
    return { ...result, provider: 'gemini', analysis_failed: false };
  } catch (err) {
    console.error('[analyze] gemini retry failed:', err.message);
  }

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
