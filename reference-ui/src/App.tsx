import React, { useState, useEffect, useCallback } from 'react';
import { UserGoals, GlassTheme, ActiveTab } from './types';
import { DEFAULT_GOALS, getTodayDateString } from './constants';
import { DynamicIsland } from './components/DynamicIsland';
import { LiquidGlassHeader } from './components/LiquidGlassHeader';
import { MacroRings } from './components/MacroRings';
import { DiaryMealsList } from './components/DiaryMealsList';
import { LiquidTabBar } from './components/LiquidTabBar';
import { TrendsView } from './components/TrendsView';
import { ProfileView } from './components/ProfileView';
import { PantryIngredientsView } from './components/PantryIngredientsView';
import { ChefSuggestView } from './components/ChefSuggestView';
import { SupplementsView } from './components/SupplementsView';
import { CameraCaptureModal } from './components/CameraCaptureModal';
import { getMealsToday, getMealsByDate, postMealPhoto, DayMeals, isNotFoodResult } from './api';
import { hapticSuccess, hapticMedium, hapticWarning } from './utils/haptics';

const today = getTodayDateString();

// Theme-specific wallpaper backgrounds with organic shapes to refract through liquid glass
function getThemeBackgroundClass(theme: GlassTheme): string {
  switch (theme) {
    case 'frost':
      return 'bg-gradient-to-br from-slate-200 via-sky-100 to-indigo-100';
    case 'aurora':
      return 'bg-gradient-to-br from-zinc-200 via-stone-200 to-slate-300';
    case 'graphite':
      return 'bg-gradient-to-br from-neutral-300 via-slate-400 to-zinc-400';
    case 'titanium':
    default:
      return 'bg-gradient-to-br from-zinc-200 via-stone-200 to-neutral-300';
  }
}

function ThemeOrbs({ theme }: { theme: GlassTheme }) {
  switch (theme) {
    case 'frost':
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-16 -left-16 w-88 h-88 rounded-full bg-sky-300/50 blur-3xl animate-fluid-1" />
          <div className="absolute top-1/3 -right-20 w-88 h-88 rounded-full bg-indigo-200/50 blur-3xl animate-fluid-2" />
          <div className="absolute -bottom-20 left-1/4 w-88 h-88 rounded-full bg-blue-300/40 blur-3xl animate-fluid-3" />
        </div>
      );
    case 'aurora':
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-12 right-0 w-80 h-80 rounded-full bg-stone-400/35 blur-3xl animate-fluid-1" />
          <div className="absolute top-1/2 -left-20 w-88 h-88 rounded-full bg-zinc-400/35 blur-3xl animate-fluid-2" />
          <div className="absolute -bottom-12 right-10 w-80 h-80 rounded-full bg-neutral-400/30 blur-3xl animate-fluid-3" />
        </div>
      );
    case 'graphite':
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-12 -left-12 w-80 h-80 rounded-full bg-slate-500/35 blur-3xl animate-fluid-1" />
          <div className="absolute bottom-1/4 -right-20 w-88 h-88 rounded-full bg-zinc-600/35 blur-3xl animate-fluid-2" />
          <div className="absolute top-1/4 left-1/3 w-72 h-72 rounded-full bg-neutral-500/30 blur-3xl animate-fluid-3" />
        </div>
      );
    case 'titanium':
    default:
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -left-16 w-96 h-96 rounded-full bg-stone-300/60 blur-3xl animate-fluid-1" />
          <div className="absolute top-1/3 -right-24 w-96 h-96 rounded-full bg-zinc-300/65 blur-3xl animate-fluid-2" />
          <div className="absolute -bottom-16 left-8 w-96 h-96 rounded-full bg-neutral-400/50 blur-3xl animate-fluid-3" />
        </div>
      );
  }
}

