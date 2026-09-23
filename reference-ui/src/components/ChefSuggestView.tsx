import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'motion/react';
import { Sparkles, RefreshCw, ChevronDown, Flame, Check, PlusCircle, Camera, Upload } from 'lucide-react';
import { getChefSuggestions, postPantryPhoto, ChefDish, ManualMealInput } from '../api';
import { hapticMedium, hapticSuccess, hapticWarning, hapticLight } from '../utils/haptics';
import { CameraCaptureModal } from './CameraCaptureModal';

interface ChefSuggestViewProps {
  onLogMeal: (input: ManualMealInput) => Promise<boolean>;
}

export const ChefSuggestView: React.FC<ChefSuggestViewProps> = ({ onLogMeal }) => {
  const [dishes, setDishes] = useState<ChefDish[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [loggedIdx, setLoggedIdx] = useState<number | null>(null);

  // Add-what-I-have: same pantry photo capture as the Pantry tab, so you
  // don't have to leave Chef to tell it about an ingredient you're holding.
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [isAddingPhoto, setIsAddingPhoto] = useState(false);
  const [addPhotoError, setAddPhotoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogDish = async (dish: ChefDish, idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    hapticLight();
    const ok = await onLogMeal({
      food_name: dish.name,
      calories: dish.calories,
      protein_g: dish.protein_g,
      carbs_g: dish.carbs_g,
      fat_g: dish.fat_g,
    });
    if (ok) {
      setLoggedIdx(idx);
      setTimeout(() => setLoggedIdx(null), 2000);
    }
  };

  const fetchSuggestions = useCallback(async () => {
    hapticMedium();
    setLoading(true);
    setError(null);
    try {
      const { dishes } = await getChefSuggestions();
      setDishes(dishes);
      if (dishes.length) hapticSuccess();
    } catch (err: any) {
      hapticWarning();
      setError(err.message || 'Failed to get suggestions');
    } finally {
      setLoading(false);
      setHasFetched(true);
    }
  }, []);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  const addIngredientPhoto = async (imageDataUrl: string) => {
    hapticMedium();
    setIsAddingPhoto(true);
    setAddPhotoError(null);
    try {
      await postPantryPhoto(imageDataUrl);
      hapticSuccess();
      await fetchSuggestions();
    } catch (err: any) {
      hapticWarning();
      setAddPhotoError(err.message || 'Failed to save ingredient');
    } finally {
      setIsAddingPhoto(false);
    }
  };

  const handleCameraCapture = (imageDataUrl: string) => {
    setShowCameraModal(false);
    addIngredientPhoto(imageDataUrl);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) addIngredientPhoto(dataUrl);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-4 pb-24 select-none">
      {/* Top Header Card */}
      <div className="liquid-glass liquid-sheen rounded-3xl p-5 border border-white/70 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none z-10" />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl liquid-droplet-dark text-white flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 tracking-tight">Gemini Chef AI</h2>
              <p className="text-[11px] text-neutral-500 font-medium">
                Suggests dishes from what's in your pantry right now
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                hapticMedium();
                setShowCameraModal(true);
              }}
              disabled={isAddingPhoto}
              className="w-9 h-9 rounded-full liquid-droplet-dark text-white flex items-center justify-center active:scale-95 transition-all shadow-md disabled:opacity-50"
              title="Snap what you have"
            >
              <Camera className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isAddingPhoto}
              className="w-9 h-9 rounded-full liquid-glass flex items-center justify-center text-neutral-800 border border-white/70 active:scale-95 transition-all disabled:opacity-50"
              title="Upload a photo of what you have"
            >
              <Upload className="w-4 h-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={fetchSuggestions}
              disabled={loading}
              className="w-9 h-9 rounded-full liquid-droplet flex items-center justify-center text-neutral-700 hover:text-neutral-900 active:scale-95 transition-all disabled:opacity-50"
              title="Refresh suggestions"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {isAddingPhoto && (
          <p className="mt-3 text-[11px] font-semibold text-neutral-600 relative z-10">
            Identifying what you have...
          </p>
        )}
      </div>

      {addPhotoError && (
        <div className="liquid-glass rounded-2xl p-4 border border-red-200 bg-red-50/60 text-xs text-red-700">
          {addPhotoError}
        </div>
      )}

      {error && (
        <div className="liquid-glass rounded-2xl p-4 border border-red-200 bg-red-50/60 text-xs text-red-700">
          {error}
        </div>
      )}

      {loading && !hasFetched ? (
        <div className="liquid-glass rounded-3xl p-8 text-center text-xs text-neutral-500">
          Asking Gemini what to cook...
        </div>
      ) : dishes.length === 0 && hasFetched && !error ? (
        <div className="liquid-glass liquid-sheen rounded-3xl p-8 text-center border border-white/70 shadow-sm">
          <h3 className="text-base font-bold text-neutral-900 tracking-tight">No suggestions yet</h3>
          <p className="text-xs text-neutral-600 max-w-xs mx-auto mt-1 leading-relaxed">
            Snap or upload a photo of what you have (top right), or add it to your Pantry, then tap refresh here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {dishes.map((dish, idx) => {
            const isOpen = expanded === idx;
            return (
              <div
                key={idx}
                className="liquid-glass liquid-sheen rounded-3xl overflow-hidden border border-white/70 shadow-sm relative"
              >
                <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-white/90 to-transparent pointer-events-none z-10" />

                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : idx)}
                  className="w-full p-4 flex items-center justify-between text-left relative z-10"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-neutral-900 tracking-tight truncate">
                      {dish.name}
                    </h3>
                    <div className="text-[11px] text-neutral-600 flex items-center gap-2 mt-0.5 font-medium">
                      <Flame className="w-3 h-3 text-amber-600" />
                      <span>{dish.calories} kcal</span>
                      <span className="text-neutral-400">•</span>
                      <span>
                        P:{dish.protein_g}g C:{dish.carbs_g}g F:{dish.fat_g}g
                      </span>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-neutral-500 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="px-4 pb-4 border-t border-white/30 relative z-10 space-y-3 pt-3"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                        Ingredients
                      </span>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {dish.ingredients_used.map((ing, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-full liquid-glass-subtle text-[11px] font-medium text-neutral-700 border border-white/50"
                          >
                            {ing}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                        Steps
                      </span>
                      <ol className="mt-1.5 space-y-1.5 list-decimal list-inside text-xs text-neutral-800 leading-relaxed">
                        {dish.steps.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ol>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleLogDish(dish, idx, e)}
                      disabled={loggedIdx === idx}
                      className="w-full py-2.5 rounded-2xl liquid-droplet-dark text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all disabled:opacity-70"
                    >
                      {loggedIdx === idx ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-300" />
                          <span>Logged to Diary</span>
                        </>
                      ) : (
                        <>
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>Log this</span>
                        </>
                      )}
                    </button>
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <CameraCaptureModal
        isOpen={showCameraModal}
        onClose={() => setShowCameraModal(false)}
        onCapture={handleCameraCapture}
      />
    </div>
  );
};
