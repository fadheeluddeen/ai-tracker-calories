const { GoogleGenerativeAI } = require('@google/generative-ai');
const { buildPrompt, parseChefJson } = require('./parseChefJson');
const { getGeminiKey } = require('./settings');

/**
 * Suggests up to 3 dishes from the user's current pantry with Gemini.
 * Text-only (no image) — same model/client setup as gemini.js and
 * geminiPantry.js. Throws on any failure; the caller (suggestChef.js)
 * owns the retry policy.
 */
async function suggestDishesWithGemini(ingredients) {
  const apiKey = await getGeminiKey();
  if (!apiKey) throw new Error('no Gemini API key configured');

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-3.8-flash',
    generationConfig: { responseMimeType: 'application/json' },
  });

  const result = await model.generateContent(buildPrompt(ingredients));
  const text = result.response.text();
  return parseChefJson(text);
}

module.exports = { suggestDishesWithGemini };