export default function App() {
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [activeTab, setActiveTab] = useState<ActiveTab>('diary');
  const [theme] = useState<GlassTheme>('frost');

  const [dayMeals, setDayMeals] = useState<DayMeals | null>(null);
  const [mealsLoading, setMealsLoading] = useState(true);
  const [isUploadingMeal, setIsUploadingMeal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [notFoodMessage, setNotFoodMessage] = useState<string | null>(null);

  // Goals persist locally — no user/goals table on the backend.
  const [goals, setGoals] = useState<UserGoals>(() => {
    try {
      const saved = localStorage.getItem('ios_calorie_goals');
      return saved ? JSON.parse(saved) : DEFAULT_GOALS;
    } catch {
      return DEFAULT_GOALS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('ios_calorie_goals', JSON.stringify(goals));
    } catch {
      // ignore
    }
  }, [goals]);

  const loadMealsForDate = useCallback(async (date: string) => {
    setMealsLoading(true);
    try {
      const data = date === today ? await getMealsToday() : await getMealsByDate(date);
      setDayMeals(data);
    } catch (err) {
      console.error('Failed to load meals:', err);
      setDayMeals({ date, totals: { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }, meals: [] });
    } finally {
      setMealsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMealsForDate(selectedDate);
  }, [selectedDate, loadMealsForDate]);

  const totalCalories = dayMeals?.totals.calories ?? 0;
  const totalProtein = dayMeals?.totals.protein_g ?? 0;
  const totalCarbs = dayMeals?.totals.carbs_g ?? 0;
  const totalFat = dayMeals?.totals.fat_g ?? 0;
  const remainingCalories = Math.max(0, goals.calories - totalCalories);

  const handleCaptureMeal = async (imageDataUrl: string) => {
    setShowCameraModal(false);
    hapticMedium();
    setIsUploadingMeal(true);
    try {
      const result = await postMealPhoto(imageDataUrl);
      if (isNotFoodResult(result)) {
        hapticWarning();
        setNotFoodMessage(result.message);
        setTimeout(() => setNotFoodMessage(null), 4000);
        return;
      }
      hapticSuccess();
      // Snapping always logs to "now" — jump back to today so the new entry is visible.
      if (selectedDate !== today) {
        setSelectedDate(today);
      } else {
        await loadMealsForDate(today);
      }
    } catch (err) {
      console.error('Failed to log meal:', err);
      hapticWarning();
    } finally {
      setIsUploadingMeal(false);
    }
  };

  const handleSaveGoals = (newGoals: UserGoals) => {
    setGoals(newGoals);
  };

  return (
    <div
      className={`min-h-dvh w-full max-w-md mx-auto relative flex flex-col overflow-hidden ${getThemeBackgroundClass(theme)} text-neutral-900 transition-colors duration-500`}
    >
      <ThemeOrbs theme={theme} />

      <div
        className="flex-1 min-h-0 overflow-y-auto no-scrollbar flex flex-col px-4"
        style={{
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.25rem)',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 7rem)',
        }}
      >
      <DynamicIsland
        remainingCalories={remainingCalories}
        totalCalories={totalCalories}
        goalCalories={goals.calories}
        mealsCount={dayMeals?.meals.length ?? 0}
      />

      <LiquidGlassHeader selectedDate={selectedDate} onSelectDate={setSelectedDate} />

      <div className="mt-4 flex-1 space-y-4">
        {activeTab === 'diary' && (
          <>
            <MacroRings
              totalCalories={totalCalories}
              totalProtein={totalProtein}
              totalCarbs={totalCarbs}
              totalFat={totalFat}
              goals={goals}
            />

            <DiaryMealsList meals={dayMeals?.meals ?? []} loading={mealsLoading} />
          </>
        )}

        {activeTab === 'pantry' && <PantryIngredientsView onAskChef={() => setActiveTab('chef')} />}

        {activeTab === 'supplements' && <SupplementsView />}

        {activeTab === 'chef' && <ChefSuggestView />}

        {activeTab === 'trends' && <TrendsView goals={goals} />}

        {activeTab === 'profile' && <ProfileView goals={goals} onSaveGoals={handleSaveGoals} />}
      </div>
      </div>

      <LiquidTabBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenCamera={() => setShowCameraModal(true)}
      />

      <CameraCaptureModal
        isOpen={showCameraModal}
        onClose={() => setShowCameraModal(false)}
        onCapture={handleCaptureMeal}
      />

      {isUploadingMeal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="liquid-glass-thick rounded-2xl px-5 py-4 text-sm font-semibold text-neutral-900 border border-white/80 shadow-xl">
            Analyzing your plate...
          </div>
        </div>
      )}

      {notFoodMessage && (
        <div
          className="absolute inset-x-4 z-50 flex justify-center"
          style={{ top: 'calc(env(safe-area-inset-top, 0px) + 0.5rem)' }}
        >
          <div className="liquid-glass-thick rounded-2xl px-4 py-3 text-sm font-semibold text-neutral-900 border border-white/80 shadow-xl text-center max-w-xs">
            {notFoodMessage}
          </div>
        </div>
      )}
    </div>
  );
}
