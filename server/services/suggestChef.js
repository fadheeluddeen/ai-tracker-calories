const { suggestDishesWithGemini } = require('./geminiChef');
const { recordGeminiError, clearGeminiError } = require('./settings');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Gemini (with one retry) -> empty dishes list. Never throws: always
 * resolves to a usable result so the route can respond even when Gemini
 * is down. Same retry/error-tracking shape as analyzePantry.js.
 */
async function suggestChef(ingredients) {
  let lastErr;

  try {
    const result = await suggestDishesWithGemini(ingredients);
    await clearGeminiError();
    return result;
  } catch (err) {
    lastErr = err;
    console.error('[suggestChef] gemini attempt 1 failed:', err.message);
  }

  await sleep(1000);

  try {
    const result = await suggestDishesWithGemini(ingredients);
    await clearGeminiError();
    return result;
  } catch (err) {
    lastErr = err;
    console.error('[suggestChef] gemini retry failed:', err.message);
  }

  await recordGeminiError(lastErr);

  return { dishes: [] };
}

module.exports = { suggestChef };
