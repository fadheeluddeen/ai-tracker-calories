import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { TrendingUp } from 'lucide-react';
import { UserGoals } from '../types';
import { getMealsHistory, HistoryDay } from '../api';

interface TrendsViewProps {
  goals: UserGoals;
}

const DAYS = 7;

export const TrendsView: React.FC<TrendsViewProps> = ({ goals }) => {
  const [history, setHistory] = useState<HistoryDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMealsHistory(DAYS)
      .then((res) => setHistory(res.history))
      .catch((err) => console.error('Failed to load history:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="liquid-glass rounded-3xl p-8 text-center text-xs text-neutral-500">
        Loading trends...
      </div>
    );
  }

  const daysLogged = history.filter((d) => d.calories > 0).length;
  const totalCalories = history.reduce((sum, d) => sum + d.calories, 0);
  const averageCalories = daysLogged > 0 ? Math.round(totalCalories / daysLogged) : 0;
  const netDelta = averageCalories - goals.calories;

  const maxCal = Math.max(...history.map((d) => d.calories), goals.calories + 400);

  const onTargetDays = history.filter((d) => d.calories > 0 && d.calories <= goals.calories + 50).length;
  const adherencePercent = daysLogged > 0 ? Math.round((onTargetDays / daysLogged) * 100) : 0;

  const totalProtein = history.reduce((sum, d) => sum + d.protein_g, 0);
  const totalCarbs = history.reduce((sum, d) => sum + d.carbs_g, 0);
  const totalFat = history.reduce((sum, d) => sum + d.fat_g, 0);
  const avgProtein = daysLogged > 0 ? Math.round(totalProtein / daysLogged) : 0;
  const avgCarbs = daysLogged > 0 ? Math.round(totalCarbs / daysLogged) : 0;
  const avgFat = daysLogged > 0 ? Math.round(totalFat / daysLogged) : 0;

  const proteinKcal = avgProtein * 4;
  const carbsKcal = avgCarbs * 4;
  const fatKcal = avgFat * 9;
  const macroKcalTotal = proteinKcal + carbsKcal + fatKcal || 1;
  const proteinPct = Math.round((proteinKcal / macroKcalTotal) * 100);
  const carbsPct = Math.round((carbsKcal / macroKcalTotal) * 100);
  const fatPct = Math.max(0, 100 - proteinPct - carbsPct);

  return (
    <div className="space-y-4 pb-20 select-none">
      {/* Top Header Card */}
      <div className="liquid-glass liquid-sheen rounded-3xl p-5 border border-white/70 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none z-10" />

        <div className="flex items-center justify-between mb-2 relative z-10">
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-neutral-500">
              Analytics & Insights
            </span>
            <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Weekly Consistency</h2>
          </div>
          <div className="w-9 h-9 rounded-2xl liquid-glass-subtle flex items-center justify-center text-neutral-800 border border-white/60">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 mt-4 relative z-10">
          <div className="liquid-glass-subtle rounded-2xl p-3 border border-white/60">
            <span className="text-[10px] uppercase font-bold text-neutral-500">
              {daysLogged}-Day Average
            </span>
            <div className="text-lg font-extrabold text-neutral-900 mt-0.5">
              {averageCalories} <span className="text-xs font-normal text-neutral-500">kcal/day</span>
            </div>
            <span className={`text-[10px] font-semibold ${netDelta <= 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
              {daysLogged === 0
                ? 'No meals logged yet'
                : netDelta <= 0
                ? `${Math.abs(netDelta)} kcal below target`
                : `${netDelta} kcal over target`}
            </span>
          </div>

          <div className="liquid-glass-subtle rounded-2xl p-3 border border-white/60">
            <span className="text-[10px] uppercase font-bold text-neutral-500">Goal Adherence</span>
            <div className="text-lg font-extrabold text-neutral-900 mt-0.5">{adherencePercent}%</div>
            <span className="text-[10px] font-semibold text-neutral-700">
              {onTargetDays} of {daysLogged} logged days on target
            </span>
          </div>
        </div>
      </div>

      {/* 7-Day Calorie Chart */}
      <div className="liquid-glass liquid-sheen rounded-3xl p-5 border border-white/70 shadow-sm space-y-4 relative overflow-hidden">
        <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none z-10" />

        <div className="flex items-center justify-between relative z-10">
          <h3 className="text-sm font-bold text-neutral-900">Daily Calorie Distribution</h3>
          <span className="text-[11px] font-semibold text-neutral-600">Target: {goals.calories} kcal</span>
        </div>

        <div className="h-44 flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-white/30 relative">
          <div
            className="absolute left-0 right-0 border-b border-dashed border-neutral-800/40 pointer-events-none"
            style={{ bottom: `${(goals.calories / maxCal) * 100}%` }}
          >
            <span className="absolute right-1 -top-4 text-[9px] font-semibold text-neutral-600 bg-white/70 px-1 rounded">
              Goal
            </span>
          </div>

          {history.map((day, idx) => {
            const heightPercent = Math.min(100, Math.round((day.calories / maxCal) * 100));
            const isToday = idx === history.length - 1;
            const isTarget = day.calories > 0 && day.calories <= goals.calories + 50;
            const dayLabel = new Date(day.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' });

            return (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <span className="text-[10px] font-semibold text-neutral-700">{day.calories || ''}</span>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${heightPercent}%` }}
                  transition={{ duration: 0.6, delay: idx * 0.08, ease: 'easeOut' }}
                  className={`w-full max-w-[28px] rounded-t-xl transition-all ${
                    isToday
                      ? 'bg-neutral-900 shadow-sm'
                      : isTarget
                      ? 'bg-neutral-700/80 hover:bg-neutral-800'
                      : 'bg-neutral-500/70 hover:bg-neutral-600'
                  }`}
                />
                <span className="text-[11px] font-semibold text-neutral-600 mt-1">{dayLabel}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Macro Split Ratio */}
      <div className="liquid-glass rounded-3xl p-5 border border-white/60 space-y-3">
        <h3 className="text-sm font-bold text-neutral-900">Average Macro Balance</h3>
        <p className="text-xs text-neutral-600">
          Based on {daysLogged} logged day{daysLogged === 1 ? '' : 's'} this week:
        </p>

        <div className="space-y-2.5 pt-1">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-neutral-800">Protein ({proteinPct}%)</span>
              <span className="text-neutral-600">{avgProtein}g avg</span>
            </div>
            <div className="h-2 w-full bg-neutral-900/10 rounded-full overflow-hidden liquid-glass-subtle">
              <div className="h-full bg-neutral-900 rounded-full" style={{ width: `${proteinPct}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-neutral-800">Carbohydrates ({carbsPct}%)</span>
              <span className="text-neutral-600">{avgCarbs}g avg</span>
            </div>
            <div className="h-2 w-full bg-neutral-900/10 rounded-full overflow-hidden liquid-glass-subtle">
              <div className="h-full bg-neutral-600 rounded-full" style={{ width: `${carbsPct}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-neutral-800">Fats ({fatPct}%)</span>
              <span className="text-neutral-600">{avgFat}g avg</span>
            </div>
            <div className="h-2 w-full bg-neutral-900/10 rounded-full overflow-hidden liquid-glass-subtle">
              <div className="h-full bg-neutral-400 rounded-full" style={{ width: `${fatPct}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
