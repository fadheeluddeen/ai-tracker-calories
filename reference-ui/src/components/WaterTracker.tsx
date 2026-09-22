import React from 'react';
import { motion } from 'motion/react';
import { Droplets, Plus, Minus } from 'lucide-react';
import { hapticMedium, hapticWarning } from '../utils/haptics';

interface WaterTrackerProps {
  waterMl: number;
  goalMl: number;
  onUpdateWater: (deltaMl: number) => void;
}

export const WaterTracker: React.FC<WaterTrackerProps> = ({
  waterMl,
  goalMl,
  onUpdateWater,
}) => {
  const percentage = Math.min(100, Math.round((waterMl / goalMl) * 100));

  const handleWaterClick = (amount: number) => {
    if (amount < 0) {
      hapticWarning();
    } else {
      hapticMedium();
    }
    onUpdateWater(amount);
  };

  return (
    <div
      id="water-tracker-card"
      className="liquid-glass liquid-sheen rounded-3xl p-4.5 relative overflow-hidden transition-all border border-white/70"
    >
      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-2xl liquid-glass-subtle flex items-center justify-center text-neutral-800 border border-white/60">
            <Droplets className="w-4 h-4 text-sky-800" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-900 tracking-tight">
              Hydration
            </h3>
            <span className="text-[11px] font-medium text-neutral-600">
              {waterMl} ml / {goalMl} ml ({percentage}%)
            </span>
          </div>
        </div>

        {/* Quick controls with liquid droplet buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleWaterClick(-250)}
            disabled={waterMl <= 0}
            className="w-7 h-7 rounded-full liquid-droplet hover:bg-white/90 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center justify-center text-neutral-700"
            title="Subtract 250ml"
            aria-label="Subtract 250ml"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleWaterClick(250)}
            className="px-3 h-7 rounded-full liquid-droplet active:scale-95 transition-all flex items-center gap-1 text-xs font-bold text-neutral-900 shadow-sm"
            title="Add 250ml (1 glass)"
            aria-label="Add 250ml"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>250ml</span>
          </button>
          <button
            type="button"
            onClick={() => handleWaterClick(500)}
            className="px-3 h-7 rounded-full liquid-droplet active:scale-95 transition-all flex items-center gap-1 text-xs font-semibold text-neutral-800"
            title="Add 500ml (1 bottle)"
            aria-label="Add 500ml"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>500ml</span>
          </button>
        </div>
      </div>

      {/* Heavy liquid glass flask / water vial */}
      <div className="relative h-6 w-full rounded-2xl liquid-glass-subtle border border-white/60 overflow-hidden p-0.5 shadow-inner">
        {/* Animated fluid water wave */}
        <motion.div
          className="h-full rounded-xl relative overflow-hidden bg-gradient-to-r from-sky-400/70 via-blue-500/60 to-cyan-400/70 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),inset_0_-1px_1px_rgba(0,0,0,0.1)]"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {/* Surface meniscus gleam */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-white/60 rounded-full" />
        </motion.div>

        {/* Milestone ticks on glass vial */}
        <div className="absolute inset-0 flex justify-between px-3 pointer-events-none items-center">
          <div className="w-[1px] h-2 bg-neutral-900/20" />
          <div className="w-[1px] h-3 bg-neutral-900/30" />
          <div className="w-[1px] h-2 bg-neutral-900/20" />
          <div className="w-[1px] h-3 bg-neutral-900/30" />
        </div>
      </div>
    </div>
  );
};
