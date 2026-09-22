export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  calories: number;
  protein: number; // in grams
  carbs: number;   // in grams
  fat: number;     // in grams
  servingAmount: number;
  servingUnit: string;
  mealType: MealType;
  loggedAt: string;
}

export interface PresetFood {
  id: string;
  name: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  defaultServing: number;
  unit: string;
}

export interface UserGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  waterGoalMl: number;
}

export interface DayData {
  date: string; // YYYY-MM-DD
  items: FoodItem[];
  waterMl: number;
  burnedCalories: number;
}

export type GlassTheme = 'titanium' | 'frost' | 'aurora' | 'graphite';

export type ActiveTab = 'diary' | 'pantry' | 'chat' | 'trends' | 'profile';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  imageBase64?: string;
  timestamp: string;
}

export interface PantryIngredient {
  id: string;
  name: string;
  photoUrl: string;
  category: 'produce' | 'protein' | 'dairy' | 'pantry' | 'grains' | 'other';
  quantity: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  dateAdded: string;
  expiryDays?: number;
  notes?: string;
}
