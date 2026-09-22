import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Sparkles, RefreshCw, ChevronDown, Flame } from 'lucide-react';
import { getChefSuggestions, ChefDish } from '../api';
import { hapticMedium, hapticSuccess, hapticWarning } from '../utils/haptics';

export const ChefSuggestView: React.FC = () => {
  const [dishes, setDishes] = useState<ChefDish[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);

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
            Add some ingredients to your Pantry, then tap refresh here.
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
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
