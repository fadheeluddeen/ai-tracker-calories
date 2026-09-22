import { UserGoals } from './types';

export const DEFAULT_GOALS: UserGoals = {
  calories: 2150,
  protein: 145,
  carbs: 230,
  fat: 65,
  waterGoalMl: 2800,
};

export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}
