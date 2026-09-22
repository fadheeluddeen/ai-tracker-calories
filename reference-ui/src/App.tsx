import React, { useState, useEffect } from 'react';
import { 
  MealType, FoodItem, UserGoals, DayData, 
  GlassTheme, ActiveTab 
} from './types';
import { 
  DEFAULT_GOALS, getInitialDayData, 
  getTodayDateString 
} from './data/mockFoods';
import { IPhoneContainer } from './components/IPhoneContainer';
import { DynamicIsland } from './components/DynamicIsland';
import { LiquidGlassHeader } from './components/LiquidGlassHeader';
import { MacroRings } from './components/MacroRings';
import { MealCard } from './components/MealCard';
import { WaterTracker } from './components/WaterTracker';
import { LiquidTabBar } from './components/LiquidTabBar';
import { FoodLogModal } from './components/FoodLogModal';
import { TrendsView } from './components/TrendsView';
import { ProfileView } from './components/ProfileView';
import { PantryIngredientsView } from './components/PantryIngredientsView';
import { GeminiChatView } from './components/GeminiChatView';
import { PantryIngredient } from './types';
import { getAllIngredients } from './utils/storage';
import { 
  hapticLight, hapticMedium, hapticSuccess, 
  hapticWarning, hapticSelection 
} from './utils/haptics';

