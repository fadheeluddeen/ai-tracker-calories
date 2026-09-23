const PROMPT = `You are a nutrition estimation assistant for a food diary app. A user just
photographed something and expects it to be logged as a meal.

Step 1 — decide whether the photo shows food or a drink meant for human
consumption. This includes full meals, snacks, packaged food, and any
beverage in a cup, mug, glass, bottle, or can — coffee (black, with milk, in
a half-empty mug, etc.), tea, water, soda, juice, and alcohol all count as
food for this purpose. Identify beverages specifically by name (e.g. "Black
coffee", "Iced latte") — never respond that a drink "can't be identified" or
call it an unidentified item.

Step 2 — if the photo does NOT show food or a drink (e.g. a plant, a person,
a pet, furniture, electronics, a room, a vehicle, a document), set
"is_food" to false, set "food_name" to a short factual description of what
the photo actually shows (e.g. "Artificial plant"), and set every nutrition
field to 0. Do not invent a food to force a match.

Step 3 — if the photo DOES show food or a drink, set "is_food" to true, set
"food_name" to a specific identification of it, and estimate its nutrition
for the portion/serving actually shown. If multiple foods are visible,
describe the whole plate as one entry and sum the nutrition. Never refuse to
estimate real food or a real drink — if you're unsure of the exact dish or
portion, give your best good-faith estimate and set "confidence" to "low"
rather than failing.

Respond with ONLY a JSON object (no markdown, no prose, no code fences) with
exactly these keys:
{
  "is_food": boolean,
  "food_name": string,
  "calories": integer (kcal, whole number, 0 if is_food is false),
  "protein_g": integer,
  "carbs_g": integer,
  "fat_g": integer,
  "confidence": "low" | "medium" | "high"
}`;

/**
 * Strips markdown code fences some models add despite instructions,
 * parses the JSON, and validates/coerces it into the canonical shape.
 * Throws on anything that doesn't look like a usable result, so the
 * caller (gemini.js) treats it as a provider failure.
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
  const isFood = data.is_food !== false; // default to true if the model omits the field

  return {
    is_food: isFood,
    food_name: data.food_name.trim(),
    calories: isFood ? toInt(data.calories) : 0,
    protein_g: isFood ? toInt(data.protein_g) : 0,
    carbs_g: isFood ? toInt(data.carbs_g) : 0,
    fat_g: isFood ? toInt(data.fat_g) : 0,
    confidence,
  };
}

module.exports = { PROMPT, parseFoodJson };
