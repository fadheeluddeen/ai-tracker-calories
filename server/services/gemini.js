const { GoogleGenerativeAI } = require('@google/generative-ai');
const { PROMPT, parseFoodJson } = require('./parseFoodJson');
const { getGeminiKey } = require('./settings');

/**
 * Analyzes a food photo with Gemini. Throws on any failure (network,
 * rate limit, bad JSON) — the caller (analyze.js) owns the retry policy.
 * Key is read live from the settings table (editable from the Settings
 * screen, no restart needed) — .env's GEMINI_API_KEY is only the
 * first-boot default.
 */
async function analyzeWithGemini(buffer) {
  const apiKey = await getGeminiKey();
  if (!apiKey) throw new Error('no Gemini API key configured');

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-3.8-flash',
    generationConfig: { responseMimeType: 'application/json' },
  });

  const result = await model.generateContent([
    { inlineData: { mimeType: 'image/jpeg', data: buffer.toString('base64') } },
    { text: PROMPT },
  ]);

  const text = result.response.text();
  return parseFoodJson(text);
}

module.exports = { analyzeWithGemini };
