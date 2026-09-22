import React from 'react';
import { GlassTheme } from '../types';
import { hapticSelection } from '../utils/haptics';

interface LiquidGlassHeaderProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  currentTheme?: GlassTheme;
  onSelectTheme?: (theme: GlassTheme) => void;
}

export const LiquidGlassHeader: React.FC<LiquidGlassHeaderProps> = ({
  selectedDate,
  onSelectDate,
}) => {
  // Generate a week slice around selectedDate
  const today = new Date().toISOString().split('T')[0];

  const getWeekDays = () => {
    const days = [];
    const base = new Date();
    for (let i = -3; i <= 3; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      days.push({
        iso,
        dayName: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
        dayNumber: d.getDate(),
        isToday: iso === today,
      });
    }
    return days;
  };

  const weekDays = getWeekDays();

  const handleDateClick = (dateIso: string) => {
    hapticSelection();
    onSelectDate(dateIso);
  };

  return (
    <div className="pt-1 select-none">
      {/* Date Pill Scrubber */}
      <div className="liquid-glass liquid-sheen rounded-2xl p-1.5 flex items-center justify-between border border-white/70 shadow-sm relative overflow-hidden">
        {/* Top razor line */}
        <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none z-10" />

        {weekDays.map((d) => {
          const isSelected = selectedDate === d.iso;
          return (
            <button
              key={d.iso}
              type="button"
              onClick={() => handleDateClick(d.iso)}
              className={`flex-1 py-2 px-1 rounded-xl flex flex-col items-center transition-all relative z-10 ${
                isSelected
                  ? 'liquid-droplet-dark text-white shadow-md font-bold scale-[1.04]'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/35'
              }`}
            >
              <span className={`text-[9px] uppercase font-bold tracking-wider ${isSelected ? 'text-neutral-200' : 'text-neutral-500'}`}>
                {d.dayName}
              </span>
              <span className="text-xs font-extrabold leading-tight mt-0.5">
                {d.dayNumber}
              </span>
              {d.isToday && !isSelected && (
                <span className="w-1 h-1 rounded-full bg-neutral-800 mt-1" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
