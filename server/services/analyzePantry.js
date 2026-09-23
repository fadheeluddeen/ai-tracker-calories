const { analyzeIngredientWithGemini } = require('./geminiPantry');
const { completeWithOpenRouter } = require('./openrouter');
const { PROMPT, parsePantryJson } = require('./parsePantryJson');
const { runWithFallback } = require('./aiFallback');

/**
 * Gemini -> OpenRouter -> null-field placeholder. Never throws: always
 * resolves to a row-shaped result so the caller can save the pantry item
 * (photo included) even when both providers are down. pantry_ingredients
 * has no analysis_failed column, so a null `name` is the failure signal.
 */
async function analyzePantryPhoto(buffer) {
  const outcome = await runWithFallback('analyzePantry', {
    gemini: () => analyzeIngredientWithGemini(buffer),
    openrouter: async () => parsePantryJson(await completeWithOpenRouter(PROMPT, buffer)),
  });

  if (outcome) return outcome.result;

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
