import React, { useState, useEffect } from 'react';
import { Check, Target, Scale, Activity, Lock, Unlock, KeyRound, AlertTriangle } from 'lucide-react';
import {
  getSettings,
  setGeminiKey,
  SettingsInfo,
  getProfile,
  updateProfile,
  logWeight,
  Profile,
  CalculatedGoals,
  Sex,
  ActivityLevel,
  WeightGoal,
} from '../api';
import { hapticSuccess, hapticWarning } from '../utils/haptics';

interface ProfileViewProps {
  onProfileSaved: () => void;
}

const SEX_OPTIONS: { value: Sex; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string }[] = [
  { value: 'sedentary', label: 'Sedentary — little/no exercise' },
  { value: 'light', label: 'Light — 1-3 days/week' },
  { value: 'moderate', label: 'Moderate — 3-5 days/week' },
  { value: 'active', label: 'Active — 6-7 days/week' },
  { value: 'very_active', label: 'Very active — hard training + physical job' },
];

const GOAL_OPTIONS: { value: WeightGoal; label: string }[] = [
  { value: 'lose', label: 'Lose weight' },
  { value: 'maintain', label: 'Maintain weight' },
  { value: 'gain', label: 'Gain weight' },
];

export const ProfileView: React.FC<ProfileViewProps> = ({ onProfileSaved }) => {
  const [loading, setLoading] = useState(true);
  const [latestWeightKg, setLatestWeightKg] = useState<number | null>(null);
  const [calculated, setCalculated] = useState<CalculatedGoals | null>(null);

  const [sex, setSex] = useState<Sex>('male');
  const [age, setAge] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderate');
  const [goal, setGoal] = useState<WeightGoal>('maintain');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [weightInput, setWeightInput] = useState('');
  const [savingWeight, setSavingWeight] = useState(false);
  const [weightSaved, setWeightSaved] = useState(false);
  const [weightError, setWeightError] = useState<string | null>(null);

  // Gemini settings (PIN gated) — folded in from the old standalone settings.html page
  const [pin, setPin] = useState('');
  const [pinUnlocked, setPinUnlocked] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [settingsInfo, setSettingsInfo] = useState<SettingsInfo | null>(null);
  const [newKey, setNewKey] = useState('');
  const [keySaveResult, setKeySaveResult] = useState<{ ok: boolean; message: string } | null>(null);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getProfile();
      setLatestWeightKg(data.latest_weight?.weight_kg ?? null);
      setCalculated(data.goals);
      if (data.profile) {
        setSex(data.profile.sex);
        setAge(String(data.profile.age));
        setHeightCm(String(data.profile.height_cm));
        setActivityLevel(data.profile.activity_level);
        setGoal(data.profile.goal);
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);

    const ageNum = Number(age);
    const heightNum = Number(heightCm);
    if (!Number.isFinite(ageNum) || ageNum <= 0) {
      setProfileError('Enter a valid age');
      return;
    }
    if (!Number.isFinite(heightNum) || heightNum <= 0) {
      setProfileError('Enter a valid height');
      return;
    }

    setSavingProfile(true);
    try {
      await updateProfile({ sex, age: ageNum, height_cm: heightNum, activity_level: activityLevel, goal });
      hapticSuccess();
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2000);
      await loadProfile();
      onProfileSaved();
    } catch (err: any) {
      hapticWarning();
      setProfileError(err.message || 'Failed to save profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleLogWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    setWeightError(null);

    const weightNum = Number(weightInput);
    if (!Number.isFinite(weightNum) || weightNum <= 0) {
      setWeightError('Enter a valid weight in kg');
      return;
    }

    setSavingWeight(true);
    try {
      await logWeight(weightNum);
      hapticSuccess();
      setWeightSaved(true);
      setWeightInput('');
      setTimeout(() => setWeightSaved(false), 2000);
      await loadProfile();
      onProfileSaved();
    } catch (err: any) {
      hapticWarning();
      setWeightError(err.message || 'Failed to log weight');
    } finally {
      setSavingWeight(false);
    }
  };

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

  return (
    <div className="space-y-4 pb-20 select-none">
      {/* Profile form — feeds the Mifflin-St Jeor calculation below */}
      <form
        onSubmit={handleSaveProfile}
        className="liquid-glass liquid-sheen rounded-3xl p-5 border border-white/70 shadow-sm space-y-4 relative overflow-hidden"
      >
        <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none z-10" />

        <div className="flex items-center justify-between relative z-10">
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-neutral-500">
              Personalized Plan
            </span>
            <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Your Profile</h2>
          </div>
          <div className="w-9 h-9 rounded-2xl liquid-glass-subtle flex items-center justify-center text-neutral-800 border border-white/60">
            <Target className="w-4 h-4" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 relative z-10">
          <div>
            <label className="text-[11px] font-bold text-neutral-700 block mb-1">Sex</label>
            <select
              value={sex}
              onChange={(e) => setSex(e.target.value as Sex)}
              className="w-full px-3 py-2.5 rounded-xl liquid-glass text-sm text-neutral-900 border border-white/60 focus:outline-none focus:ring-1 focus:ring-neutral-800"
            >
              {SEX_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-bold text-neutral-700 block mb-1">Age</label>
            <input
              type="number"
              min="1"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl liquid-glass text-sm text-neutral-900 border border-white/60 focus:outline-none focus:ring-1 focus:ring-neutral-800"
            />
          </div>
        </div>

        <div className="relative z-10">
          <label className="text-[11px] font-bold text-neutral-700 block mb-1">Height (cm)</label>
          <input
            type="number"
            min="1"
            step="0.1"
            value={heightCm}
            onChange={(e) => setHeightCm(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl liquid-glass text-sm text-neutral-900 border border-white/60 focus:outline-none focus:ring-1 focus:ring-neutral-800"
          />
        </div>

        <div className="relative z-10">
          <label className="text-[11px] font-bold text-neutral-700 block mb-1">Activity level</label>
          <select
            value={activityLevel}
            onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
            className="w-full px-3 py-2.5 rounded-xl liquid-glass text-sm text-neutral-900 border border-white/60 focus:outline-none focus:ring-1 focus:ring-neutral-800"
          >
            {ACTIVITY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="relative z-10">
          <label className="text-[11px] font-bold text-neutral-700 block mb-1">Goal</label>
          <select
            value={goal}
            onChange={(e) => setGoal(e.target.value as WeightGoal)}
            className="w-full px-3 py-2.5 rounded-xl liquid-glass text-sm text-neutral-900 border border-white/60 focus:outline-none focus:ring-1 focus:ring-neutral-800"
          >
            {GOAL_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {profileError && (
          <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl p-2.5 relative z-10">
            {profileError}
          </div>
        )}

        <button
          type="submit"
          disabled={savingProfile}
          className="w-full py-3 liquid-droplet-dark text-white font-bold text-sm rounded-2xl active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-md relative z-10 disabled:opacity-60"
        >
          {profileSaved ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Profile Saved!</span>
            </>
          ) : (
            <span>{savingProfile ? 'Saving...' : 'Save Profile'}</span>
          )}
        </button>
      </form>

      {/* Weight logging — drives the calculation independently of the profile form */}
      <form
        onSubmit={handleLogWeight}
        className="liquid-glass liquid-sheen rounded-3xl p-5 border border-white/70 shadow-sm space-y-3 relative overflow-hidden"
      >
        <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none z-10" />

        <div className="flex items-center justify-between relative z-10">
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-neutral-500">
              Progress Tracking
            </span>
            <h3 className="text-base font-bold text-neutral-900 tracking-tight">Log Today's Weight</h3>
          </div>
          <div className="w-9 h-9 rounded-2xl liquid-glass-subtle flex items-center justify-center text-neutral-800 border border-white/60">
            <Scale className="w-4 h-4" />
          </div>
        </div>

        {latestWeightKg != null && (
          <p className="text-xs text-neutral-600 relative z-10">
            Latest logged: <strong className="text-neutral-900">{latestWeightKg} kg</strong>
          </p>
        )}

        <div className="flex gap-2 relative z-10">
          <input
            type="number"
            min="1"
            step="0.1"
            placeholder="e.g. 95.5"
            value={weightInput}
            onChange={(e) => setWeightInput(e.target.value)}
            className="flex-1 px-3.5 py-2.5 rounded-xl liquid-glass text-sm text-neutral-900 border border-white/60 focus:outline-none focus:ring-1 focus:ring-neutral-800"
          />
          <button
            type="submit"
            disabled={savingWeight}
            className="px-5 rounded-xl liquid-droplet-dark text-white font-bold text-xs flex items-center justify-center gap-1.5 disabled:opacity-60"
          >
            {weightSaved ? <Check className="w-4 h-4" /> : <span>{savingWeight ? '...' : 'Log kg'}</span>}
          </button>
        </div>

        {weightError && (
          <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl p-2.5 relative z-10">
            {weightError}
          </div>
        )}
      </form>

      {/* Calculated goals — read-only, derived server-side, never manually editable */}
      <div className="liquid-glass liquid-sheen rounded-3xl p-5 border border-white/70 shadow-sm relative overflow-hidden space-y-3">
        <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none z-10" />

        <div className="flex items-center justify-between relative z-10">
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-neutral-500">
              Calculated — Mifflin-St Jeor
            </span>
            <h3 className="text-base font-bold text-neutral-900 tracking-tight">Your Daily Targets</h3>
          </div>
          <div className="w-9 h-9 rounded-2xl liquid-glass-subtle flex items-center justify-center text-neutral-800 border border-white/60">
            <Activity className="w-4 h-4" />
          </div>
        </div>

        {loading ? (
          <p className="text-xs text-neutral-500 relative z-10">Loading...</p>
        ) : !calculated ? (
          <p className="text-xs text-neutral-600 relative z-10">
            Save your profile and log a weight above to see your calculated goals.
          </p>
        ) : (
          <div className="relative z-10 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="liquid-glass-subtle rounded-2xl p-2.5 border border-white/60">
                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">BMR</span>
                <div className="text-base font-extrabold text-neutral-900 mt-0.5">
                  {calculated.bmr} <span className="text-[10px] font-medium text-neutral-500">kcal</span>
                </div>
              </div>
              <div className="liquid-glass-subtle rounded-2xl p-2.5 border border-white/60">
                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">TDEE</span>
                <div className="text-base font-extrabold text-neutral-900 mt-0.5">
                  {calculated.tdee} <span className="text-[10px] font-medium text-neutral-500">kcal</span>
                </div>
              </div>
            </div>

            <div className="liquid-droplet rounded-2xl p-3 flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider">Calorie Goal</span>
              <span className="text-lg font-black text-neutral-900">{calculated.calorie_goal} kcal</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-[10px] text-neutral-500 uppercase font-bold">Protein</div>
                <div className="font-bold text-neutral-900">{calculated.protein_g}g</div>
              </div>
              <div>
                <div className="text-[10px] text-neutral-500 uppercase font-bold">Carbs</div>
                <div className="font-bold text-neutral-900">{calculated.carbs_g}g</div>
              </div>
              <div>
                <div className="text-[10px] text-neutral-500 uppercase font-bold">Fat</div>
                <div className="font-bold text-neutral-900">{calculated.fat_g}g</div>
              </div>
            </div>
          </div>
        )}
      </div>

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
