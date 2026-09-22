export interface UserGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  waterGoalMl: number;
}

export interface DayLocal {
  waterMl: number;
  burnedCalories: number;
}

export type GlassTheme = 'titanium' | 'frost' | 'aurora' | 'graphite';

export type ActiveTab = 'diary' | 'pantry' | 'supplements' | 'chef' | 'trends' | 'profile';
