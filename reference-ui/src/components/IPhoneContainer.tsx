import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Signal } from 'lucide-react';
import { GlassTheme } from '../types';

interface IPhoneContainerProps {
  children: React.ReactNode;
  isIPhoneFrame: boolean;
  theme: GlassTheme;
}

export const IPhoneContainer: React.FC<IPhoneContainerProps> = ({
  children,
  isIPhoneFrame,
  theme,
}) => {
  const [currentTime, setCurrentTime] = useState('9:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
      setCurrentTime(`${hours % 12 || 12}:${formattedMinutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Theme-specific wallpaper backgrounds with organic shapes to refract through liquid glass
  const getThemeBackground = () => {
    switch (theme) {
      case 'frost':
        return 'bg-gradient-to-br from-slate-200 via-sky-100 to-indigo-100';
      case 'aurora':
        return 'bg-gradient-to-br from-zinc-200 via-stone-200 to-slate-300';
      case 'graphite':
        return 'bg-gradient-to-br from-neutral-300 via-slate-400 to-zinc-400';
      case 'titanium':
      default:
        return 'bg-gradient-to-br from-zinc-200 via-stone-200 to-neutral-300';
    }
  };

  const getThemeOrbs = () => {
    switch (theme) {
      case 'frost':
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-16 -left-16 w-88 h-88 rounded-full bg-sky-300/50 blur-3xl animate-fluid-1" />
            <div className="absolute top-1/3 -right-20 w-88 h-88 rounded-full bg-indigo-200/50 blur-3xl animate-fluid-2" />
            <div className="absolute -bottom-20 left-1/4 w-88 h-88 rounded-full bg-blue-300/40 blur-3xl animate-fluid-3" />
          </div>
        );
      case 'aurora':
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-12 right-0 w-80 h-80 rounded-full bg-stone-400/35 blur-3xl animate-fluid-1" />
            <div className="absolute top-1/2 -left-20 w-88 h-88 rounded-full bg-zinc-400/35 blur-3xl animate-fluid-2" />
            <div className="absolute -bottom-12 right-10 w-80 h-80 rounded-full bg-neutral-400/30 blur-3xl animate-fluid-3" />
          </div>
        );
      case 'graphite':
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-12 -left-12 w-80 h-80 rounded-full bg-slate-500/35 blur-3xl animate-fluid-1" />
            <div className="absolute bottom-1/4 -right-20 w-88 h-88 rounded-full bg-zinc-600/35 blur-3xl animate-fluid-2" />
            <div className="absolute top-1/4 left-1/3 w-72 h-72 rounded-full bg-neutral-500/30 blur-3xl animate-fluid-3" />
          </div>
        );
      case 'titanium':
      default:
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -left-16 w-96 h-96 rounded-full bg-stone-300/60 blur-3xl animate-fluid-1" />
            <div className="absolute top-1/3 -right-24 w-96 h-96 rounded-full bg-zinc-300/65 blur-3xl animate-fluid-2" />
            <div className="absolute -bottom-16 left-8 w-96 h-96 rounded-full bg-neutral-400/50 blur-3xl animate-fluid-3" />
          </div>
        );
    }
  };

  if (!isIPhoneFrame) {
    // Full Responsive Web App mode (fills screen, ready for iPhone Safari)
    return (
      <div className={`min-h-screen w-full relative overflow-hidden flex flex-col ${getThemeBackground()} text-neutral-900 transition-colors duration-500`}>
        {getThemeOrbs()}
        <div className="relative z-10 max-w-md w-full mx-auto flex-1 flex flex-col px-4 pt-3 pb-24">
          {children}
        </div>
      </div>
    );
  }

  // Authentic iPhone 16 Pro Frame layout
  return (
    <div className="min-h-screen w-full bg-neutral-950 flex items-center justify-center p-2 sm:p-6 overflow-hidden select-none">
      {/* Outer Titanium Bezel */}
      <div className="relative w-full max-w-[400px] h-[852px] bg-neutral-900 rounded-[55px] p-[11px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),inset_0_0_0_2px_rgba(255,255,255,0.18),inset_0_0_0_4px_rgba(0,0,0,0.9)] border-[3px] border-neutral-700/80 flex flex-col">
        {/* Hardware side buttons simulation (Titanium rim) */}
        <div className="absolute -left-[5px] top-28 w-[3px] h-9 bg-neutral-700 rounded-l-md" />
        <div className="absolute -left-[5px] top-42 w-[3px] h-12 bg-neutral-700 rounded-l-md" />
        <div className="absolute -left-[5px] top-58 w-[3px] h-12 bg-neutral-700 rounded-l-md" />
        <div className="absolute -right-[5px] top-36 w-[3px] h-16 bg-neutral-700 rounded-r-md" />

        {/* Inner OLED Glass Screen */}
        <div className={`relative w-full h-full rounded-[45px] overflow-hidden flex flex-col ${getThemeBackground()} shadow-inner transition-colors duration-500`}>
          {getThemeOrbs()}

          {/* iOS Top Status Bar */}
          <div className="relative z-30 pt-3 px-7 flex items-center justify-between text-neutral-900 text-[13px] font-semibold tracking-tight">
            <span>{currentTime}</span>
            <div className="flex items-center gap-1.5">
              <Signal className="w-3.5 h-3.5 stroke-[2.2]" />
              <Wifi className="w-3.5 h-3.5 stroke-[2.2]" />
              <Battery className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>

          {/* Screen Content Container with Smooth Scrolling */}
          <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-28 pt-1 flex flex-col z-10">
            {children}
          </div>

          {/* iOS Home Indicator Bar */}
          <div className="absolute bottom-1.5 left-0 right-0 z-30 flex justify-center pointer-events-none">
            <div className="w-32 h-1 bg-neutral-900/70 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
