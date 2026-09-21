const { PROMPT, parseFoodJson } = require('./parseFoodJson');

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

/**
 * Analyzes a food photo with Groq's OpenAI-compatible vision endpoint.
 * Throws on any failure — the caller (analyze.js) owns the retry policy.
 */
async function analyzeWithGroq(buffer) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY is not set');

  const model = process.env.GROQ_VISION_MODEL || 'meta-llama/llama-4-scout-17b-16e-instruct';
  const dataUrl = `data:image/jpeg;base64,${buffer.toString('base64')}`;

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: PROMPT },
            { type: 'image_url', image_url: { url: dataUrl } },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`groq request failed: ${res.status} ${body}`);
  }

  const json = await res.json();
  const text = json.choices?.[0]?.message?.content;
  return parseFoodJson(text);
}

module.exports = { analyzeWithGroq };
