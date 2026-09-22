import React from 'react';
import { AlertCircle, Utensils } from 'lucide-react';
import { Meal } from '../api';

interface DiaryMealsListProps {
  meals: Meal[];
  loading: boolean;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export const DiaryMealsList: React.FC<DiaryMealsListProps> = ({ meals, loading }) => {
  return (
    <div className="liquid-glass liquid-sheen rounded-3xl overflow-hidden relative border border-white/70 shadow-sm">
      <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-white/90 to-transparent pointer-events-none z-10" />

      <div className="p-4 flex items-center justify-between relative z-10">
        <h3 className="text-base font-bold text-neutral-900 tracking-tight">Logged Meals</h3>
        <span className="text-xs text-neutral-500 font-medium">{meals.length} today</span>
      </div>

      <div className="border-t border-white/30 relative z-10">
        {loading ? (
          <div className="py-6 px-4 text-center text-xs text-neutral-500">Loading meals...</div>
        ) : meals.length === 0 ? (
          <div className="py-6 px-4 text-center">
            <p className="text-xs text-neutral-500">No meals logged for this day yet</p>
            <p className="text-[11px] text-neutral-400 mt-1">Tap the camera button to snap a plate</p>
          </div>
        ) : (
          <div className="divide-y divide-white/20">
            {meals.map((meal) => (
              <div
                key={meal.id}
                className="p-3.5 px-4 flex items-center gap-3 hover:bg-white/25 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl overflow-hidden liquid-glass-subtle border border-white/60 bg-neutral-100 flex items-center justify-center shrink-0">
                  {meal.photo_disk_path ? (
                    <img
                      src={`/${meal.photo_disk_path}`}
                      alt={meal.food_name || 'meal'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Utensils className="w-5 h-5 text-neutral-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <div className="text-sm font-semibold text-neutral-900 tracking-tight truncate">
                      {meal.food_name || 'Unidentified meal'}
                    </div>
                    {meal.analysis_failed && (
                      <span title="Analysis failed">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-neutral-600 flex items-center gap-2 mt-0.5 font-medium">
                    <span>{formatTime(meal.created_at)}</span>
                    <span className="text-neutral-400">•</span>
                    <span>
                      P:{meal.protein_g ?? 0}g C:{meal.carbs_g ?? 0}g F:{meal.fat_g ?? 0}g
                    </span>
                  </div>
                </div>

                <span className="text-xs font-extrabold text-neutral-800 shrink-0">
                  {meal.calories ?? 0} kcal
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
