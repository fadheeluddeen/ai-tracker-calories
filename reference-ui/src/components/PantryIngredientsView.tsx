import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, Upload, Plus, Trash2, Search, Filter, 
  Sparkles, Calendar, Utensils, Download, RefreshCw, 
  Check, AlertCircle, Eye, X, ChefHat, Layers
} from 'lucide-react';
import { CameraCaptureModal } from './CameraCaptureModal';
import { PantryIngredient, MealType } from '../types';
import { 
  getAllIngredients, saveIngredient, deleteIngredient, 
  processImageFile, exportPantryBackup, importPantryBackup 
} from '../utils/storage';
import { 
  hapticLight, hapticMedium, hapticSelection, 
  hapticSuccess, hapticWarning 
} from '../utils/haptics';

interface PantryIngredientsViewProps {
  onLogToDiary: (item: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    servingAmount: number;
    servingUnit: string;
    mealType: MealType;
  }) => void;
  onAskChef: (ingredientName: string) => void;
}

export const PantryIngredientsView: React.FC<PantryIngredientsViewProps> = ({
  onLogToDiary,
  onAskChef,
}) => {
  const [ingredients, setIngredients] = useState<PantryIngredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [inspectingPhoto, setInspectingPhoto] = useState<PantryIngredient | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [category, setCategory] = useState<PantryIngredient['category']>('produce');
  const [quantity, setQuantity] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [expiryDays, setExpiryDays] = useState('');
  const [notes, setNotes] = useState('');
  const [isAiScanning, setIsAiScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Log to Diary popup
  const [logTargetIngredient, setLogTargetIngredient] = useState<PantryIngredient | null>(null);
  const [logMealType, setLogMealType] = useState<MealType>('lunch');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const backupInputRef = useRef<HTMLInputElement>(null);

  // Handle direct camera capture
  const handleCameraCapture = (imageDataUrl: string) => {
    hapticSuccess();
    setPhotoData(imageDataUrl);
    setShowCameraModal(false);
    setShowAddModal(true);
  };

  // Load saved ingredients from IndexedDB on mount
  const loadIngredients = async () => {
    try {
      setLoading(true);
      const items = await getAllIngredients();
      setIngredients(items);
    } catch (err) {
      console.error('Failed to load ingredients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIngredients();
  }, []);

  // Handle Photo Selection & Compression
  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPEG, PNG, HEIC, WebP).');
      return;
    }
    try {
      hapticMedium();
      const compressedBase64 = await processImageFile(file);
      setPhotoData(compressedBase64);
    } catch (err) {
      console.error('Error processing photo:', err);
      alert('Could not process this image.');
    }
  };

  // AI Auto-Scan with Gemini
  const handleScanWithAI = async () => {
    if (!photoData) return;
    hapticMedium();
    setIsAiScanning(true);
    setScanMessage('Gemini AI is analyzing ingredient photo...');

    try {
      const res = await fetch('/api/analyze-ingredient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: photoData }),
      });

      if (!res.ok) {
        throw new Error('AI analysis failed');
      }

      const data = await res.json();
      hapticSuccess();
      if (data.name) setName(data.name);
      if (data.category) setCategory(data.category);
      if (data.estimatedQuantity) setQuantity(data.estimatedQuantity);
      if (data.estimatedCalories) setCalories(String(data.estimatedCalories));
      if (data.estimatedProtein) setProtein(String(data.estimatedProtein));
      if (data.estimatedCarbs) setCarbs(String(data.estimatedCarbs));
      if (data.estimatedFat) setFat(String(data.estimatedFat));
      if (data.shelfLifeDays) setExpiryDays(String(data.shelfLifeDays));
      setScanMessage(`Identified: ${data.name || 'Ingredient'}!`);
      setTimeout(() => setScanMessage(null), 3000);
    } catch (err) {
      console.error('AI scan error:', err);
      setScanMessage('Could not auto-detect. You can enter details manually.');
      setTimeout(() => setScanMessage(null), 3000);
    } finally {
      setIsAiScanning(false);
    }
  };

  // Save Ingredient Forever to IndexedDB
  const handleSaveIngredient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    hapticSuccess();
    const newIngredient: PantryIngredient = {
      id: `ing-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: name.trim(),
      photoUrl: photoData || '',
      category,
      quantity: quantity.trim() || '1 item',
      calories: calories ? Number(calories) : undefined,
      protein: protein ? Number(protein) : undefined,
      carbs: carbs ? Number(carbs) : undefined,
      fat: fat ? Number(fat) : undefined,
      dateAdded: new Date().toISOString(),
      expiryDays: expiryDays ? Number(expiryDays) : undefined,
      notes: notes.trim() || undefined,
    };

    await saveIngredient(newIngredient);
    await loadIngredients();

    // Reset modal form
    setName('');
    setPhotoData(null);
    setQuantity('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
    setExpiryDays('');
    setNotes('');
    setShowAddModal(false);
  };

  // Delete an ingredient
  const handleDeleteIngredient = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    hapticWarning();
    if (window.confirm('Delete this ingredient and its photo from permanent storage?')) {
      await deleteIngredient(id);
      await loadIngredients();
    }
  };

  // Confirm Log to Diary
  const handleConfirmLogToDiary = () => {
    if (!logTargetIngredient) return;
    hapticSuccess();
    onLogToDiary({
      name: logTargetIngredient.name,
      calories: logTargetIngredient.calories || 120,
      protein: logTargetIngredient.protein || 5,
      carbs: logTargetIngredient.carbs || 10,
      fat: logTargetIngredient.fat || 2,
      servingAmount: 1,
      servingUnit: logTargetIngredient.quantity || 'serving',
      mealType: logMealType,
    });
    setLogTargetIngredient(null);
  };

  // Backup Export/Import
  const handleExportBackup = async () => {
    hapticMedium();
    await exportPantryBackup();
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      hapticMedium();
      const count = await importPantryBackup(file);
      hapticSuccess();
      alert(`Successfully restored ${count} ingredients and photos to permanent storage!`);
      await loadIngredients();
    } catch {
      alert('Failed to import backup file.');
    }
  };

  // Filtered ingredients
  const filteredIngredients = ingredients.filter((ing) => {
    const matchesCategory = selectedCategory === 'all' || ing.category === selectedCategory;
    const matchesSearch = ing.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ing.notes && ing.notes.toLowerCase().includes(searchQuery.toLowerCase()));
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
            <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
              My Ingredients
            </h2>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-neutral-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span>{ingredients.length} items saved permanently in device storage</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                hapticMedium();
                setShowCameraModal(true);
              }}
              className="liquid-droplet-dark text-white px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all shadow-md hover:brightness-110"
              title="Capture ingredient photo using camera"
            >
              <Camera className="w-4 h-4" />
              <span>Camera</span>
            </button>
            <button
              type="button"
              onClick={() => {
                hapticMedium();
                setShowAddModal(true);
              }}
              className="liquid-glass text-neutral-800 border border-white/70 px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all shadow-sm hover:bg-white/80"
              title="Add ingredient manually or from files"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>
        </div>

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

          {/* Category Scroller */}
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

        {/* Permanent Backup Controls */}
        <div className="pt-3 mt-3 border-t border-white/30 flex items-center justify-between text-[11px] text-neutral-600 relative z-10">
          <span className="font-semibold text-neutral-700">Durable Storage: Active</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportBackup}
              className="liquid-glass-subtle px-2.5 py-1 rounded-xl text-neutral-800 font-bold hover:bg-white/80 transition-all flex items-center gap-1 border border-white/60"
              title="Download backup file with all photos & data"
            >
              <Download className="w-3 h-3 text-neutral-600" />
              <span>Backup</span>
            </button>
            <button
              type="button"
              onClick={() => backupInputRef.current?.click()}
              className="liquid-glass-subtle px-2.5 py-1 rounded-xl text-neutral-800 font-bold hover:bg-white/80 transition-all flex items-center gap-1 border border-white/60"
              title="Import previously saved backup"
            >
              <Upload className="w-3 h-3 text-neutral-600" />
              <span>Restore</span>
            </button>
            <input
              type="file"
              ref={backupInputRef}
              onChange={handleImportBackup}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Grid of Saved Ingredients */}
      {loading ? (
        <div className="liquid-glass rounded-3xl p-8 text-center text-xs text-neutral-500">
          Loading your ingredients from durable storage...
        </div>
      ) : filteredIngredients.length === 0 ? (
        <div className="liquid-glass liquid-sheen rounded-3xl p-8 text-center border border-white/70 shadow-sm relative overflow-hidden">
          <div className="w-14 h-14 rounded-3xl liquid-droplet mx-auto flex items-center justify-center text-neutral-700 mb-3 shadow-inner">
            <Camera className="w-6 h-6 stroke-[1.8]" />
          </div>
          <h3 className="text-base font-bold text-neutral-900 tracking-tight">
            No ingredients yet
          </h3>
          <p className="text-xs text-neutral-600 max-w-xs mx-auto mt-1 leading-relaxed">
            Take or upload photos of your groceries, vegetables, and pantry items. They are saved permanently right here so you can check what you have and cook with them anytime!
          </p>
          <button
            type="button"
            onClick={() => {
              hapticMedium();
              setShowAddModal(true);
            }}
            className="mt-4 liquid-droplet-dark text-white px-5 py-2.5 rounded-2xl text-xs font-bold inline-flex items-center gap-1.5 active:scale-95 transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Your First Ingredient</span>
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

              {/* Ingredient Photo Thumbnail */}
              <div className="relative w-full aspect-square rounded-xl overflow-hidden liquid-glass-subtle mb-2.5 border border-white/60 bg-neutral-100 flex items-center justify-center">
                {item.photoUrl ? (
                  <img
                    src={item.photoUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="text-neutral-400 flex flex-col items-center">
                    <Utensils className="w-6 h-6 stroke-[1.5]" />
                    <span className="text-[10px] mt-1">No photo</span>
                  </div>
                )}

                {/* Category Pill Tag */}
                <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full liquid-glass-thick text-[9px] font-bold capitalize text-neutral-800 border border-white/70 shadow-sm">
                  {item.category}
                </div>

                {/* Quick Delete button */}
                <button
                  type="button"
                  onClick={(e) => handleDeleteIngredient(item.id, e)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full liquid-droplet text-neutral-600 hover:text-red-600 flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity"
                  title="Delete ingredient"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>

              {/* Title & Info */}
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-neutral-900 tracking-tight truncate">
                  {item.name}
                </h4>
                <div className="flex items-center justify-between text-[11px] text-neutral-600">
                  <span className="truncate">{item.quantity}</span>
                  {item.calories ? (
                    <span className="font-semibold text-neutral-900">~{item.calories} kcal</span>
                  ) : null}
                </div>

                {/* Macro mini tags */}
                {(item.protein || item.carbs || item.fat) ? (
                  <div className="flex gap-1 text-[9px] text-neutral-500 font-medium pt-0.5">
                    {item.protein ? <span>P:{item.protein}g</span> : null}
                    {item.carbs ? <span>C:{item.carbs}g</span> : null}
                    {item.fat ? <span>F:{item.fat}g</span> : null}
                  </div>
                ) : null}
              </div>

              {/* Quick Action Buttons */}
              <div className="grid grid-cols-2 gap-1.5 mt-2.5 pt-2 border-t border-white/40">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    hapticMedium();
                    setLogTargetIngredient(item);
                  }}
                  className="py-1 px-1 rounded-xl liquid-glass-subtle text-neutral-800 text-[10px] font-bold hover:bg-white/80 transition-all flex items-center justify-center gap-1 border border-white/50"
                  title="Log to today's food diary"
                >
                  <Plus className="w-3 h-3" />
                  <span>Log</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    hapticMedium();
                    onAskChef(item.name);
                  }}
                  className="py-1 px-1 rounded-xl liquid-droplet-dark text-white text-[10px] font-bold hover:brightness-110 transition-all flex items-center justify-center gap-1"
                  title="Ask Gemini recipe with this ingredient"
                >
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>Chef AI</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD INGREDIENT & PHOTO MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                hapticLight();
                setShowAddModal(false);
              }}
              className="absolute inset-0"
            />

            <motion.div
              initial={{ y: '100%', opacity: 0.9 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0.9 }}
              transition={{ type: 'spring', damping: 28, stiffness: 350 }}
              className="relative w-full max-w-lg max-h-[90vh] flex flex-col liquid-glass-thick liquid-sheen rounded-t-[36px] sm:rounded-[36px] border border-white/80 shadow-2xl overflow-hidden z-10"
            >
              <div className="absolute top-0 left-6 right-6 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none z-20" />

              {/* Grabber */}
              <div className="w-full pt-3 pb-1 flex justify-center cursor-grab relative z-10">
                <div className="w-10 h-1 bg-neutral-400/60 rounded-full" />
              </div>

              {/* Modal Header */}
              <div className="px-5 py-3 flex items-center justify-between border-b border-white/30 relative z-10">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                    Permanent Storage
                  </span>
                  <h3 className="text-lg font-bold text-neutral-900 tracking-tight">
                    Add Ingredient & Photo
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    hapticLight();
                    setShowAddModal(false);
                  }}
                  className="w-8 h-8 rounded-full liquid-droplet flex items-center justify-center text-neutral-700 hover:text-neutral-900 active:scale-95"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSaveIngredient} className="p-5 overflow-y-auto no-scrollbar space-y-4 flex-1">
                {/* Photo Dropzone / Camera / Upload Box */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-neutral-700">
                      Ingredient Photo
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        hapticMedium();
                        setShowCameraModal(true);
                      }}
                      className="text-[10px] font-bold text-neutral-800 flex items-center gap-1 px-2 py-0.5 rounded-lg liquid-glass-subtle border border-white/60 active:scale-95 transition-all"
                    >
                      <Camera className="w-3 h-3" />
                      <span>Take Photo</span>
                    </button>
                  </div>

                  {photoData ? (
                    <div className="relative rounded-2xl overflow-hidden border border-white/80 liquid-glass-subtle shadow-inner aspect-video max-h-52 w-full flex items-center justify-center bg-black/5">
                      <img
                        src={photoData}
                        alt="Preview"
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute bottom-2 right-2 flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            hapticMedium();
                            setShowCameraModal(true);
                          }}
                          className="px-2.5 py-1 rounded-xl liquid-droplet-dark text-white text-xs font-bold shadow-md hover:brightness-110 flex items-center gap-1"
                        >
                          <Camera className="w-3 h-3" />
                          <span>Retake</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-2.5 py-1 rounded-xl liquid-glass text-xs font-bold text-neutral-800 shadow-sm hover:bg-white/90"
                        >
                          Upload
                        </button>
                        <button
                          type="button"
                          onClick={() => setPhotoData(null)}
                          className="p-1 rounded-xl liquid-droplet text-xs text-neutral-700 hover:text-red-600 shadow-sm"
                          title="Remove photo"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Gemini Scan button overlay */}
                      <button
                        type="button"
                        onClick={handleScanWithAI}
                        disabled={isAiScanning}
                        className="absolute top-2 left-2 liquid-droplet-dark text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md hover:brightness-110 active:scale-95 transition-all"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
                        <span>{isAiScanning ? 'Analyzing...' : 'Auto-Detect with Gemini'}</span>
                      </button>
                    </div>
                  ) : (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragOver(true);
                      }}
                      onDragLeave={() => setIsDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragOver(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) handleFileSelect(file);
                      }}
                      className={`w-full py-6 px-4 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center transition-all ${
                        isDragOver
                          ? 'border-neutral-900 bg-white/60'
                          : 'border-white/80 liquid-glass-subtle'
                      }`}
                    >
                      <div className="w-11 h-11 rounded-2xl liquid-droplet flex items-center justify-center text-neutral-700 mb-2 shadow-sm">
                        <Camera className="w-5 h-5 stroke-[1.8]" />
                      </div>
                      <span className="text-xs font-bold text-neutral-800">
                        Add Ingredient Photo
                      </span>
                      <span className="text-[10px] text-neutral-500 mt-0.5 mb-3">
                        Snap directly with camera or upload image
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            hapticMedium();
                            setShowCameraModal(true);
                          }}
                          className="liquid-droplet-dark text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md hover:brightness-110 active:scale-95 transition-all"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Open Camera</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="liquid-glass text-neutral-800 border border-white/70 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-white/80 active:scale-95 transition-all"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload File</span>
                        </button>
                      </div>
                    </div>
                  )}

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file);
                    }}
                    className="hidden"
                  />

                  {scanMessage && (
                    <div className="mt-2 text-center text-xs font-semibold text-neutral-800 liquid-glass-subtle py-1.5 px-3 rounded-xl border border-white/60">
                      {scanMessage}
                    </div>
                  )}
                </div>

                {/* Ingredient Name */}
                <div>
                  <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                    Ingredient Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Fresh Hass Avocado, Greek Yogurt, Spinach"
                    className="w-full px-3.5 py-2.5 rounded-xl liquid-glass text-sm text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-800 border border-white/60"
                  />
                </div>

                {/* Category & Quantity Grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-xl liquid-glass text-xs text-neutral-900 focus:outline-none border border-white/60 capitalize"
                    >
                      <option value="produce">Produce (Fruits & Veggies)</option>
                      <option value="protein">Protein (Meat, Eggs, Tofu)</option>
                      <option value="dairy">Dairy & Milks</option>
                      <option value="grains">Grains & Bread</option>
                      <option value="pantry">Pantry & Spices</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                      Quantity / Pack
                    </label>
                    <input
                      type="text"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="e.g. 2 pcs, 500g, 1 carton"
                      className="w-full px-3.5 py-2.5 rounded-xl liquid-glass text-xs text-neutral-900 placeholder:text-neutral-500 focus:outline-none border border-white/60"
                    />
                  </div>
                </div>

                {/* Nutrition breakdown (Optional) */}
                <div className="p-3 rounded-2xl liquid-glass-subtle border border-white/60 space-y-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-neutral-800">Nutritional Estimate (Optional)</span>
                    <span className="text-[10px] text-neutral-500">Per serving</span>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <span className="text-[10px] text-neutral-500 block mb-0.5">Calories</span>
                      <input
                        type="number"
                        value={calories}
                        onChange={(e) => setCalories(e.target.value)}
                        placeholder="kcal"
                        className="w-full px-2 py-1.5 rounded-lg liquid-glass text-xs text-neutral-900 border border-white/50"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-500 block mb-0.5">Protein</span>
                      <input
                        type="number"
                        value={protein}
                        onChange={(e) => setProtein(e.target.value)}
                        placeholder="g"
                        className="w-full px-2 py-1.5 rounded-lg liquid-glass text-xs text-neutral-900 border border-white/50"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-500 block mb-0.5">Carbs</span>
                      <input
                        type="number"
                        value={carbs}
                        onChange={(e) => setCarbs(e.target.value)}
                        placeholder="g"
                        className="w-full px-2 py-1.5 rounded-lg liquid-glass text-xs text-neutral-900 border border-white/50"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-500 block mb-0.5">Fat</span>
                      <input
                        type="number"
                        value={fat}
                        onChange={(e) => setFat(e.target.value)}
                        placeholder="g"
                        className="w-full px-2 py-1.5 rounded-lg liquid-glass text-xs text-neutral-900 border border-white/50"
                      />
                    </div>
                  </div>
                </div>

                {/* Notes & Shelf-Life */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                      Shelf Life (Days)
                    </label>
                    <input
                      type="number"
                      value={expiryDays}
                      onChange={(e) => setExpiryDays(e.target.value)}
                      placeholder="e.g. 7 days"
                      className="w-full px-3.5 py-2.5 rounded-xl liquid-glass text-xs text-neutral-900 border border-white/60"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                      Notes
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. in fridge bottom shelf"
                      className="w-full px-3.5 py-2.5 rounded-xl liquid-glass text-xs text-neutral-900 border border-white/60"
                    />
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl liquid-droplet-dark text-white font-bold text-sm shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Save to Permanent Vault</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                    {inspectingPhoto.name}
                  </h3>
                  <span className="text-[11px] text-neutral-500 capitalize">
                    {inspectingPhoto.category} • {inspectingPhoto.quantity}
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

              {inspectingPhoto.photoUrl ? (
                <div className="rounded-2xl overflow-hidden border border-white/60 aspect-square w-full bg-black/10">
                  <img
                    src={inspectingPhoto.photoUrl}
                    alt={inspectingPhoto.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : null}

              {inspectingPhoto.notes ? (
                <p className="text-xs text-neutral-600 bg-white/40 p-2.5 rounded-xl border border-white/40">
                  "{inspectingPhoto.notes}"
                </p>
              ) : null}

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    hapticMedium();
                    setLogTargetIngredient(inspectingPhoto);
                    setInspectingPhoto(null);
                  }}
                  className="py-2.5 rounded-xl liquid-glass text-neutral-900 font-bold text-xs flex items-center justify-center gap-1.5 border border-white/70"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log to Diary</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    hapticMedium();
                    onAskChef(inspectingPhoto.name);
                    setInspectingPhoto(null);
                  }}
                  className="py-2.5 rounded-xl liquid-droplet-dark text-white font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Cook with AI</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QUICK LOG TO DIARY MEAL SELECTOR MODAL */}
      <AnimatePresence>
        {logTargetIngredient && (
          <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLogTargetIngredient(null)}
              className="absolute inset-0"
            />

            <motion.div
              initial={{ y: '100%', opacity: 0.9 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0.9 }}
              className="relative w-full max-w-sm liquid-glass-thick rounded-t-[32px] sm:rounded-[32px] p-5 border border-white/80 shadow-2xl z-10 space-y-4"
            >
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                    Log to Food Diary
                  </span>
                  <h3 className="font-bold text-base text-neutral-900">
                    {logTargetIngredient.name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setLogTargetIngredient(null)}
                  className="w-7 h-7 rounded-full liquid-droplet flex items-center justify-center text-neutral-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <label className="text-[11px] font-bold text-neutral-700 block mb-1.5">
                  Select Meal
                </label>
                <div className="grid grid-cols-4 gap-1 p-1 liquid-glass-subtle rounded-2xl border border-white/60">
                  {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        hapticSelection();
                        setLogMealType(m);
                      }}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold capitalize transition-all ${
                        logMealType === m
                          ? 'liquid-droplet-dark text-white shadow-sm'
                          : 'text-neutral-700 hover:text-neutral-900'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white/40 p-3 rounded-xl border border-white/40 text-xs flex justify-between">
                <span className="text-neutral-600">Nutritional value:</span>
                <span className="font-bold text-neutral-900">
                  {logTargetIngredient.calories || 120} kcal • P:{logTargetIngredient.protein || 5}g
                </span>
              </div>

              <button
                type="button"
                onClick={handleConfirmLogToDiary}
                className="w-full py-3 rounded-2xl liquid-droplet-dark text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add to {logMealType.charAt(0).toUpperCase() + logMealType.slice(1)}</span>
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
