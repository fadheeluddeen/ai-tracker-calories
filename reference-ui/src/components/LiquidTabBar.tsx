import React from 'react';
import { motion } from 'motion/react';
import { Calendar, Camera, BarChart3, Settings2, Package, Sparkles, Pill } from 'lucide-react';
import { ActiveTab } from '../types';
import { hapticMedium, hapticSelection } from '../utils/haptics';

interface LiquidTabBarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenCamera: () => void;
}

const TABS: { id: ActiveTab; label: string; ariaLabel: string; Icon: typeof Calendar; iconClass?: string }[] = [
  { id: 'diary', label: 'Diary', ariaLabel: 'Diary tab', Icon: Calendar },
  { id: 'pantry', label: 'Pantry', ariaLabel: 'Pantry Ingredients tab', Icon: Package },
  { id: 'supplements', label: 'Supps', ariaLabel: 'Supplements tab', Icon: Pill },
  { id: 'chef', label: 'AI Chef', ariaLabel: 'AI Chef tab', Icon: Sparkles, iconClass: 'text-amber-500' },
  { id: 'trends', label: 'Trends', ariaLabel: 'Trends tab', Icon: BarChart3 },
  { id: 'profile', label: 'Goals', ariaLabel: 'Goals and Profile tab', Icon: Settings2 },
];

// Slightly underdamped so the lens overshoots and settles like a liquid drop.
const LENS_SPRING = { type: 'spring', stiffness: 520, damping: 32, mass: 0.9 } as const;

export const LiquidTabBar: React.FC<LiquidTabBarProps> = ({ activeTab, onSelectTab, onOpenCamera }) => {
  return (
    <div
      className="absolute left-3 right-3 z-40 flex items-center gap-2 pointer-events-none select-none"
      style={{ bottom: 'calc(0.875rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <nav className="liquid-glass-thick rounded-full p-1 flex items-center flex-1 min-w-0 pointer-events-auto">
        {TABS.map(({ id, label, ariaLabel, Icon, iconClass }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => {
                hapticSelection();
                onSelectTab(id);
              }}
              aria-label={ariaLabel}
              aria-current={active ? 'page' : undefined}
              className={`relative z-10 flex-1 min-w-0 py-1.5 rounded-full flex flex-col items-center gap-0.5 transition-colors ${
                active ? 'text-neutral-900 font-bold' : 'text-neutral-600'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="tab-lens"
                  transition={LENS_SPRING}
                  className="liquid-lens absolute inset-0 -z-10"
                  style={{ borderRadius: 9999 }}
                />
              )}
              <Icon
                className={`w-4 h-4 transition-transform duration-200 ${active ? 'scale-110' : ''} ${iconClass ?? ''}`}
              />
              <span className="text-[9px] tracking-tight whitespace-nowrap">{label}</span>
            </button>
          );
        })}
      </nav>

      {/* Camera — its own floating glass circle beside the bar, the only meal-logging entry point */}
      <button
        type="button"
        onClick={() => {
          hapticMedium();
          onOpenCamera();
        }}
        className="w-[52px] h-[52px] rounded-full liquid-droplet-dark text-white flex items-center justify-center shrink-0 pointer-events-auto"
        title="Snap a plate"
        aria-label="Snap a plate"
      >
        <Camera className="w-5 h-5 stroke-[2.5]" />
      </button>
    </div>
  );
};
