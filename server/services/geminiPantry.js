const { GoogleGenerativeAI } = require('@google/generative-ai');
const { PROMPT, parsePantryJson } = require('./parsePantryJson');
const { getGeminiKey } = require('./settings');

/**
 * Identifies a single pantry ingredient (not a full meal) with Gemini.
 * Throws on any failure (network, rate limit, bad JSON) — the caller
 * (analyzePantry.js) owns the retry policy. Same model/client setup as
 * gemini.js, different prompt/parser. Key is read live from the settings
 * table, same as gemini.js.
 */
async function analyzeIngredientWithGemini(buffer) {
  const apiKey = await getGeminiKey();
  if (!apiKey) throw new Error('no Gemini API key configured');

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-3.6-flash',
    generationConfig: { responseMimeType: 'application/json' },
  });

  const result = await model.generateContent([
    { inlineData: { mimeType: 'image/jpeg', data: buffer.toString('base64') } },
    { text: PROMPT },
  ]);

  const text = result.response.text();
  return parsePantryJson(text);
}

module.exports = { analyzeIngredientWithGemini };
