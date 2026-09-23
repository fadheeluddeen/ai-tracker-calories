import React, { useState } from 'react';
import { UserGoals } from '../types';
import { Sliders, Check, Target, Lock, Unlock, KeyRound, AlertTriangle } from 'lucide-react';
import { DEFAULT_GOALS } from '../constants';
import { getSettings, setGeminiKey, SettingsInfo } from '../api';
import { hapticSelection, hapticSuccess, hapticWarning } from '../utils/haptics';

interface ProfileViewProps {
  goals: UserGoals;
  onSaveGoals: (updated: UserGoals) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ goals, onSaveGoals }) => {
  const [currentGoals, setCurrentGoals] = useState<UserGoals>(goals);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Gemini settings (PIN gated) — folded in from the old standalone settings.html page
  const [pin, setPin] = useState('');
  const [pinUnlocked, setPinUnlocked] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [settingsInfo, setSettingsInfo] = useState<SettingsInfo | null>(null);
  const [newKey, setNewKey] = useState('');
  const [keySaveResult, setKeySaveResult] = useState<{ ok: boolean; message: string } | null>(null);

  const handleUnlockSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);
    try {
      const info = await getSettings(pin);
      setSettingsInfo(info);
      setPinUnlocked(true);
      hapticSuccess();
    } catch (err: any) {
      hapticWarning();
      setPinError(err.message || 'Failed to unlock settings');
    }
  };

  const handleSaveGeminiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim()) return;
    setKeySaveResult(null);
    try {
      const info = await setGeminiKey(pin, newKey.trim());
      setSettingsInfo(info);
      setNewKey('');
      setKeySaveResult({ ok: true, message: 'Saved — no restart needed.' });
      hapticSuccess();
    } catch (err: any) {
      hapticWarning();
      setKeySaveResult({ ok: false, message: err.message || 'Failed to save key' });
    }
  };

  const handlePresetSelect = (type: 'cut' | 'maintain' | 'bulk') => {
    hapticSelection();
    if (type === 'cut') {
      setCurrentGoals({
        calories: 1850,
        protein: 155,
        carbs: 180,
        fat: 55,
      });
    } else if (type === 'maintain') {
      setCurrentGoals(DEFAULT_GOALS);
    } else if (type === 'bulk') {
      setCurrentGoals({
        calories: 2600,
        protein: 170,
        carbs: 310,
        fat: 75,
      });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    hapticSuccess();
    onSaveGoals(currentGoals);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-4 pb-20 select-none">
      {/* Header card */}
      <div className="liquid-glass liquid-sheen rounded-3xl p-5 border border-white/70 shadow-sm relative overflow-hidden">
        {/* Top razor specular edge */}
        <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none z-10" />

        <div className="flex items-center justify-between mb-3 relative z-10">
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-neutral-500">
              Personalized Plan
            </span>
            <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
              Nutrition Targets
            </h2>
          </div>
          <div className="w-9 h-9 rounded-2xl liquid-glass-subtle flex items-center justify-center text-neutral-800 border border-white/60">
            <Sliders className="w-4 h-4" />
          </div>
        </div>

        {/* Goal Preset Selectors */}
        <div className="grid grid-cols-3 gap-2 mt-4 relative z-10">
          <button
            type="button"
            onClick={() => handlePresetSelect('cut')}
            className="p-2.5 rounded-2xl liquid-droplet hover:bg-white/90 text-left transition-all"
          >
            <span className="text-[10px] font-bold uppercase text-neutral-500 block">Cut</span>
            <span className="text-xs font-bold text-neutral-900">Deficit</span>
            <span className="text-[10px] text-neutral-600 block mt-0.5">1,850 kcal</span>
          </button>
          <button
            type="button"
            onClick={() => handlePresetSelect('maintain')}
            className="p-2.5 rounded-2xl liquid-droplet hover:bg-white/90 text-left transition-all"
          >
            <span className="text-[10px] font-bold uppercase text-neutral-500 block">Balanced</span>
            <span className="text-xs font-bold text-neutral-900">Maintain</span>
            <span className="text-[10px] text-neutral-600 block mt-0.5">2,150 kcal</span>
          </button>
          <button
            type="button"
            onClick={() => handlePresetSelect('bulk')}
            className="p-2.5 rounded-2xl liquid-droplet hover:bg-white/90 text-left transition-all"
          >
            <span className="text-[10px] font-bold uppercase text-neutral-500 block">Gain</span>
            <span className="text-xs font-bold text-neutral-900">Surplus</span>
            <span className="text-[10px] text-neutral-600 block mt-0.5">2,600 kcal</span>
          </button>
        </div>
      </div>

      {/* Target Config Form */}
      <form onSubmit={handleSave} className="liquid-glass liquid-sheen rounded-3xl p-5 border border-white/70 shadow-sm space-y-4 relative overflow-hidden">
        {/* Top razor specular edge */}
        <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none z-10" />

        <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2 relative z-10">
          <Target className="w-4 h-4 text-neutral-700" />
          Daily Baseline Goals
        </h3>

        {/* Daily Calories */}
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-1 text-xs">
            <span className="font-semibold text-neutral-800">Daily Calorie Target</span>
            <span className="font-bold text-neutral-900">{currentGoals.calories} kcal</span>
          </div>
          <input
            type="range"
            min="1200"
            max="4000"
            step="50"
            value={currentGoals.calories}
            onChange={(e) => setCurrentGoals({ ...currentGoals, calories: Number(e.target.value) })}
            className="w-full accent-neutral-900 h-1.5 bg-neutral-300 rounded-lg cursor-pointer"
          />
        </div>

        {/* Protein */}
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-1 text-xs">
            <span className="font-semibold text-neutral-800">Protein Target</span>
            <span className="font-bold text-neutral-900">{currentGoals.protein}g</span>
          </div>
          <input
            type="range"
            min="50"
            max="300"
            step="5"
            value={currentGoals.protein}
            onChange={(e) => setCurrentGoals({ ...currentGoals, protein: Number(e.target.value) })}
            className="w-full accent-neutral-900 h-1.5 bg-neutral-300 rounded-lg cursor-pointer"
          />
        </div>

        {/* Carbs */}
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-1 text-xs">
            <span className="font-semibold text-neutral-800">Carbohydrate Target</span>
            <span className="font-bold text-neutral-900">{currentGoals.carbs}g</span>
          </div>
          <input
            type="range"
            min="50"
            max="500"
            step="5"
            value={currentGoals.carbs}
            onChange={(e) => setCurrentGoals({ ...currentGoals, carbs: Number(e.target.value) })}
            className="w-full accent-neutral-900 h-1.5 bg-neutral-300 rounded-lg cursor-pointer"
          />
        </div>

        {/* Fat */}
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-1 text-xs">
            <span className="font-semibold text-neutral-800">Healthy Fats Target</span>
            <span className="font-bold text-neutral-900">{currentGoals.fat}g</span>
          </div>
          <input
            type="range"
            min="20"
            max="150"
            step="5"
            value={currentGoals.fat}
            onChange={(e) => setCurrentGoals({ ...currentGoals, fat: Number(e.target.value) })}
            className="w-full accent-neutral-900 h-1.5 bg-neutral-300 rounded-lg cursor-pointer"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 liquid-droplet-dark text-white font-bold text-sm rounded-2xl active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-md relative z-10"
        >
          {savedSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Targets Updated!</span>
            </>
          ) : (
            <span>Save Custom Targets</span>
          )}
        </button>
      </form>

      {/* Gemini API Key & Server Health (PIN gated) */}
      <div className="liquid-glass liquid-sheen rounded-3xl p-5 border border-white/70 shadow-sm relative overflow-hidden space-y-4">
        <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none z-10" />

        <div className="flex items-center justify-between relative z-10">
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-neutral-500">
              Server Settings
            </span>
            <h3 className="text-base font-bold text-neutral-900 tracking-tight">Gemini API Key</h3>
          </div>
          <div className="w-9 h-9 rounded-2xl liquid-glass-subtle flex items-center justify-center text-neutral-800 border border-white/60">
            {pinUnlocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
          </div>
        </div>

        {!pinUnlocked ? (
          <form onSubmit={handleUnlockSettings} className="space-y-2.5 relative z-10">
            <label className="text-[11px] font-bold text-neutral-700 block">PIN</label>
            <input
              type="password"
              inputMode="numeric"
              autoComplete="off"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl liquid-glass text-sm text-neutral-900 border border-white/60 focus:outline-none focus:ring-1 focus:ring-neutral-800"
            />
            {pinError && (
              <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl p-2.5 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{pinError}</span>
              </div>
            )}
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl liquid-droplet-dark text-white font-bold text-xs flex items-center justify-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Unlock</span>
            </button>
          </form>
        ) : (
          <div className="space-y-3 relative z-10">
            <div>
              <span className="text-[11px] font-bold text-neutral-700 block mb-1">Current key</span>
              <div className="font-mono text-sm text-neutral-900">
                {settingsInfo?.gemini_key_masked || '(not set)'}
              </div>
            </div>

            {settingsInfo?.last_error && (
              <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-2.5">
                [{settingsInfo.last_error.type}] {settingsInfo.last_error.message} —{' '}
                {new Date(settingsInfo.last_error.at).toLocaleString()}
              </div>
            )}

            <form onSubmit={handleSaveGeminiKey} className="space-y-2">
              <label className="text-[11px] font-bold text-neutral-700 block">Paste new key</label>
              <input
                type="text"
                autoComplete="off"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl liquid-glass text-sm text-neutral-900 border border-white/60 focus:outline-none focus:ring-1 focus:ring-neutral-800"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl liquid-droplet-dark text-white font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Key</span>
              </button>
              {keySaveResult && (
                <div
                  className={`text-xs rounded-xl p-2.5 border ${
                    keySaveResult.ok
                      ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
                      : 'text-red-700 bg-red-50 border-red-200'
                  }`}
                >
                  {keySaveResult.message}
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
