import React, { useState } from 'react';
import { UserGoals } from '../types';
import { Sliders, Check, Target, Lock, Unlock, KeyRound, AlertTriangle, Eye, Download } from 'lucide-react';
import { DEFAULT_GOALS } from '../constants';
import { getSettings, setGeminiKey, SettingsInfo } from '../api';
import {
  hapticLight, hapticMedium, hapticSelection,
  hapticSuccess, hapticWarning, isHapticsSupported
} from '../utils/haptics';
import { LiquidGlassEmblem } from './LiquidGlassEmblem';
import { LiquidGlassSvgModal } from './LiquidGlassSvgModal';

interface ProfileViewProps {
  goals: UserGoals;
  onSaveGoals: (updated: UserGoals) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ goals, onSaveGoals }) => {
  const [currentGoals, setCurrentGoals] = useState<UserGoals>(goals);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [lastHapticFired, setLastHapticFired] = useState<string | null>(null);
  const [showSvgModal, setShowSvgModal] = useState(false);
  const hapticsActive = isHapticsSupported();

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
        waterGoalMl: 3000,
      });
    } else if (type === 'maintain') {
      setCurrentGoals(DEFAULT_GOALS);
    } else if (type === 'bulk') {
      setCurrentGoals({
        calories: 2600,
        protein: 170,
        carbs: 310,
        fat: 75,
        waterGoalMl: 3200,
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

  const triggerTestHaptic = (type: 'light' | 'selection' | 'medium' | 'success' | 'warning', label: string) => {
    setLastHapticFired(label);
    if (type === 'light') hapticLight();
    else if (type === 'selection') hapticSelection();
    else if (type === 'medium') hapticMedium();
    else if (type === 'success') hapticSuccess();
    else if (type === 'warning') hapticWarning();

    setTimeout(() => {
      setLastHapticFired(null);
    }, 1200);
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

        {/* Water */}
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-1 text-xs">
            <span className="font-semibold text-neutral-800">Hydration Goal</span>
            <span className="font-bold text-neutral-900">{currentGoals.waterGoalMl} ml</span>
          </div>
          <input
            type="range"
            min="1000"
            max="5000"
            step="100"
            value={currentGoals.waterGoalMl}
            onChange={(e) => setCurrentGoals({ ...currentGoals, waterGoalMl: Number(e.target.value) })}
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

      {/* iOS Physical Haptics Simulation & Diagnostics Card */}
      <div className="liquid-glass liquid-sheen rounded-3xl p-5 border border-white/70 shadow-sm relative overflow-hidden space-y-4">
        <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none z-10" />

        <div className="flex items-center justify-between relative z-10">
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-neutral-500">
              iOS Taptic Engine
            </span>
            <h3 className="text-base font-bold text-neutral-900 tracking-tight">
              Physical Haptic Responses
            </h3>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full liquid-glass-subtle border border-white/60 text-[11px] font-semibold text-neutral-700">
            <span className={`w-2 h-2 rounded-full ${hapticsActive ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span>{hapticsActive ? 'Vibration API Ready' : 'Web Fallback'}</span>
          </div>
        </div>

        <p className="text-xs text-neutral-600 leading-relaxed relative z-10">
          Subtle micro-vibrations trigger when adding food, incrementing hydration, toggling Dynamic Island, and switching tabs. Tap below to feel each calibrated waveform:
        </p>

        {/* Interactive Haptic Test Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 relative z-10">
          <button
            type="button"
            onClick={() => triggerTestHaptic('light', 'Light Tap (10ms)')}
            className="p-2.5 rounded-2xl liquid-droplet hover:bg-white/90 text-left transition-all active:scale-95"
          >
            <span className="text-[10px] font-bold uppercase text-neutral-500 block">Light Tap</span>
            <span className="text-xs font-bold text-neutral-900">10ms Micro</span>
            <span className="text-[10px] text-neutral-500 block mt-0.5">Island, toggles</span>
          </button>

          <button
            type="button"
            onClick={() => triggerTestHaptic('selection', 'Selection Tick (8ms)')}
            className="p-2.5 rounded-2xl liquid-droplet hover:bg-white/90 text-left transition-all active:scale-95"
          >
            <span className="text-[10px] font-bold uppercase text-neutral-500 block">Selection</span>
            <span className="text-xs font-bold text-neutral-900">8ms Tick</span>
            <span className="text-[10px] text-neutral-500 block mt-0.5">Tabs, dates, items</span>
          </button>

          <button
            type="button"
            onClick={() => triggerTestHaptic('medium', 'Medium Impact (18ms)')}
            className="p-2.5 rounded-2xl liquid-droplet hover:bg-white/90 text-left transition-all active:scale-95"
          >
            <span className="text-[10px] font-bold uppercase text-neutral-500 block">Medium</span>
            <span className="text-xs font-bold text-neutral-900">18ms Fluid</span>
            <span className="text-[10px] text-neutral-500 block mt-0.5">Hydration +, Quick Add</span>
          </button>

          <button
            type="button"
            onClick={() => triggerTestHaptic('success', 'Success Pattern')}
            className="p-2.5 rounded-2xl liquid-droplet hover:bg-white/90 text-left transition-all active:scale-95"
          >
            <span className="text-[10px] font-bold uppercase text-neutral-500 block">Success</span>
            <span className="text-xs font-bold text-neutral-900">Double Pulse</span>
            <span className="text-[10px] text-neutral-500 block mt-0.5">Log food, Save goals</span>
          </button>

          <button
            type="button"
            onClick={() => triggerTestHaptic('warning', 'Warning Pattern')}
            className="p-2.5 rounded-2xl liquid-droplet hover:bg-white/90 text-left transition-all active:scale-95"
          >
            <span className="text-[10px] font-bold uppercase text-neutral-500 block">Warning</span>
            <span className="text-xs font-bold text-neutral-900">Dual Stutter</span>
            <span className="text-[10px] text-neutral-500 block mt-0.5">Delete item, Undo</span>
          </button>
        </div>

        {lastHapticFired && (
          <div className="pt-1 text-center relative z-10">
            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold text-neutral-800 liquid-glass-subtle border border-neutral-300">
              Triggered: {lastHapticFired}
            </span>
          </div>
        )}
      </div>

      {/* iOS Liquid Glass Vector Assets (SVG) Showcase Card */}
      <div className="liquid-glass liquid-sheen rounded-3xl p-5 border border-white/70 shadow-sm relative overflow-hidden space-y-3">
        <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none z-10" />

        <div className="flex items-center justify-between relative z-10">
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-neutral-500">
              Vector Design System
            </span>
            <h3 className="text-base font-bold text-neutral-900 tracking-tight">
              Liquid Glass SVG Assets
            </h3>
          </div>
          <span className="px-2 py-0.5 rounded-full liquid-glass-subtle border border-white/60 text-[10px] font-bold text-neutral-700">
            SVG Vector
          </span>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-2xl liquid-glass-subtle border border-white/60 relative z-10">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center p-1 bg-gradient-to-br from-zinc-200 to-stone-300 shadow-inner flex-shrink-0">
            <LiquidGlassEmblem size={48} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-neutral-900 truncate">
              Apple Liquid Glass Icon & Rings
            </h4>
            <p className="text-[11px] text-neutral-600 line-clamp-2 mt-0.5">
              Continuous squircle with specular caustics, razor bevels, and concentric macro arcs.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 relative z-10 pt-1">
          <button
            type="button"
            onClick={() => {
              hapticMedium();
              setShowSvgModal(true);
            }}
            className="py-2.5 px-3 rounded-2xl liquid-droplet-dark text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all hover:brightness-110"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Open Inspector</span>
          </button>

          <a
            href="/liquid-glass-icon.svg"
            download="liquid-glass-icon.svg"
            onClick={() => hapticSuccess()}
            className="py-2.5 px-3 rounded-2xl liquid-glass border border-white/80 text-xs font-bold text-neutral-800 flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all hover:bg-white/90 text-center"
          >
            <Download className="w-3.5 h-3.5 text-neutral-600" />
            <span>Download .svg</span>
          </a>
        </div>
      </div>

      {/* Fullscreen SVG Asset Inspector Modal */}
      <LiquidGlassSvgModal
        isOpen={showSvgModal}
        onClose={() => setShowSvgModal(false)}
      />
    </div>
  );
};
