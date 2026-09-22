import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, ChevronDown, Trash2, Coffee, Utensils, Moon, Apple } from 'lucide-react';
import { FoodItem, MealType } from '../types';
import { hapticLight, hapticMedium, hapticWarning } from '../utils/haptics';

interface MealCardProps {
  mealType: MealType;
  title: string;
  items: FoodItem[];
  onAddFood: (mealType: MealType) => void;
  onRemoveFood: (id: string) => void;
}

const mealIcons: Record<MealType, React.ReactNode> = {
  breakfast: <Coffee className="w-4 h-4 text-neutral-800" />,
  lunch: <Utensils className="w-4 h-4 text-neutral-800" />,
  dinner: <Moon className="w-4 h-4 text-neutral-800" />,
  snack: <Apple className="w-4 h-4 text-neutral-800" />,
};

export const MealCard: React.FC<MealCardProps> = ({
  mealType,
  title,
  items,
  onAddFood,
  onRemoveFood,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const totalCalories = items.reduce((sum, item) => sum + item.calories, 0);
  const totalProtein = Math.round(items.reduce((sum, item) => sum + item.protein, 0));
  const totalCarbs = Math.round(items.reduce((sum, item) => sum + item.carbs, 0));
  const totalFat = Math.round(items.reduce((sum, item) => sum + item.fat, 0));

  const handleToggleExpand = () => {
    hapticLight();
    setIsExpanded((prev) => !prev);
  };

  const handleAddClick = () => {
    hapticMedium();
    onAddFood(mealType);
  };

  const handleRemoveClick = (id: string) => {
    hapticWarning();
    onRemoveFood(id);
  };

  return (
    <div
      id={`meal-card-${mealType}`}
      className="liquid-glass liquid-sheen rounded-3xl overflow-hidden transition-all duration-300 relative border border-white/70 shadow-sm"
    >
      {/* Top razor specular edge */}
      <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-white/90 to-transparent pointer-events-none z-10" />

      {/* Top Header */}
      <div className="p-4 flex items-center justify-between relative z-10">
        <button
          type="button"
          onClick={handleToggleExpand}
          className="flex items-center gap-3 text-left focus:outline-none flex-1 group"
        >
          <div className="w-9 h-9 rounded-2xl liquid-glass-subtle flex items-center justify-center shadow-sm border border-white/60">
            {mealIcons[mealType]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-neutral-900 tracking-tight">
                {title}
              </h3>
              <span className="text-xs text-neutral-500 font-medium">
                ({items.length})
              </span>
            </div>
            <div className="text-xs text-neutral-600 flex items-center gap-2 mt-0.5 font-medium">
              <span>{totalCalories} kcal</span>
              <span className="text-neutral-400">•</span>
              <span>P:{totalProtein}g C:{totalCarbs}g F:{totalFat}g</span>
            </div>
          </div>
        </button>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleAddClick}
            className="w-8 h-8 rounded-full liquid-droplet active:scale-95 transition-all flex items-center justify-center text-neutral-800 shadow-sm"
            title={`Add food to ${title}`}
            aria-label={`Add food to ${title}`}
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleToggleExpand}
            className="w-8 h-8 rounded-full liquid-glass-subtle hover:bg-white/60 active:scale-95 transition-all flex items-center justify-center text-neutral-600"
            aria-label="Toggle meal details"
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-300 ${
                isExpanded ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Expandable Food Item List */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="border-t border-white/30 relative z-10"
          >
            {items.length === 0 ? (
              <div className="py-5 px-4 text-center">
                <p className="text-xs text-neutral-500">No items logged yet</p>
                <button
                  type="button"
                  onClick={handleAddClick}
                  className="mt-2 text-xs font-semibold text-neutral-800 hover:text-neutral-900 inline-flex items-center gap-1 liquid-droplet px-3.5 py-1.5 rounded-full"
                >
                  <Plus className="w-3 h-3" /> Log {title}
                </button>
              </div>
            ) : (
              <div className="divide-y divide-white/20">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 px-4 flex items-center justify-between hover:bg-white/25 transition-colors group"
                  >
                    <div className="flex-1 pr-3">
                      <div className="text-sm font-semibold text-neutral-900 tracking-tight">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-neutral-600 flex items-center gap-2 mt-0.5 font-medium">
                        <span>
                          {item.servingAmount} {item.servingUnit}
                        </span>
                        <span className="text-neutral-400">•</span>
                        <span>{item.calories} kcal</span>
                        <span className="text-neutral-400">•</span>
                        <span className="text-neutral-500">
                          P:{item.protein}g C:{item.carbs}g F:{item.fat}g
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-neutral-800">
                        {item.calories}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveClick(item.id)}
                        className="opacity-50 hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10 text-neutral-500 hover:text-red-600 transition-all"
                        title="Remove food item"
                        aria-label="Remove food item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
