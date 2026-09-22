/**
 * Builds the suggestion prompt from the user's current pantry so Gemini
 * prioritizes what's actually on hand. `ingredients` is a list of rows
 * from pantry_ingredients (name/category/quantity only needed).
 */
function buildPrompt(ingredients) {
  const list = ingredients.length
    ? ingredients
        .map((i) => `- ${i.name}${i.quantity ? ` (${i.quantity})` : ''}${i.category ? ` [${i.category}]` : ''}`)
        .join('\n')
    : '(pantry is empty)';

  return `You are a home cook's kitchen assistant. Based on the ingredients below, suggest up to 3 dishes the user can make right now, using primarily what they already have.

AVAILABLE PANTRY INGREDIENTS:
${list}

Respond with ONLY a JSON object (no markdown, no prose, no code fences) with exactly this shape:
{
  "dishes": [
    {
      "name": string,
      "ingredients_used": string[] (must be a subset of the pantry ingredients listed above, plus basic staples like salt/oil/water if needed),
      "steps": string[] (concise step-by-step instructions),
      "calories": integer (kcal, whole number, for one serving),
      "protein_g": integer,
      "carbs_g": integer,
      "fat_g": integer
    }
  ]
}

Return at most 3 dishes, ordered best-fit first (uses the most pantry ingredients, least extra shopping). If the pantry has too little to make anything reasonable, still suggest your best simple options.`;
}

/**
 * Strips markdown code fences some models add despite instructions,
 * parses the JSON, and validates/coerces it into the canonical shape.
 * Throws on anything that doesn't look like a usable result, so the
 * caller (geminiChef.js) treats it as a provider failure.
 */
function parseChefJson(rawText) {
  if (!rawText) throw new Error('empty response');

  const cleaned = rawText.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  const data = JSON.parse(cleaned);

  if (!Array.isArray(data.dishes)) {
    throw new Error('missing dishes array in model response');
  }

  const toInt = (v) => {
    const n = Math.round(Number(v));
    return Number.isFinite(n) ? n : 0;
  };
  const toStringArray = (v) => (Array.isArray(v) ? v.filter((x) => typeof x === 'string') : []);

  const dishes = data.dishes.slice(0, 3).map((d) => ({
    name: typeof d.name === 'string' && d.name.trim() ? d.name.trim() : 'Untitled dish',
    ingredients_used: toStringArray(d.ingredients_used),
    steps: toStringArray(d.steps),
    calories: toInt(d.calories),
    protein_g: toInt(d.protein_g),
    carbs_g: toInt(d.carbs_g),
    fat_g: toInt(d.fat_g),
  }));

  return { dishes };
}

module.exports = { buildPrompt, parseChefJson };
