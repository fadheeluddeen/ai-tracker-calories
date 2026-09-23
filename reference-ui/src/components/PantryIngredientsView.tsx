import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Upload, Plus, Trash2, Search, Utensils, X, Sparkles, PlusCircle, Check } from 'lucide-react';
import { CameraCaptureModal } from './CameraCaptureModal';
import { getPantry, postPantryPhoto, deletePantryItem, PantryIngredient, ManualMealInput } from '../api';
import { hapticLight, hapticMedium, hapticSelection, hapticSuccess, hapticWarning } from '../utils/haptics';

interface PantryIngredientsViewProps {
  onAskChef: () => void;
  onLogMeal: (input: ManualMealInput) => Promise<boolean>;
}

export const PantryIngredientsView: React.FC<PantryIngredientsViewProps> = ({ onAskChef, onLogMeal }) => {
  const [ingredients, setIngredients] = useState<PantryIngredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [inspectingPhoto, setInspectingPhoto] = useState<PantryIngredient | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loggedId, setLoggedId] = useState<number | null>(null);

  const handleLogIngredient = async (item: PantryIngredient, e: React.MouseEvent) => {
    e.stopPropagation();
    hapticLight();
    const ok = await onLogMeal({
      food_name: item.name || 'Pantry ingredient',
      calories: item.calories ?? 0,
      protein_g: item.protein_g ?? 0,
      carbs_g: item.carbs_g ?? 0,
      fat_g: item.fat_g ?? 0,
    });
    if (ok) {
      setLoggedId(item.id);
      setTimeout(() => setLoggedId(null), 2000);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadIngredients = async () => {
    try {
      setLoading(true);
      const { ingredients } = await getPantry();
      setIngredients(ingredients);
    } catch (err) {
      console.error('Failed to load pantry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIngredients();
  }, []);

  const uploadPhoto = async (imageDataUrl: string) => {
    hapticMedium();
    setIsSaving(true);
    setErrorMsg(null);
    try {
      await postPantryPhoto(imageDataUrl);
      hapticSuccess();
      await loadIngredients();
    } catch (err: any) {
      hapticWarning();
      setErrorMsg(err.message || 'Failed to save ingredient');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCameraCapture = (imageDataUrl: string) => {
    setShowCameraModal(false);
    uploadPhoto(imageDataUrl);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) uploadPhoto(dataUrl);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleDeleteIngredient = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    hapticWarning();
    if (!window.confirm('Delete this ingredient?')) return;
    try {
      await deletePantryItem(id);
      await loadIngredients();
    } catch (err) {
      console.error('Failed to delete ingredient:', err);
    }
  };

  const filteredIngredients = ingredients.filter((ing) => {
    const matchesCategory = selectedCategory === 'all' || ing.category === selectedCategory;
    const matchesSearch = (ing.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'produce', label: 'Produce' },
    { id: 'protein', label: 'Protein' },
    { id: 'dairy', label: 'Dairy' },
    { id: 'grains', label: 'Grains' },
    { id: 'pantry', label: 'Pantry' },
    { id: 'other', label: 'Other' },
  ];

  return (
    <div className="space-y-4 pb-24 select-none">
      {/* Top Header Card */}
      <div className="liquid-glass liquid-sheen rounded-3xl p-5 border border-white/70 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none z-10" />

        <div className="flex items-center justify-between relative z-10">
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-neutral-500">
              Kitchen & Pantry Vault
            </span>
            <h2 className="text-xl font-bold text-neutral-900 tracking-tight">My Ingredients</h2>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-neutral-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span>{ingredients.length} items saved on the server</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                hapticMedium();
                setShowCameraModal(true);
              }}
              disabled={isSaving}
              className="liquid-droplet-dark text-white px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all shadow-md hover:brightness-110 disabled:opacity-50"
              title="Capture ingredient photo using camera"
            >
              <Camera className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Camera'}</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSaving}
              className="liquid-glass text-neutral-800 border border-white/70 px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all shadow-sm hover:bg-white/80 disabled:opacity-50"
              title="Upload photo from files"
            >
              <Upload className="w-4 h-4" />
              <span>Upload</span>
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
          </div>
        </div>

        {errorMsg && (
          <div className="mt-3 p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 relative z-10">
            {errorMsg}
          </div>
        )}

        {/* Search & Category Filter */}
        <div className="mt-4 space-y-2.5 relative z-10">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search saved ingredients..."
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl liquid-glass text-xs text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-800 transition-all border border-white/60"
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

          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  hapticSelection();
                  setSelectedCategory(c.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === c.id
                    ? 'liquid-droplet-dark text-white shadow-sm'
                    : 'liquid-glass-subtle text-neutral-700 hover:text-neutral-900 border border-white/50'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Saved Ingredients */}
      {loading ? (
        <div className="liquid-glass rounded-3xl p-8 text-center text-xs text-neutral-500">
          Loading your ingredients...
        </div>
      ) : filteredIngredients.length === 0 ? (
        <div className="liquid-glass liquid-sheen rounded-3xl p-8 text-center border border-white/70 shadow-sm relative overflow-hidden">
          <div className="w-14 h-14 rounded-3xl liquid-droplet mx-auto flex items-center justify-center text-neutral-700 mb-3 shadow-inner">
            <Camera className="w-6 h-6 stroke-[1.8]" />
          </div>
          <h3 className="text-base font-bold text-neutral-900 tracking-tight">No ingredients yet</h3>
          <p className="text-xs text-neutral-600 max-w-xs mx-auto mt-1 leading-relaxed">
            Take or upload photos of your groceries. Gemini identifies them and estimates nutrition
            automatically.
          </p>
          <button
            type="button"
            onClick={() => {
              hapticMedium();
              setShowCameraModal(true);
            }}
            className="mt-4 liquid-droplet-dark text-white px-5 py-2.5 rounded-2xl text-xs font-bold inline-flex items-center gap-1.5 active:scale-95 transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Add Your First Ingredient</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filteredIngredients.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                hapticLight();
                setInspectingPhoto(item);
              }}
              className="liquid-glass liquid-sheen rounded-2xl p-2.5 flex flex-col justify-between border border-white/70 shadow-sm hover:border-neutral-400 transition-all cursor-pointer group relative overflow-hidden"
            >
              <div className="absolute top-0 left-3 right-3 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none z-10" />

              <div className="relative w-full aspect-square rounded-xl overflow-hidden liquid-glass-subtle mb-2.5 border border-white/60 bg-neutral-100 flex items-center justify-center">
                {item.photo_disk_path ? (
                  <img
                    src={`/${item.photo_disk_path}`}
                    alt={item.name || 'ingredient'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="text-neutral-400 flex flex-col items-center">
                    <Utensils className="w-6 h-6 stroke-[1.5]" />
                    <span className="text-[10px] mt-1">No photo</span>
                  </div>
                )}

                <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full liquid-glass-thick text-[9px] font-bold capitalize text-neutral-800 border border-white/70 shadow-sm">
                  {item.category || 'other'}
                </div>

                <button
                  type="button"
                  onClick={(e) => handleDeleteIngredient(item.id, e)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full liquid-droplet text-neutral-600 hover:text-red-600 flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity"
                  title="Delete ingredient"
                >
                  <Trash2 className="w-3 h-3" />
                </button>

                <button
                  type="button"
                  onClick={(e) => handleLogIngredient(item, e)}
                  disabled={loggedId === item.id}
                  className="absolute bottom-1.5 right-1.5 w-6 h-6 rounded-full liquid-droplet-dark text-white flex items-center justify-center shadow-sm disabled:opacity-80"
                  title="Log this to today's diary"
                >
                  {loggedId === item.id ? <Check className="w-3 h-3" /> : <PlusCircle className="w-3 h-3" />}
                </button>
              </div>

              <div className="space-y-1">
                <h4 className="text-xs font-bold text-neutral-900 tracking-tight truncate">
                  {item.name || 'Unidentified'}
                </h4>
                <div className="flex items-center justify-between text-[11px] text-neutral-600">
                  <span className="truncate">{item.quantity || ''}</span>
                  {item.calories ? (
                    <span className="font-semibold text-neutral-900">~{item.calories} kcal</span>
                  ) : null}
                </div>
                {(item.protein_g || item.carbs_g || item.fat_g) ? (
                  <div className="flex gap-1 text-[9px] text-neutral-500 font-medium pt-0.5">
                    {item.protein_g ? <span>P:{item.protein_g}g</span> : null}
                    {item.carbs_g ? <span>C:{item.carbs_g}g</span> : null}
                    {item.fat_g ? <span>F:{item.fat_g}g</span> : null}
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FULL PHOTO INSPECT MODAL */}
      <AnimatePresence>
        {inspectingPhoto && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                hapticLight();
                setInspectingPhoto(null);
              }}
              className="absolute inset-0"
            />

            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="relative max-w-sm w-full liquid-glass-thick rounded-[32px] p-4 border border-white/80 shadow-2xl z-10 overflow-hidden space-y-3"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-base text-neutral-900">
                    {inspectingPhoto.name || 'Unidentified'}
                  </h3>
                  <span className="text-[11px] text-neutral-500 capitalize">
                    {inspectingPhoto.category || 'other'} • {inspectingPhoto.quantity || ''}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    hapticLight();
                    setInspectingPhoto(null);
                  }}
                  className="w-8 h-8 rounded-full liquid-droplet flex items-center justify-center text-neutral-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {inspectingPhoto.photo_disk_path ? (
                <div className="rounded-2xl overflow-hidden border border-white/60 aspect-square w-full bg-black/10">
                  <img
                    src={`/${inspectingPhoto.photo_disk_path}`}
                    alt={inspectingPhoto.name || 'ingredient'}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : null}

              <div className="grid grid-cols-4 gap-2 text-center text-xs bg-white/40 p-2.5 rounded-xl border border-white/40">
                <div>
                  <div className="text-[10px] text-neutral-500">Calories</div>
                  <div className="font-bold text-neutral-900">{inspectingPhoto.calories ?? '—'}</div>
                </div>
                <div>
                  <div className="text-[10px] text-neutral-500">Protein</div>
                  <div className="font-semibold text-neutral-800">{inspectingPhoto.protein_g ?? '—'}g</div>
                </div>
                <div>
                  <div className="text-[10px] text-neutral-500">Carbs</div>
                  <div className="font-semibold text-neutral-800">{inspectingPhoto.carbs_g ?? '—'}g</div>
                </div>
                <div>
                  <div className="text-[10px] text-neutral-500">Fat</div>
                  <div className="font-semibold text-neutral-800">{inspectingPhoto.fat_g ?? '—'}g</div>
                </div>
              </div>

              {inspectingPhoto.expiry_days != null && (
                <p className="text-xs text-neutral-600 text-center">
                  Estimated shelf life: ~{inspectingPhoto.expiry_days} days
                </p>
              )}

              <button
                type="button"
                onClick={() => {
                  hapticMedium();
                  setInspectingPhoto(null);
                  onAskChef();
                }}
                className="w-full py-2.5 rounded-xl liquid-droplet-dark text-white font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Get Recipe Ideas from Pantry</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DIRECT INGREDIENT CAMERA CAPTURE MODAL */}
      <CameraCaptureModal
        isOpen={showCameraModal}
        onClose={() => setShowCameraModal(false)}
        onCapture={handleCameraCapture}
      />
    </div>
  );
};
