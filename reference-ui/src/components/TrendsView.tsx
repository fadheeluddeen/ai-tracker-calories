import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, Award, Calendar, CheckCircle2 } from 'lucide-react';
import { UserGoals } from '../types';

interface TrendsViewProps {
  goals: UserGoals;
  todayCalories: number;
}

export const TrendsView: React.FC<TrendsViewProps> = ({ goals, todayCalories }) => {
  // Weekly simulation data
  const weekStats = [
    { day: 'Mon', calories: 2050, compliant: true },
    { day: 'Tue', calories: 2180, compliant: true },
    { day: 'Wed', calories: 1980, compliant: true },
    { day: 'Thu', calories: 2240, compliant: true },
    { day: 'Fri', calories: 2110, compliant: true },
    { day: 'Sat', calories: 2320, compliant: false },
    { day: 'Sun', calories: todayCalories || 2150, compliant: true },
  ];

  const maxCal = Math.max(...weekStats.map(s => s.calories), goals.calories + 400);
  const averageCalories = Math.round(weekStats.reduce((sum, s) => sum + s.calories, 0) / weekStats.length);
  const netDelta = averageCalories - goals.calories;

  return (
    <div className="space-y-4 pb-20 select-none">
      {/* Top Header Card */}
      <div className="liquid-glass liquid-sheen rounded-3xl p-5 border border-white/70 shadow-sm relative overflow-hidden">
        {/* Top razor specular edge */}
        <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none z-10" />

        <div className="flex items-center justify-between mb-2 relative z-10">
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-neutral-500">
              Analytics & Insights
            </span>
            <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
              Weekly Consistency
            </h2>
          </div>
          <div className="w-9 h-9 rounded-2xl liquid-glass-subtle flex items-center justify-center text-neutral-800 border border-white/60">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 mt-4 relative z-10">
          <div className="liquid-glass-subtle rounded-2xl p-3 border border-white/60">
            <span className="text-[10px] uppercase font-bold text-neutral-500">
              7-Day Average
            </span>
            <div className="text-lg font-extrabold text-neutral-900 mt-0.5">
              {averageCalories} <span className="text-xs font-normal text-neutral-500">kcal/day</span>
            </div>
            <span className={`text-[10px] font-semibold ${netDelta <= 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
              {netDelta <= 0 ? `${Math.abs(netDelta)} kcal below target` : `${netDelta} kcal over target`}
            </span>
          </div>

          <div className="liquid-glass-subtle rounded-2xl p-3 border border-white/60">
            <span className="text-[10px] uppercase font-bold text-neutral-500">
              Goal Adherence
            </span>
            <div className="text-lg font-extrabold text-neutral-900 mt-0.5">
              86%
            </div>
            <span className="text-[10px] font-semibold text-neutral-700">
              6 of 7 days on target
            </span>
          </div>
        </div>
      </div>

      {/* 7-Day Calorie Chart */}
      <div className="liquid-glass liquid-sheen rounded-3xl p-5 border border-white/70 shadow-sm space-y-4 relative overflow-hidden">
        {/* Top razor specular edge */}
        <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none z-10" />

        <div className="flex items-center justify-between relative z-10">
          <h3 className="text-sm font-bold text-neutral-900">
            Daily Calorie Distribution
          </h3>
          <span className="text-[11px] font-semibold text-neutral-600">Target: {goals.calories} kcal</span>
        </div>

        {/* Chart Bars */}
        <div className="h-44 flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-white/30 relative">
          {/* Target line indicator */}
          <div 
            className="absolute left-0 right-0 border-b border-dashed border-neutral-800/40 pointer-events-none"
            style={{ bottom: `${(goals.calories / maxCal) * 100}%` }}
          >
            <span className="absolute right-1 -top-4 text-[9px] font-semibold text-neutral-600 bg-white/70 px-1 rounded">
              Goal
            </span>
          </div>

          {weekStats.map((stat, idx) => {
            const heightPercent = Math.min(100, Math.round((stat.calories / maxCal) * 100));
            const isTarget = stat.calories <= goals.calories + 50;

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <span className="text-[10px] font-semibold text-neutral-700">
                  {stat.calories}
                </span>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${heightPercent}%` }}
                  transition={{ duration: 0.6, delay: idx * 0.08, ease: 'easeOut' }}
                  className={`w-full max-w-[28px] rounded-t-xl transition-all ${
                    stat.day === 'Sun'
                      ? 'bg-neutral-900 shadow-sm'
                      : isTarget
                      ? 'bg-neutral-700/80 hover:bg-neutral-800'
                      : 'bg-neutral-500/70 hover:bg-neutral-600'
                  }`}
                />
                <span className="text-[11px] font-semibold text-neutral-600 mt-1">
                  {stat.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Macro Split Ratio */}
      <div className="liquid-glass rounded-3xl p-5 border border-white/60 space-y-3">
        <h3 className="text-sm font-bold text-neutral-900">
          Average Macro Balance
        </h3>
        <p className="text-xs text-neutral-600">
          Based on your logged meals for the current week:
        </p>

        <div className="space-y-2.5 pt-1">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-neutral-800">Protein (30%)</span>
              <span className="text-neutral-600">142g avg</span>
            </div>
            <div className="h-2 w-full bg-neutral-900/10 rounded-full overflow-hidden liquid-glass-subtle">
              <div className="h-full bg-neutral-900 w-[30%] rounded-full" />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-neutral-800">Carbohydrates (45%)</span>
              <span className="text-neutral-600">225g avg</span>
            </div>
            <div className="h-2 w-full bg-neutral-900/10 rounded-full overflow-hidden liquid-glass-subtle">
              <div className="h-full bg-neutral-600 w-[45%] rounded-full" />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-neutral-800">Fats (25%)</span>
              <span className="text-neutral-600">58g avg</span>
            </div>
            <div className="h-2 w-full bg-neutral-900/10 rounded-full overflow-hidden liquid-glass-subtle">
              <div className="h-full bg-neutral-400 w-[25%] rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
