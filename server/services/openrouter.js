const MODEL = 'openai/gpt-4o';

/**
 * One chat completion via OpenRouter, returning the raw text so the same
 * parse*Json validators used for Gemini can check it. Pass an image buffer
 * for the photo prompts (meal/pantry); omit it for text-only (chef).
 * Throws on any failure — aiFallback.js decides what happens next.
 */
async function completeWithOpenRouter(prompt, imageBuffer) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('no OpenRouter API key configured');

  const content = imageBuffer
    ? [
        { type: 'text', text: prompt },
        { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBuffer.toString('base64')}` } },
      ]
    : prompt;

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'X-Title': 'Calorie Tracker',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content }],
      response_format: { type: 'json_object' },
      // Replies are small JSON objects. Without a cap OpenRouter reserves the
      // model's full output limit up front and refuses on low-credit keys.
      max_tokens: 1500,
    }),
    signal: AbortSignal.timeout(45000),
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`OpenRouter ${res.status}: ${body.error?.message || res.statusText}`);
  }

  const text = body.choices?.[0]?.message?.content;
  if (!text) throw new Error('OpenRouter returned no content');
  return text;
}

module.exports = { completeWithOpenRouter };
