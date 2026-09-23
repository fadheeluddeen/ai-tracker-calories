const { analyzeWithGemini } = require('./gemini');
const { completeWithOpenRouter } = require('./openrouter');
const { PROMPT, parseFoodJson } = require('./parseFoodJson');
const { runWithFallback } = require('./aiFallback');

/**
 * Gemini -> OpenRouter -> analysis_failed placeholder. Never throws: always
 * resolves to a row-shaped result so the caller can save the meal (photo
 * included) even when both providers are down.
 */
async function analyzeFood(buffer) {
  const outcome = await runWithFallback('analyze', {
    gemini: () => analyzeWithGemini(buffer),
    openrouter: async () => parseFoodJson(await completeWithOpenRouter(PROMPT, buffer)),
  });

  if (outcome) {
    return { ...outcome.result, provider: outcome.provider, analysis_failed: false };
  }

  return {
    is_food: true,
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
