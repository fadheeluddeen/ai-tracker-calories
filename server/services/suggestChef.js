const { suggestDishesWithGemini } = require('./geminiChef');
const { completeWithOpenRouter } = require('./openrouter');
const { buildPrompt, parseChefJson } = require('./parseChefJson');
const { runWithFallback } = require('./aiFallback');

/**
 * Gemini -> OpenRouter -> empty dishes list. Never throws: always resolves
 * to a usable result so the route can respond even when both are down.
 */
async function suggestChef(ingredients) {
  const outcome = await runWithFallback('suggestChef', {
    gemini: () => suggestDishesWithGemini(ingredients),
    openrouter: async () => parseChefJson(await completeWithOpenRouter(buildPrompt(ingredients))),
  });

  return outcome ? outcome.result : { dishes: [] };
}

module.exports = { suggestChef };
