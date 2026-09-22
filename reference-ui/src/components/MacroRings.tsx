import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Flame, Sparkles, Code } from 'lucide-react';
import { UserGoals } from '../types';
import { hapticLight, hapticMedium } from '../utils/haptics';
import { LiquidGlassSvgModal } from './LiquidGlassSvgModal';

interface MacroRingsProps {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  goals: UserGoals;
  burnedCalories: number;
}

export const MacroRings: React.FC<MacroRingsProps> = ({
  totalCalories,
  totalProtein,
  totalCarbs,
  totalFat,
  goals,
  burnedCalories,
}) => {
  const [showSvgModal, setShowSvgModal] = useState(false);
  const remainingCalories = Math.max(0, goals.calories - totalCalories + burnedCalories);
  const netCalories = totalCalories;

  // Percentage calculations
  const caloriePercent = Math.min(100, (netCalories / goals.calories) * 100);
  const proteinPercent = Math.min(100, (totalProtein / goals.protein) * 100);
  const carbsPercent = Math.min(100, (totalCarbs / goals.carbs) * 100);
  const fatPercent = Math.min(100, (totalFat / goals.fat) * 100);

  // Concentric SVG circular dimensions (Concentric Triple Ring System)
  const size = 192;
  const center = size / 2;

  // Ring 1: Calorie (Outer)
  const rCal = 82;
  const strokeCal = 9.5;
  const circCal = 2 * Math.PI * rCal;
  const offsetCal = circCal - (caloriePercent / 100) * circCal;

  // Ring 2: Protein (Middle)
  const rPro = 69;
  const strokePro = 8;
  const circPro = 2 * Math.PI * rPro;
  const offsetPro = circPro - (proteinPercent / 100) * circPro;

  // Ring 3: Carbs (Inner)
  const rCarb = 57;
  const strokeCarb = 7;
  const circCarb = 2 * Math.PI * rCarb;
  const offsetCarb = circCarb - (carbsPercent / 100) * circCarb;

  return (
    <div
      id="macro-rings-card"
      className="liquid-glass liquid-sheen rounded-3xl p-5 relative overflow-hidden transition-all select-none border border-white/70"
    >
      {/* Razor top specular edge */}
      <div className="absolute top-0 left-4 right-4 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none z-10" />

      <div className="flex items-center justify-between mb-4 relative z-10">
        <div>
          <span className="text-[10px] font-bold tracking-wider uppercase text-neutral-600/90 block">
            Energy Balance
          </span>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900">
            Daily Summary
          </h2>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              hapticLight();
              setShowSvgModal(true);
            }}
            className="liquid-glass-subtle hover:bg-white/80 border border-white/60 px-2.5 py-1.5 rounded-full text-[11px] font-bold text-neutral-700 flex items-center gap-1 active:scale-95 transition-all shadow-xs"
            title="Inspect & download liquid glass SVG asset"
          >
            <Code className="w-3 h-3 text-neutral-600" />
            <span>SVG</span>
          </button>
          <div className="liquid-droplet px-3 py-1.5 rounded-full text-xs font-semibold text-neutral-800 flex items-center gap-1.5 shadow-sm">
            <Flame className="w-3.5 h-3.5 text-neutral-800" />
            <span>Goal: {goals.calories}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
        {/* Main Concentric Liquid Glass Rings Vector */}
        <div className="relative flex flex-col items-center justify-center">
          {/* Backing glass lens for ring */}
          <div className="absolute inset-1 rounded-full liquid-glass-subtle pointer-events-none" />

          <svg width={size} height={size} className="transform -rotate-90 relative z-10 drop-shadow-sm">
            <defs>
              {/* Outer Calorie Ring Gradient: Apple Vibrant Flame */}
              <linearGradient id="live-cal-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff3b30" />
                <stop offset="50%" stopColor="#ff6a22" />
                <stop offset="100%" stopColor="#ff9500" />
              </linearGradient>

              {/* Middle Protein Ring Gradient: Apple Emerald Mint */}
              <linearGradient id="live-pro-gradient" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#34c759" />
                <stop offset="60%" stopColor="#30d158" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>

              {/* Inner Carbs Ring Gradient: Apple Aqua Cyan */}
              <linearGradient id="live-carb-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#007aff" />
                <stop offset="55%" stopColor="#0ea5e9" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>

              {/* Subtle Ambient Lens Blur Filter */}
              <filter id="ring-specular" x="-10%" y="-10%" width="120%" height="120%">
                <feGaussianBlur stdDeviation="1.2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* --- Ring 1: Calorie Track & Active Arc (Outer) --- */}
            <circle
              cx={center}
              cy={center}
              r={rCal}
              stroke="#18181b"
              strokeOpacity="0.08"
              strokeWidth={strokeCal}
              fill="transparent"
            />
            <motion.circle
              cx={center}
              cy={center}
              r={rCal}
              stroke="url(#live-cal-gradient)"
              strokeWidth={strokeCal}
              fill="transparent"
              strokeDasharray={circCal}
              initial={{ strokeDashoffset: circCal }}
              animate={{ strokeDashoffset: offsetCal }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              strokeLinecap="round"
              filter="url(#ring-specular)"
            />

            {/* --- Ring 2: Protein Track & Active Arc (Middle) --- */}
            <circle
              cx={center}
              cy={center}
              r={rPro}
              stroke="#18181b"
              strokeOpacity="0.08"
              strokeWidth={strokePro}
              fill="transparent"
            />
            <motion.circle
              cx={center}
              cy={center}
              r={rPro}
              stroke="url(#live-pro-gradient)"
              strokeWidth={strokePro}
              fill="transparent"
              strokeDasharray={circPro}
              initial={{ strokeDashoffset: circPro }}
              animate={{ strokeDashoffset: offsetPro }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
              strokeLinecap="round"
              filter="url(#ring-specular)"
            />

            {/* --- Ring 3: Carbs Track & Active Arc (Inner) --- */}
            <circle
              cx={center}
              cy={center}
              r={rCarb}
              stroke="#18181b"
              strokeOpacity="0.08"
              strokeWidth={strokeCarb}
              fill="transparent"
            />
            <motion.circle
              cx={center}
              cy={center}
              r={rCarb}
              stroke="url(#live-carb-gradient)"
              strokeWidth={strokeCarb}
              fill="transparent"
              strokeDasharray={circCarb}
              initial={{ strokeDashoffset: circCarb }}
              animate={{ strokeDashoffset: offsetCarb }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.16 }}
              strokeLinecap="round"
              filter="url(#ring-specular)"
            />
          </svg>

          {/* Center Metric Display - Liquid meniscus bead */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 z-20 pointer-events-none">
            <span className="text-[9px] font-bold text-neutral-500 tracking-wider uppercase">
              REMAINING
            </span>
            <motion.span
              key={remainingCalories}
              initial={{ scale: 0.9, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-2xl font-black tracking-tight text-neutral-900 leading-tight"
            >
              {remainingCalories.toLocaleString()}
            </motion.span>
            <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wide">
              kcal
            </span>
          </div>

          {/* Micro Ring Legend Indicators */}
          <div className="flex items-center justify-center gap-2.5 mt-1.5 z-10">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span className="text-[9px] font-bold text-neutral-500">Cal</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[9px] font-bold text-neutral-500">Pro</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
              <span className="text-[9px] font-bold text-neutral-500">Carb</span>
            </div>
          </div>
        </div>

        {/* Quick Numbers & Macro Bars */}
        <div className="flex-1 w-full flex flex-col gap-3.5">
          {/* Intake vs Burned row with liquid droplet look */}
          <div className="grid grid-cols-2 gap-2">
            <div className="liquid-glass-subtle rounded-2xl p-2.5 flex flex-col border border-white/60">
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                Eaten
              </span>
              <span className="text-base font-extrabold text-neutral-900 mt-0.5">
                {totalCalories} <span className="text-[10px] font-medium text-neutral-500">kcal</span>
              </span>
            </div>
            <div className="liquid-glass-subtle rounded-2xl p-2.5 flex flex-col border border-white/60">
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                Active Burn
              </span>
              <span className="text-base font-extrabold text-neutral-900 mt-0.5">
                {burnedCalories} <span className="text-[10px] font-medium text-neutral-500">kcal</span>
              </span>
            </div>
          </div>

          {/* Macro Progress Bars - Crisp liquid glass bars */}
          <div className="flex flex-col gap-2">
            {/* Protein */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-neutral-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-neutral-900" />
                  Protein
                </span>
                <span className="text-neutral-600 font-medium text-[11px]">
                  <strong className="text-neutral-900 font-semibold">{Math.round(totalProtein)}g</strong> / {goals.protein}g
                </span>
              </div>
              <div className="h-2.5 w-full bg-neutral-900/10 rounded-full overflow-hidden p-0.5 liquid-glass-subtle">
                <motion.div
                  className="h-full bg-neutral-800 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${proteinPercent}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            </div>

            {/* Carbs */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-neutral-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-neutral-600" />
                  Carbohydrates
                </span>
                <span className="text-neutral-600 font-medium text-[11px]">
                  <strong className="text-neutral-900 font-semibold">{Math.round(totalCarbs)}g</strong> / {goals.carbs}g
                </span>
              </div>
              <div className="h-2.5 w-full bg-neutral-900/10 rounded-full overflow-hidden p-0.5 liquid-glass-subtle">
                <motion.div
                  className="h-full bg-neutral-600 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${carbsPercent}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
                />
              </div>
            </div>

            {/* Fat */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-neutral-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-neutral-400" />
                  Healthy Fats
                </span>
                <span className="text-neutral-600 font-medium text-[11px]">
                  <strong className="text-neutral-900 font-semibold">{Math.round(totalFat)}g</strong> / {goals.fat}g
                </span>
              </div>
              <div className="h-2.5 w-full bg-neutral-900/10 rounded-full overflow-hidden p-0.5 liquid-glass-subtle">
                <motion.div
                  className="h-full bg-neutral-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${fatPercent}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Liquid Glass SVG Asset Inspector & Downloader */}
      <LiquidGlassSvgModal
        isOpen={showSvgModal}
        onClose={() => setShowSvgModal(false)}
      />
    </div>
  );
};

