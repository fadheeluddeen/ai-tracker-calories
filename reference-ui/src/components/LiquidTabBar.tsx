import React from 'react';
import { motion } from 'motion/react';
import { Calendar, Plus, BarChart3, Settings2, Package, Sparkles } from 'lucide-react';
import { ActiveTab } from '../types';
import { hapticMedium, hapticSelection } from '../utils/haptics';

interface LiquidTabBarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenQuickLog: () => void;
}

export const LiquidTabBar: React.FC<LiquidTabBarProps> = ({
  activeTab,
  onSelectTab,
  onOpenQuickLog,
}) => {
  const handleTabClick = (tab: ActiveTab) => {
    hapticSelection();
    onSelectTab(tab);
  };

  const handleQuickLog = () => {
    hapticMedium();
    onOpenQuickLog();
  };

  return (
    <div className="absolute bottom-3.5 left-2 right-2 z-40 flex justify-center pointer-events-none select-none">
      <div className="liquid-glass-thick liquid-sheen rounded-[28px] p-1.5 px-2 flex items-center gap-1 border border-white/80 shadow-xl pointer-events-auto w-full justify-between relative overflow-hidden backdrop-blur-xl">
        {/* Top razor specular edge */}
        <div className="absolute top-0 left-6 right-6 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none z-10" />

        {/* Diary Tab */}
        <button
          type="button"
          onClick={() => handleTabClick('diary')}
          className={`flex-1 py-1.5 px-0.5 rounded-2xl flex flex-col items-center gap-0.5 transition-all relative z-10 ${
            activeTab === 'diary'
              ? 'liquid-droplet-dark text-white font-bold shadow-md'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/40'
          }`}
          aria-label="Diary tab"
        >
          <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="text-[9px] sm:text-[10px] tracking-tight whitespace-nowrap">Diary</span>
        </button>

        {/* Pantry / Ingredients Vault Tab */}
        <button
          type="button"
          onClick={() => handleTabClick('pantry')}
          className={`flex-1 py-1.5 px-0.5 rounded-2xl flex flex-col items-center gap-0.5 transition-all relative z-10 ${
            activeTab === 'pantry'
              ? 'liquid-droplet-dark text-white font-bold shadow-md'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/40'
          }`}
          aria-label="Pantry Ingredients tab"
        >
          <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="text-[9px] sm:text-[10px] tracking-tight whitespace-nowrap">Pantry</span>
        </button>

        {/* Quick Log Button (Floating Glass Center Action) */}
        <button
          type="button"
          onClick={handleQuickLog}
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl liquid-droplet-dark text-white hover:brightness-110 active:scale-95 flex items-center justify-center transition-all shadow-lg mx-0.5 relative z-10 border border-white/30 shrink-0"
          title="Quick Log Food"
          aria-label="Quick Log Food"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
        </button>

        {/* Gemini AI Chef Tab */}
        <button
          type="button"
          onClick={() => handleTabClick('chat')}
          className={`flex-1 py-1.5 px-0.5 rounded-2xl flex flex-col items-center gap-0.5 transition-all relative z-10 ${
            activeTab === 'chat'
              ? 'liquid-droplet-dark text-white font-bold shadow-md'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/40'
          }`}
          aria-label="AI Chef tab"
        >
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
          <span className="text-[9px] sm:text-[10px] tracking-tight whitespace-nowrap">AI Chef</span>
        </button>

        {/* Trends Tab */}
        <button
          type="button"
          onClick={() => handleTabClick('trends')}
          className={`flex-1 py-1.5 px-0.5 rounded-2xl flex flex-col items-center gap-0.5 transition-all relative z-10 ${
            activeTab === 'trends'
              ? 'liquid-droplet-dark text-white font-bold shadow-md'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/40'
          }`}
          aria-label="Trends tab"
        >
          <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="text-[9px] sm:text-[10px] tracking-tight whitespace-nowrap">Trends</span>
        </button>

        {/* Targets / Profile Tab */}
        <button
          type="button"
          onClick={() => handleTabClick('profile')}
          className={`flex-1 py-1.5 px-0.5 rounded-2xl flex flex-col items-center gap-0.5 transition-all relative z-10 ${
            activeTab === 'profile'
              ? 'liquid-droplet-dark text-white font-bold shadow-md'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/40'
          }`}
          aria-label="Goals and Profile tab"
        >
          <Settings2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="text-[9px] sm:text-[10px] tracking-tight whitespace-nowrap">Goals</span>
        </button>
      </div>
    </div>
  );
};