export default function App() {
  const today = getTodayDateString();
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [activeTab, setActiveTab] = useState<ActiveTab>('diary');
  const [theme, setTheme] = useState<GlassTheme>('titanium');

  // Pantry & Chat state
  const [pantryIngredients, setPantryIngredients] = useState<PantryIngredient[]>([]);
  const [chatInitialPrompt, setChatInitialPrompt] = useState<string | undefined>(undefined);

  // Modal State
  const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
  const [modalMealType, setModalMealType] = useState<MealType>('breakfast');

  // Goals State (stored in localStorage for persistence)
  const [goals, setGoals] = useState<UserGoals>(() => {
    try {
      const saved = localStorage.getItem('ios_calorie_goals');
      return saved ? JSON.parse(saved) : DEFAULT_GOALS;
    } catch {
      return DEFAULT_GOALS;
    }
  });

  // Load pantry ingredients
  const refreshPantry = async () => {
    try {
      const items = await getAllIngredients();
      setPantryIngredients(items);
    } catch (e) {
      console.warn('Could not load pantry:', e);
    }
  };

  useEffect(() => {
    refreshPantry();
  }, [activeTab]);

  // Day Data Map (keyed by date YYYY-MM-DD)
  const [allDaysData, setAllDaysData] = useState<Record<string, DayData>>(() => {
    try {
      const saved = localStorage.getItem('ios_calorie_logs');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      [today]: getInitialDayData(today),
    };
  });

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem('ios_calorie_goals', JSON.stringify(goals));
    } catch {
      // ignore
    }
  }, [goals]);

  useEffect(() => {
    try {
      localStorage.setItem('ios_calorie_logs', JSON.stringify(allDaysData));
    } catch {
      // ignore
    }
  }, [allDaysData]);

  // Current day data accessor
  const currentDayData: DayData = allDaysData[selectedDate] || {
    date: selectedDate,
    items: [],
    waterMl: 0,
    burnedCalories: 250,
  };

  // Calculations for current day
  const totalCalories = currentDayData.items.reduce((sum, item) => sum + item.calories, 0);
  const totalProtein = currentDayData.items.reduce((sum, item) => sum + item.protein, 0);
  const totalCarbs = currentDayData.items.reduce((sum, item) => sum + item.carbs, 0);
  const totalFat = currentDayData.items.reduce((sum, item) => sum + item.fat, 0);
  const remainingCalories = Math.max(0, goals.calories - totalCalories + currentDayData.burnedCalories);

  // Meal items filtered
  const breakfastItems = currentDayData.items.filter((i) => i.mealType === 'breakfast');
  const lunchItems = currentDayData.items.filter((i) => i.mealType === 'lunch');
  const dinnerItems = currentDayData.items.filter((i) => i.mealType === 'dinner');
  const snackItems = currentDayData.items.filter((i) => i.mealType === 'snack');

  // Handlers
  const handleOpenAddFood = (mealType: MealType) => {
    hapticMedium();
    setModalMealType(mealType);
    setIsFoodModalOpen(true);
  };

  const handleLogFood = (itemData: Omit<FoodItem, 'id' | 'loggedAt'>) => {
    hapticSuccess();
    const newItem: FoodItem = {
      ...itemData,
      id: `food-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      loggedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setAllDaysData((prev) => {
      const existing = prev[selectedDate] || {
        date: selectedDate,
        items: [],
        waterMl: 0,
        burnedCalories: 250,
      };
      return {
        ...prev,
        [selectedDate]: {
          ...existing,
          items: [newItem, ...existing.items],
        },
      };
    });
  };

  const handleRemoveFood = (foodId: string) => {
    hapticWarning();
    setAllDaysData((prev) => {
      const existing = prev[selectedDate];
      if (!existing) return prev;
      return {
        ...prev,
        [selectedDate]: {
          ...existing,
          items: existing.items.filter((item) => item.id !== foodId),
        },
      };
    });
  };

  const handleUpdateWater = (deltaMl: number) => {
    if (deltaMl > 0) {
      hapticMedium();
    } else {
      hapticWarning();
    }
    setAllDaysData((prev) => {
      const existing = prev[selectedDate] || {
        date: selectedDate,
        items: [],
        waterMl: 0,
        burnedCalories: 250,
      };
      const newWater = Math.max(0, existing.waterMl + deltaMl);
      return {
        ...prev,
        [selectedDate]: {
          ...existing,
          waterMl: newWater,
        },
      };
    });
  };

  const handleSaveGoals = (newGoals: UserGoals) => {
    hapticSuccess();
    setGoals(newGoals);
  };

  return (
    <IPhoneContainer isIPhoneFrame={true} theme={theme}>
      {/* iOS Dynamic Island */}
      <DynamicIsland
        remainingCalories={remainingCalories}
        totalCalories={totalCalories}
        goalCalories={goals.calories}
        waterMl={currentDayData.waterMl}
        waterGoalMl={goals.waterGoalMl}
      />

      {/* Date Header */}
      <LiquidGlassHeader
        selectedDate={selectedDate}
        onSelectDate={(date) => setSelectedDate(date)}
      />

      {/* Main Content Body */}
      <div className="mt-4 flex-1 space-y-4">
        {activeTab === 'diary' && (
          <>
            {/* Daily Macro Rings Hero Card */}
            <MacroRings
              totalCalories={totalCalories}
              totalProtein={totalProtein}
              totalCarbs={totalCarbs}
              totalFat={totalFat}
              goals={goals}
              burnedCalories={currentDayData.burnedCalories}
            />

            {/* Meal Cards Section */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Meals & Nutrition
                </h3>
                <span className="text-xs text-neutral-600 font-medium">
                  {currentDayData.items.length} items logged
                </span>
              </div>

              <MealCard
                mealType="breakfast"
                title="Breakfast"
                items={breakfastItems}
                onAddFood={handleOpenAddFood}
                onRemoveFood={handleRemoveFood}
              />

              <MealCard
                mealType="lunch"
                title="Lunch"
                items={lunchItems}
                onAddFood={handleOpenAddFood}
                onRemoveFood={handleRemoveFood}
              />

              <MealCard
                mealType="dinner"
                title="Dinner"
                items={dinnerItems}
                onAddFood={handleOpenAddFood}
                onRemoveFood={handleRemoveFood}
              />

              <MealCard
                mealType="snack"
                title="Snacks"
                items={snackItems}
                onAddFood={handleOpenAddFood}
                onRemoveFood={handleRemoveFood}
              />
            </div>

            {/* Water Tracker */}
            <div className="pt-1">
              <WaterTracker
                waterMl={currentDayData.waterMl}
                goalMl={goals.waterGoalMl}
                onUpdateWater={handleUpdateWater}
              />
            </div>
          </>
        )}

        {activeTab === 'pantry' && (
          <PantryIngredientsView
            onLogToDiary={(item) => {
              handleLogFood(item);
            }}
            onAskChef={(ingName) => {
              setChatInitialPrompt(ingName);
              setActiveTab('chat');
            }}
          />
        )}

        {activeTab === 'chat' && (
          <GeminiChatView
            pantryIngredients={pantryIngredients}
            goals={goals}
            remainingCalories={remainingCalories}
            initialPrompt={chatInitialPrompt}
            onLogMeal={(item) => {
              handleLogFood(item);
            }}
          />
        )}

        {activeTab === 'trends' && (
          <TrendsView goals={goals} todayCalories={totalCalories} />
        )}

        {activeTab === 'profile' && (
          <ProfileView goals={goals} onSaveGoals={handleSaveGoals} />
        )}
      </div>

      {/* Floating Bottom iOS Liquid Tab Bar */}
      <LiquidTabBar
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        onOpenQuickLog={() => handleOpenAddFood('lunch')}
      />

      {/* Food Log Modal (iOS Bottom Sheet) */}
      <FoodLogModal
        isOpen={isFoodModalOpen}
        initialMealType={modalMealType}
        onClose={() => setIsFoodModalOpen(false)}
        onLogFood={handleLogFood}
      />
    </IPhoneContainer>
  );
}
