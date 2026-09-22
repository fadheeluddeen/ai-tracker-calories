import { PresetFood, FoodItem, UserGoals, DayData } from '../types';

export const POPULAR_FOODS: PresetFood[] = [
  { id: 'f1', name: 'Avocado Toast on Sourdough', category: 'Breakfast', calories: 290, protein: 7, carbs: 32, fat: 15, defaultServing: 1, unit: 'slice' },
  { id: 'f2', name: 'Pasture-Raised Eggs (2 Large)', category: 'Breakfast', calories: 144, protein: 12.6, carbs: 0.8, fat: 9.9, defaultServing: 2, unit: 'eggs' },
  { id: 'f3', name: 'Greek Yogurt (0% Fat)', category: 'Dairy', calories: 120, protein: 22, carbs: 7, fat: 0.4, defaultServing: 170, unit: 'g' },
  { id: 'f4', name: 'Blueberries & Wild Honey', category: 'Fruits', calories: 85, protein: 1, carbs: 21, fat: 0.3, defaultServing: 100, unit: 'g' },
  { id: 'f5', name: 'Grilled Chicken Breast', category: 'Poultry', calories: 235, protein: 44, carbs: 0, fat: 5, defaultServing: 180, unit: 'g' },
  { id: 'f6', name: 'Steamed Jasmine Rice', category: 'Grains', calories: 205, protein: 4.2, carbs: 45, fat: 0.4, defaultServing: 150, unit: 'g' },
  { id: 'f7', name: 'Extra Virgin Olive Oil', category: 'Oils', calories: 119, protein: 0, carbs: 0, fat: 13.5, defaultServing: 1, unit: 'tbsp' },
  { id: 'f8', name: 'Atlantic Salmon Fillet', category: 'Seafood', calories: 340, protein: 34, carbs: 0, fat: 22, defaultServing: 200, unit: 'g' },
  { id: 'f9', name: 'Roasted Sweet Potato', category: 'Vegetables', calories: 130, protein: 2, carbs: 30, fat: 0.2, defaultServing: 150, unit: 'g' },
  { id: 'f10', name: 'Steamed Broccoli with Sea Salt', category: 'Vegetables', calories: 55, protein: 3.7, carbs: 11, fat: 0.6, defaultServing: 150, unit: 'g' },
  { id: 'f11', name: 'Whey Protein Isolate Shake', category: 'Supplements', calories: 130, protein: 27, carbs: 2, fat: 1, defaultServing: 1, unit: 'scoop (32g)' },
  { id: 'f12', name: 'Raw Organic Almonds', category: 'Nuts', calories: 164, protein: 6, carbs: 6, fat: 14, defaultServing: 28, unit: 'g' },
  { id: 'f13', name: 'Oat Milk Flat White', category: 'Beverages', calories: 120, protein: 3, carbs: 18, fat: 4, defaultServing: 1, unit: 'cup' },
  { id: 'f14', name: 'Mixed Greens with Lemon Vinaigrette', category: 'Salads', calories: 95, protein: 2, carbs: 6, fat: 8, defaultServing: 1, unit: 'bowl' },
  { id: 'f15', name: 'Steel Cut Oatmeal with Chia', category: 'Breakfast', calories: 210, protein: 7, carbs: 38, fat: 4.5, defaultServing: 1, unit: 'bowl' }
];

export const DEFAULT_GOALS: UserGoals = {
  calories: 2150,
  protein: 145, // 145g = 580 kcal (~27%)
  carbs: 230,   // 230g = 920 kcal (~43%)
  fat: 65,      // 65g = 585 kcal (~27%)
  waterGoalMl: 2800,
};

export function getInitialDayData(dateString: string): DayData {
  return {
    date: dateString,
    waterMl: 1750,
    burnedCalories: 340,
    items: [
      {
        id: 'init-1',
        name: 'Avocado Toast on Sourdough',
        calories: 290,
        protein: 7,
        carbs: 32,
        fat: 15,
        servingAmount: 1,
        servingUnit: 'slice',
        mealType: 'breakfast',
        loggedAt: '08:15 AM'
      },
      {
        id: 'init-2',
        name: 'Pasture-Raised Eggs (2 Large)',
        calories: 144,
        protein: 12.6,
        carbs: 0.8,
        fat: 9.9,
        servingAmount: 2,
        servingUnit: 'eggs',
        mealType: 'breakfast',
        loggedAt: '08:16 AM'
      },
      {
        id: 'init-3',
        name: 'Oat Milk Flat White',
        calories: 120,
        protein: 3,
        carbs: 18,
        fat: 4,
        servingAmount: 1,
        servingUnit: 'cup',
        mealType: 'breakfast',
        loggedAt: '08:30 AM'
      },
      {
        id: 'init-4',
        name: 'Grilled Chicken Breast',
        calories: 235,
        protein: 44,
        carbs: 0,
        fat: 5,
        servingAmount: 180,
        servingUnit: 'g',
        mealType: 'lunch',
        loggedAt: '12:45 PM'
      },
      {
        id: 'init-5',
        name: 'Steamed Jasmine Rice',
        calories: 205,
        protein: 4.2,
        carbs: 45,
        fat: 0.4,
        servingAmount: 150,
        servingUnit: 'g',
        mealType: 'lunch',
        loggedAt: '12:45 PM'
      },
      {
        id: 'init-6',
        name: 'Steamed Broccoli with Sea Salt',
        calories: 55,
        protein: 3.7,
        carbs: 11,
        fat: 0.6,
        servingAmount: 150,
        servingUnit: 'g',
        mealType: 'lunch',
        loggedAt: '12:46 PM'
      },
      {
        id: 'init-7',
        name: 'Raw Organic Almonds',
        calories: 164,
        protein: 6,
        carbs: 6,
        fat: 14,
        servingAmount: 28,
        servingUnit: 'g',
        mealType: 'snack',
        loggedAt: '04:15 PM'
      },
      {
        id: 'init-8',
        name: 'Whey Protein Isolate Shake',
        calories: 130,
        protein: 27,
        carbs: 2,
        fat: 1,
        servingAmount: 1,
        servingUnit: 'scoop',
        mealType: 'snack',
        loggedAt: '05:30 PM'
      }
    ]
  };
}

export function getTodayDateString(): string {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

export function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}
