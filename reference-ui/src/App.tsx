import React, { useState, useEffect, useCallback } from 'react';
import { UserGoals, GlassTheme, ActiveTab, DayLocal } from './types';
import { DEFAULT_GOALS, getTodayDateString } from './constants';
import { IPhoneContainer } from './components/IPhoneContainer';
import { DynamicIsland } from './components/DynamicIsland';
import { LiquidGlassHeader } from './components/LiquidGlassHeader';
import { MacroRings } from './components/MacroRings';
import { DiaryMealsList } from './components/DiaryMealsList';
import { WaterTracker } from './components/WaterTracker';
import { LiquidTabBar } from './components/LiquidTabBar';
import { TrendsView } from './components/TrendsView';
import { ProfileView } from './components/ProfileView';
import { PantryIngredientsView } from './components/PantryIngredientsView';
import { ChefSuggestView } from './components/ChefSuggestView';
import { SupplementsView } from './components/SupplementsView';
import { CameraCaptureModal } from './components/CameraCaptureModal';
import { getMealsToday, getMealsByDate, postMealPhoto, DayMeals } from './api';
import { hapticSuccess, hapticMedium, hapticWarning } from './utils/haptics';

const today = getTodayDateString();

function getDefaultDayLocal(): DayLocal {
  return { waterMl: 0, burnedCalories: 250 };
}

export default function App() {
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [activeTab, setActiveTab] = useState<ActiveTab>('diary');
  const [theme] = useState<GlassTheme>('titanium');

  const [dayMeals, setDayMeals] = useState<DayMeals | null>(null);
  const [mealsLoading, setMealsLoading] = useState(true);
  const [isUploadingMeal, setIsUploadingMeal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);

  // Goals persist locally — no user/goals table on the backend.
  const [goals, setGoals] = useState<UserGoals>(() => {
    try {
      const saved = localStorage.getItem('ios_calorie_goals');
      return saved ? JSON.parse(saved) : DEFAULT_GOALS;
    } catch {
      return DEFAULT_GOALS;
    }
  });

  // Water + burned-calories stay local per day, keyed by date.
  const [localDays, setLocalDays] = useState<Record<string, DayLocal>>(() => {
    try {
      const saved = localStorage.getItem('ios_calorie_local_days');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {};
  });

  useEffect(() => {
    try {
      localStorage.setItem('ios_calorie_goals', JSON.stringify(goals));
    } catch {
      // ignore
    }
  }, [goals]);

  useEffect(() => {
    try {
      localStorage.setItem('ios_calorie_local_days', JSON.stringify(localDays));
    } catch {
      // ignore
    }
  }, [localDays]);

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

  const currentLocalDay: DayLocal = localDays[selectedDate] || getDefaultDayLocal();

  const totalCalories = dayMeals?.totals.calories ?? 0;
  const totalProtein = dayMeals?.totals.protein_g ?? 0;
  const totalCarbs = dayMeals?.totals.carbs_g ?? 0;
  const totalFat = dayMeals?.totals.fat_g ?? 0;
  const remainingCalories = Math.max(0, goals.calories - totalCalories + currentLocalDay.burnedCalories);

  const handleCaptureMeal = async (imageDataUrl: string) => {
    setShowCameraModal(false);
    hapticMedium();
    setIsUploadingMeal(true);
    try {
      await postMealPhoto(imageDataUrl);
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

  const handleUpdateWater = (deltaMl: number) => {
    hapticMedium();
    setLocalDays((prev) => {
      const existing = prev[selectedDate] || getDefaultDayLocal();
      return {
        ...prev,
        [selectedDate]: { ...existing, waterMl: Math.max(0, existing.waterMl + deltaMl) },
      };
    });
  };

  const handleSaveGoals = (newGoals: UserGoals) => {
    setGoals(newGoals);
  };

  return (
    <IPhoneContainer isIPhoneFrame={true} theme={theme}>
      <DynamicIsland
        remainingCalories={remainingCalories}
        totalCalories={totalCalories}
        goalCalories={goals.calories}
        waterMl={currentLocalDay.waterMl}
        waterGoalMl={goals.waterGoalMl}
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
              burnedCalories={currentLocalDay.burnedCalories}
            />

            <DiaryMealsList meals={dayMeals?.meals ?? []} loading={mealsLoading} />

            <div className="pt-1">
              <WaterTracker
                waterMl={currentLocalDay.waterMl}
                goalMl={goals.waterGoalMl}
                onUpdateWater={handleUpdateWater}
              />
            </div>
          </>
        )}

        {activeTab === 'pantry' && <PantryIngredientsView onAskChef={() => setActiveTab('chef')} />}

        {activeTab === 'supplements' && <SupplementsView />}

        {activeTab === 'chef' && <ChefSuggestView />}

        {activeTab === 'trends' && <TrendsView goals={goals} />}

        {activeTab === 'profile' && <ProfileView goals={goals} onSaveGoals={handleSaveGoals} />}
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
    </IPhoneContainer>
  );
}
