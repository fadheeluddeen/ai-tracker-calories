const PROMPT = `You are a nutrition estimation assistant. Look at the photo of food and
identify what it is, then estimate its nutrition for the portion shown.

Respond with ONLY a JSON object (no markdown, no prose, no code fences) with
exactly these keys:
{
  "food_name": string,
  "calories": integer (kcal, whole number),
  "protein_g": integer,
  "carbs_g": integer,
  "fat_g": integer,
  "confidence": "low" | "medium" | "high"
}

If multiple foods are visible, describe the whole plate as one entry and sum
the nutrition. If you cannot identify any food at all, still return your best
guess with "confidence": "low" rather than refusing.`;

/**
 * Strips markdown code fences some models add despite instructions,
 * parses the JSON, and validates/coerces it into the canonical shape.
 * Throws on anything that doesn't look like a usable result, so the
 * caller (gemini.js / groq.js) treats it as a provider failure.
 */
function parseFoodJson(rawText) {
  if (!rawText) throw new Error('empty response');

  const cleaned = rawText.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  const data = JSON.parse(cleaned);

  if (!data.food_name || typeof data.food_name !== 'string') {
    throw new Error('missing food_name in model response');
  }

  const toInt = (v) => {
    const n = Math.round(Number(v));
    return Number.isFinite(n) ? n : 0;
  };

  const confidence = ['low', 'medium', 'high'].includes(data.confidence) ? data.confidence : 'low';

  return {
    food_name: data.food_name.trim(),
    calories: toInt(data.calories),
    protein_g: toInt(data.protein_g),
    carbs_g: toInt(data.carbs_g),
    fat_g: toInt(data.fat_g),
    confidence,
  };
}

module.exports = { PROMPT, parseFoodJson };
