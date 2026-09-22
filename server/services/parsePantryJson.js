const PROMPT = `You are a kitchen inventory assistant. Look at the photo of a single
food ingredient (not a prepared meal) and identify what it is, then estimate
its nutrition and shelf life for the quantity shown.

Respond with ONLY a JSON object (no markdown, no prose, no code fences) with
exactly these keys:
{
  "name": string,
  "category": "produce" | "protein" | "dairy" | "pantry" | "grains" | "other",
  "quantity": string (e.g. "1 medium", "200g", "1 carton"),
  "calories": integer (kcal, whole number, for the quantity shown),
  "protein_g": integer,
  "carbs_g": integer,
  "fat_g": integer,
  "expiry_days": integer (approximate days from today before this spoils)
}

If you cannot identify the ingredient at all, still return your best guess
rather than refusing.`;

const CATEGORIES = ['produce', 'protein', 'dairy', 'pantry', 'grains', 'other'];

/**
 * Strips markdown code fences some models add despite instructions,
 * parses the JSON, and validates/coerces it into the canonical shape.
 * Throws on anything that doesn't look like a usable result, so the
 * caller (geminiPantry.js) treats it as a provider failure.
 */
function parsePantryJson(rawText) {
  if (!rawText) throw new Error('empty response');

  const cleaned = rawText.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  const data = JSON.parse(cleaned);

  if (!data.name || typeof data.name !== 'string') {
    throw new Error('missing name in model response');
  }

  const toInt = (v) => {
    const n = Math.round(Number(v));
    return Number.isFinite(n) ? n : 0;
  };
  const toIntOrNull = (v) => {
    const n = Math.round(Number(v));
    return Number.isFinite(n) ? n : null;
  };

  const category = CATEGORIES.includes(data.category) ? data.category : 'other';

  return {
    name: data.name.trim(),
    category,
    quantity: typeof data.quantity === 'string' ? data.quantity.trim() : '',
    calories: toInt(data.calories),
    protein_g: toInt(data.protein_g),
    carbs_g: toInt(data.carbs_g),
    fat_g: toInt(data.fat_g),
    expiry_days: toIntOrNull(data.expiry_days),
  };
}

module.exports = { PROMPT, parsePantryJson, CATEGORIES };
