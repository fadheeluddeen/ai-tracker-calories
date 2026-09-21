const { GoogleGenerativeAI } = require('@google/generative-ai');
const { PROMPT, parseFoodJson } = require('./parseFoodJson');

/**
 * Analyzes a food photo with Gemini. Throws on any failure (network,
 * rate limit, bad JSON) — the caller (analyze.js) owns the retry policy.
 */
async function analyzeWithGemini(buffer) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set');

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
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
