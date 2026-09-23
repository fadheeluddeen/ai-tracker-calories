// Thin fetch wrappers around the real Express/Postgres backend. No mock data,
// no IndexedDB — every call here hits server/routes/*.js directly.

export interface Meal {
  id: number;
  food_name: string | null;
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  confidence: string | null;
  provider: string | null;
  photo_disk_path: string | null;
  photo_drive_id: string | null;
  analysis_failed: boolean;
  created_at: string;
}

export interface DayTotals {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface DayMeals {
  date: string;
  totals: DayTotals;
  meals: Meal[];
}

export interface HistoryDay {
  date: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface PantryIngredient {
  id: number;
  name: string | null;
  category: string | null;
  quantity: string | null;
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  photo_disk_path: string | null;
  date_added: string;
  expiry_days: number | null;
  notes: string | null;
}

export interface ChefDish {
  name: string;
  ingredients_used: string[];
  steps: string[];
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface Supplement {
  id: number;
  name: string;
  dosage: string | null;
  schedule_times: string[];
  active: boolean;
  created_at: string;
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  return res.json();
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(',');
  const mimeMatch = header.match(/data:(.*?);base64/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

// ---- Meals ----

export function getMealsToday(): Promise<DayMeals> {
  return fetch('/api/meals/today').then((r) => handle(r));
}

export function getMealsByDate(date: string): Promise<DayMeals> {
  return fetch(`/api/meals?date=${encodeURIComponent(date)}`).then((r) => handle(r));
}

export function getMealsHistory(days: number): Promise<{ history: HistoryDay[] }> {
  return fetch(`/api/meals/history?days=${days}`).then((r) => handle(r));
}

export interface NotFoodResult {
  not_food: true;
  food_name: string | null;
  message: string;
}

export function isNotFoodResult(result: Meal | NotFoodResult): result is NotFoodResult {
  return (result as NotFoodResult).not_food === true;
}

export function postMealPhoto(imageDataUrl: string): Promise<Meal | NotFoodResult> {
  const form = new FormData();
  form.append('photo', dataUrlToBlob(imageDataUrl), 'meal.jpg');
  return fetch('/api/meals', { method: 'POST', body: form }).then((r) => handle(r));
}

export interface ManualMealInput {
  food_name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export function logMealManual(input: ManualMealInput): Promise<Meal> {
  return fetch('/api/meals/manual', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  }).then((r) => handle(r));
}

// ---- Pantry ----

export function getPantry(): Promise<{ ingredients: PantryIngredient[] }> {
  return fetch('/api/pantry').then((r) => handle(r));
}

export function postPantryPhoto(imageDataUrl: string): Promise<PantryIngredient> {
  const form = new FormData();
  form.append('photo', dataUrlToBlob(imageDataUrl), 'ingredient.jpg');
  return fetch('/api/pantry', { method: 'POST', body: form }).then((r) => handle(r));
}

export function deletePantryItem(id: number): Promise<unknown> {
  return fetch(`/api/pantry/${id}`, { method: 'DELETE' }).then((r) => handle(r));
}

// ---- Chef ----

export function getChefSuggestions(): Promise<{ dishes: ChefDish[] }> {
  return fetch('/api/chef/suggest').then((r) => handle(r));
}

// ---- Supplements ----

export function getSupplements(): Promise<{ supplements: Supplement[] }> {
  return fetch('/api/supplements').then((r) => handle(r));
}

export function createSupplement(input: {
  name: string;
  dosage?: string;
  schedule_times: string[];
  active?: boolean;
}): Promise<Supplement> {
  return fetch('/api/supplements', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  }).then((r) => handle(r));
}

export function updateSupplement(
  id: number,
  input: { name: string; dosage?: string; schedule_times: string[]; active: boolean }
): Promise<Supplement> {
  return fetch(`/api/supplements/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  }).then((r) => handle(r));
}

export function deleteSupplement(id: number): Promise<unknown> {
  return fetch(`/api/supplements/${id}`, { method: 'DELETE' }).then((r) => handle(r));
}

// ---- Settings (Gemini key, PIN gated) ----

export interface SettingsInfo {
  gemini_key_masked: string | null;
  last_error: { type: string; message: string; at: string } | null;
}

export function getSettings(pin: string): Promise<SettingsInfo> {
  return fetch('/api/settings', { headers: { 'X-Settings-Pin': pin } }).then((r) => handle(r));
}

export function setGeminiKey(pin: string, key: string): Promise<SettingsInfo> {
  return fetch('/api/settings/gemini-key', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Settings-Pin': pin },
    body: JSON.stringify({ key }),
  }).then((r) => handle(r));
}

// ---- Profile & real calorie/macro calculation (Mifflin-St Jeor) ----

export type Sex = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type WeightGoal = 'lose' | 'maintain' | 'gain';

export interface Profile {
  id: number;
  sex: Sex;
  age: number;
  height_cm: number;
  activity_level: ActivityLevel;
  goal: WeightGoal;
  background_image_path: string | null;
  updated_at: string;
}

export interface WeightLogEntry {
  id: number;
  weight_kg: number;
  logged_at: string;
}

export interface CalculatedGoals {
  bmr: number;
  tdee: number;
  calorie_goal: number;
  is_custom: boolean;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
}

// null clears the custom goal and goes back to the calculated one.
export function setCalorieGoal(calorieGoal: number | null): Promise<unknown> {
  return fetch('/api/profile/calorie-goal', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ calorie_goal: calorieGoal }),
  }).then((r) => handle(r));
}

export interface ProfileResponse {
  profile: Profile | null;
  latest_weight: WeightLogEntry | null;
  goals: CalculatedGoals | null;
}

// Postgres `numeric` columns come back as strings over JSON — normalize here
// so the rest of the app only ever deals in real numbers.
export function getProfile(): Promise<ProfileResponse> {
  return fetch('/api/profile')
    .then((r) => handle<any>(r))
    .then((data) => ({
      profile: data.profile ? { ...data.profile, height_cm: Number(data.profile.height_cm) } : null,
      latest_weight: data.latest_weight
        ? { ...data.latest_weight, weight_kg: Number(data.latest_weight.weight_kg) }
        : null,
      goals: data.goals,
    }));
}

export function updateProfile(input: {
  sex: Sex;
  age: number;
  height_cm: number;
  activity_level: ActivityLevel;
  goal: WeightGoal;
}): Promise<Profile> {
  return fetch('/api/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
    .then((r) => handle<any>(r))
    .then((p) => ({ ...p, height_cm: Number(p.height_cm) }));
}

export function uploadBackgroundImage(imageDataUrl: string): Promise<Profile> {
  const form = new FormData();
  form.append('photo', dataUrlToBlob(imageDataUrl), 'background.jpg');
  return fetch('/api/profile/background', { method: 'POST', body: form })
    .then((r) => handle<any>(r))
    .then((p) => ({ ...p, height_cm: Number(p.height_cm) }));
}

export function resetBackgroundImage(): Promise<Profile> {
  return fetch('/api/profile/background', { method: 'DELETE' })
    .then((r) => handle<any>(r))
    .then((p) => ({ ...p, height_cm: Number(p.height_cm) }));
}

export function logWeight(weightKg: number): Promise<WeightLogEntry> {
  return fetch('/api/weight', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ weight_kg: weightKg }),
  })
    .then((r) => handle<any>(r))
    .then((w) => ({ ...w, weight_kg: Number(w.weight_kg) }));
}

// ---- Push notifications ----

export function getPushPublicKey(): Promise<{ publicKey: string | null }> {
  return fetch('/api/push/public-key').then((r) => handle(r));
}

export function subscribePush(subscription: PushSubscriptionJSON): Promise<unknown> {
  return fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription),
  }).then((r) => handle(r));
}

export function sendTestPush(): Promise<{ sent: number }> {
  return fetch('/api/push/test', { method: 'POST' }).then((r) => handle(r));
}
