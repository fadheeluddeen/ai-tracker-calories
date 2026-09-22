import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Search, Plus, Check, ScanBarcode, 
  Sparkles, Coffee, Utensils, Moon, Apple, Camera
} from 'lucide-react';
import { FoodItem, MealType, PresetFood } from '../types';
import { POPULAR_FOODS } from '../data/mockFoods';
import { 
  hapticLight, hapticMedium, hapticSelection, hapticSuccess 
} from '../utils/haptics';

interface FoodLogModalProps {
  isOpen: boolean;
  initialMealType: MealType;
  onClose: () => void;
  onLogFood: (item: Omit<FoodItem, 'id' | 'loggedAt'>) => void;
}

export const FoodLogModal: React.FC<FoodLogModalProps> = ({
  isOpen,
  initialMealType,
  onClose,
  onLogFood,
}) => {
  const [activeTab, setActiveTab] = useState<'search' | 'custom' | 'scan'>('search');
  const [selectedMeal, setSelectedMeal] = useState<MealType>(initialMealType);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<PresetFood | null>(null);
  const [servingMultiplier, setServingMultiplier] = useState(1);

  // Custom food fields
  const [customName, setCustomName] = useState('');
  const [customCalories, setCustomCalories] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFat, setCustomFat] = useState('');
  const [customUnit, setCustomUnit] = useState('serving');

  // Barcode scanner simulation state
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<PresetFood | null>(null);

  const filteredFoods = POPULAR_FOODS.filter((food) =>
    food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    food.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleClose = () => {
    hapticLight();
    onClose();
  };

  const handleMealChange = (m: MealType) => {
    hapticSelection();
    setSelectedMeal(m);
  };

  const handleTabChange = (t: 'search' | 'custom' | 'scan') => {
    hapticSelection();
    setActiveTab(t);
  };

  const handleSelectFoodItem = (food: PresetFood) => {
    hapticLight();
    setSelectedFood(food);
    setServingMultiplier(1);
  };

  const handleMultiplierChange = (factor: number) => {
    hapticSelection();
    setServingMultiplier(factor);
  };

  const handleLogPreset = (food: PresetFood) => {
    hapticSuccess();
    onLogFood({
      name: food.name,
      calories: Math.round(food.calories * servingMultiplier),
      protein: Math.round(food.protein * servingMultiplier * 10) / 10,
      carbs: Math.round(food.carbs * servingMultiplier * 10) / 10,
      fat: Math.round(food.fat * servingMultiplier * 10) / 10,
      servingAmount: Math.round(food.defaultServing * servingMultiplier * 10) / 10,
      servingUnit: food.unit,
      mealType: selectedMeal,
    });
    onClose();
  };

  const handleLogCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName || !customCalories) return;

    hapticSuccess();
    onLogFood({
      name: customName.trim(),
      calories: Number(customCalories) || 0,
      protein: Number(customProtein) || 0,
      carbs: Number(customCarbs) || 0,
      fat: Number(customFat) || 0,
      servingAmount: 1,
      servingUnit: customUnit.trim() || 'serving',
      mealType: selectedMeal,
    });

    // Reset
    setCustomName('');
    setCustomCalories('');
    setCustomProtein('');
    setCustomCarbs('');
    setCustomFat('');
    onClose();
  };

  const handleSimulateScan = () => {
    hapticMedium();
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      const randomFood = POPULAR_FOODS[Math.floor(Math.random() * POPULAR_FOODS.length)];
      setScanResult(randomFood);
      setSelectedFood(randomFood);
      hapticSuccess();
    }, 1400);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-md">
        {/* Backdrop click */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0"
        />

        {/* Liquid Glass Bottom Sheet Modal */}
        <motion.div
          initial={{ y: '100%', opacity: 0.9 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0.9 }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          className="relative w-full max-h-[85%] flex flex-col liquid-glass-thick liquid-sheen rounded-t-[36px] border-t border-x border-white/80 shadow-2xl overflow-hidden z-10"
          id="food-log-modal"
        >
          {/* Top razor specular edge */}
          <div className="absolute top-0 left-6 right-6 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none z-20" />

          {/* Top iOS Grabber Bar */}
          <div className="w-full pt-3 pb-1 flex justify-center cursor-grab relative z-10">
            <div className="w-10 h-1 bg-neutral-400/60 rounded-full" />
          </div>

          {/* Modal Header */}
          <div className="px-5 py-3 flex items-center justify-between border-b border-white/30 relative z-10">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                Log Nutrition
              </span>
              <h3 className="text-lg font-bold text-neutral-900 tracking-tight">
                Add Food
              </h3>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="w-8 h-8 rounded-full liquid-droplet flex items-center justify-center text-neutral-700 hover:text-neutral-900 active:scale-95"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Meal Target Segmented Control */}
          <div className="px-5 pt-3 relative z-10">
            <div className="grid grid-cols-4 gap-1 p-1 liquid-glass-subtle rounded-2xl border border-white/60">
              {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleMealChange(m)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold capitalize transition-all ${
                    selectedMeal === m
                      ? 'liquid-droplet-dark text-white shadow-sm'
                      : 'text-neutral-700 hover:text-neutral-900'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Sub Navigation: Search vs Custom vs Scan */}
          <div className="px-5 pt-3">
            <div className="flex border-b border-white/20 gap-4 text-xs font-semibold">
              <button
                type="button"
                onClick={() => handleTabChange('search')}
                className={`pb-2 transition-colors relative ${
                  activeTab === 'search' ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                Food Database
                {activeTab === 'search' && (
                  <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900" />
                )}
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('custom')}
                className={`pb-2 transition-colors relative ${
                  activeTab === 'custom' ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                Custom Food
                {activeTab === 'custom' && (
                  <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900" />
                )}
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('scan')}
                className={`pb-2 transition-colors relative flex items-center gap-1 ${
                  activeTab === 'scan' ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                <ScanBarcode className="w-3.5 h-3.5" />
                Barcode Scan
                {activeTab === 'scan' && (
                  <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900" />
                )}
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-5 overflow-y-auto no-scrollbar flex-1">
            {activeTab === 'search' && (
              <div className="space-y-4">
                {/* Search Field */}
                <div className="relative">
                  <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search foods, meals, ingredients..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-2xl liquid-glass text-sm text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-800 transition-all border border-white/60"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Selected Food Detail Preview (if chosen) */}
                {selectedFood ? (
                  <div className="liquid-glass rounded-2xl p-4 border border-neutral-900/20 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold text-neutral-500 uppercase">
                          Selected Item
                        </span>
                        <h4 className="font-bold text-neutral-900 text-base">
                          {selectedFood.name}
                        </h4>
                        <span className="text-xs text-neutral-600">
                          {selectedFood.category}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          hapticLight();
                          setSelectedFood(null);
                        }}
                        className="text-xs text-neutral-500 hover:text-neutral-800"
                      >
                        Change
                      </button>
                    </div>

                    {/* Portion multiplier pills */}
                    <div>
                      <span className="text-[11px] font-semibold text-neutral-700 block mb-1.5">
                        Serving Quantity: ({Math.round(selectedFood.defaultServing * servingMultiplier)} {selectedFood.unit})
                      </span>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[0.5, 1, 1.5, 2].map((factor) => (
                          <button
                            key={factor}
                            type="button"
                            onClick={() => handleMultiplierChange(factor)}
                            className={`py-1 rounded-xl text-xs font-semibold border transition-all ${
                              servingMultiplier === factor
                                ? 'bg-neutral-900 text-white border-neutral-900'
                                : 'liquid-glass-subtle text-neutral-700 border-white/40 hover:bg-white/60'
                            }`}
                          >
                            {factor}x
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Calculated Macro Summary */}
                    <div className="grid grid-cols-4 gap-2 pt-1 border-t border-white/30 text-center text-xs">
                      <div>
                        <div className="text-[10px] text-neutral-500">Calories</div>
                        <div className="font-bold text-neutral-900 text-sm">
                          {Math.round(selectedFood.calories * servingMultiplier)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-neutral-500">Protein</div>
                        <div className="font-semibold text-neutral-800">
                          {Math.round(selectedFood.protein * servingMultiplier)}g
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-neutral-500">Carbs</div>
                        <div className="font-semibold text-neutral-800">
                          {Math.round(selectedFood.carbs * servingMultiplier)}g
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-neutral-500">Fat</div>
                        <div className="font-semibold text-neutral-800">
                          {Math.round(selectedFood.fat * servingMultiplier)}g
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleLogPreset(selectedFood)}
                      className="w-full py-3 bg-neutral-900 text-white font-semibold text-sm rounded-2xl hover:bg-neutral-800 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add to {selectedMeal.charAt(0).toUpperCase() + selectedMeal.slice(1)}
                    </button>
                  </div>
                ) : (
                  /* Food list */
                  <div className="space-y-1.5 divide-y divide-white/20">
                    {filteredFoods.map((food) => (
                      <button
                        key={food.id}
                        type="button"
                        onClick={() => handleSelectFoodItem(food)}
                        className="w-full pt-2 pb-2 px-2 text-left flex items-center justify-between hover:bg-white/30 rounded-xl transition-colors group"
                      >
                        <div>
                          <div className="text-sm font-semibold text-neutral-900">
                            {food.name}
                          </div>
                          <div className="text-[11px] text-neutral-500">
                            {food.defaultServing} {food.unit} • P:{food.protein}g C:{food.carbs}g F:{food.fat}g
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-neutral-800">
                            {food.calories} kcal
                          </span>
                          <span className="w-6 h-6 rounded-full liquid-glass-subtle flex items-center justify-center text-neutral-600 group-hover:bg-neutral-900 group-hover:text-white transition-all">
                            <Plus className="w-3 h-3" />
                          </span>
                        </div>
                      </button>
                    ))}
                    {filteredFoods.length === 0 && (
                      <div className="text-center py-8 text-neutral-500 text-xs">
                        No foods matching "{searchQuery}". Try switching to the <strong>Custom Food</strong> tab to add it!
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'custom' && (
              <form onSubmit={handleLogCustom} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Food Name
                  </label>
                  <input
                    type="text"
                    required
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g. Homemade Sourdough Pizza"
                    className="w-full px-3 py-2 rounded-xl liquid-glass text-sm text-neutral-900 border border-white/60 focus:outline-none focus:ring-1 focus:ring-neutral-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
                      Calories (kcal)
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={customCalories}
                      onChange={(e) => setCustomCalories(e.target.value)}
                      placeholder="e.g. 450"
                      className="w-full px-3 py-2 rounded-xl liquid-glass text-sm text-neutral-900 border border-white/60 focus:outline-none focus:ring-1 focus:ring-neutral-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
                      Serving Unit
                    </label>
                    <input
                      type="text"
                      value={customUnit}
                      onChange={(e) => setCustomUnit(e.target.value)}
                      placeholder="e.g. 2 slices, 1 cup"
                      className="w-full px-3 py-2 rounded-xl liquid-glass text-sm text-neutral-900 border border-white/60 focus:outline-none focus:ring-1 focus:ring-neutral-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                      Protein (g)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={customProtein}
                      onChange={(e) => setCustomProtein(e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-2 rounded-xl liquid-glass text-sm text-neutral-900 border border-white/60 focus:outline-none focus:ring-1 focus:ring-neutral-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                      Carbs (g)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={customCarbs}
                      onChange={(e) => setCustomCarbs(e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-2 rounded-xl liquid-glass text-sm text-neutral-900 border border-white/60 focus:outline-none focus:ring-1 focus:ring-neutral-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                      Fat (g)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={customFat}
                      onChange={(e) => setCustomFat(e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-2 rounded-xl liquid-glass text-sm text-neutral-900 border border-white/60 focus:outline-none focus:ring-1 focus:ring-neutral-800"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-3 bg-neutral-900 text-white font-semibold text-sm rounded-2xl hover:bg-neutral-800 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  Save and Log to {selectedMeal}
                </button>
              </form>
            )}

            {activeTab === 'scan' && (
              <div className="text-center py-4 space-y-4">
                <div className="relative mx-auto w-48 h-48 rounded-3xl liquid-glass-thick border border-white/80 overflow-hidden flex flex-col items-center justify-center p-4">
                  {/* Camera lens corner frame indicators */}
                  <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-neutral-800 rounded-tl-sm" />
                  <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-neutral-800 rounded-tr-sm" />
                  <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-neutral-800 rounded-bl-sm" />
                  <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-neutral-800 rounded-br-sm" />

                  {isScanning ? (
                    <motion.div
                      animate={{ y: [-40, 40, -40] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                      className="w-full h-0.5 bg-neutral-800/80 shadow-sm"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-neutral-600">
                      <Camera className="w-8 h-8 mb-2 opacity-80" />
                      <span className="text-[11px] font-medium">Align packaging barcode</span>
                    </div>
                  )}
                </div>

                {scanResult ? (
                  <div className="liquid-glass rounded-2xl p-3 border border-neutral-900/20 text-left">
                    <span className="text-[10px] font-bold text-neutral-500 uppercase">Product Recognized</span>
                    <div className="text-sm font-bold text-neutral-900">{scanResult.name}</div>
                    <div className="text-xs text-neutral-600 mb-2">
                      {scanResult.calories} kcal • P:{scanResult.protein}g C:{scanResult.carbs}g F:{scanResult.fat}g
                    </div>
                    <button
                      type="button"
                      onClick={() => handleLogPreset(scanResult)}
                      className="w-full py-2 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800"
                    >
                      Log Scanned Item
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleSimulateScan}
                    disabled={isScanning}
                    className="w-full py-3 bg-neutral-900 text-white font-semibold text-sm rounded-2xl hover:bg-neutral-800 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <ScanBarcode className="w-4 h-4" />
                    {isScanning ? 'Reading Barcode Optics...' : 'Scan Packaged Food Barcode'}
                  </button>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
