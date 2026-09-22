import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Droplets, Dumbbell, ChevronUp } from 'lucide-react';
import { hapticLight } from '../utils/haptics';

interface DynamicIslandProps {
  remainingCalories: number;
  totalCalories: number;
  goalCalories: number;
  waterMl: number;
  waterGoalMl: number;
}

export const DynamicIsland: React.FC<DynamicIslandProps> = ({
  remainingCalories,
  totalCalories,
  goalCalories,
  waterMl,
  waterGoalMl,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const percentUsed = Math.min(100, Math.round((totalCalories / goalCalories) * 100));
  const waterPercent = Math.min(100, Math.round((waterMl / waterGoalMl) * 100));

  const handleToggle = () => {
    hapticLight();
    setIsExpanded((prev) => !prev);
  };

  return (
    <div className="relative z-50 flex justify-center w-full pt-2 select-none">
      <motion.div
        layout
        onClick={handleToggle}
        transition={{ type: 'spring', stiffness: 450, damping: 32 }}
        className="bg-black/90 text-white rounded-[26px] cursor-pointer shadow-[0_4px_16px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.2)] border border-white/15 px-3 py-1 flex items-center justify-between overflow-hidden"
        style={{
          width: isExpanded ? '92%' : '176px',
          minHeight: isExpanded ? '78px' : '32px',
        }}
        id="dynamic-island"
      >
        <AnimatePresence mode="wait">
          {!isExpanded ? (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-between w-full px-1 text-xs"
            >
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-neutral-300 flex items-center justify-center">
                  <Flame className="w-2 h-2 text-black" />
                </div>
                <span className="font-semibold tracking-tight text-neutral-200">
                  {remainingCalories}
                </span>
                <span className="text-[10px] text-neutral-400 font-normal">left</span>
              </div>
              <div className="w-2.5 h-2.5 rounded-full bg-neutral-700/80 border border-neutral-600/40 mr-1" />
              <div className="flex items-center gap-1 text-[11px] text-neutral-300">
                <span>{percentUsed}%</span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="flex flex-col w-full py-1 px-1 gap-2"
            >
              <div className="flex items-center justify-between text-xs border-b border-white/10 pb-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="p-1 rounded-full bg-white/10">
                    <Flame className="w-3.5 h-3.5 text-neutral-100" />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-white">Daily Pace Active</div>
                    <div className="text-[9px] text-neutral-400">{percentUsed}% of {goalCalories} kcal target</div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-right">
                  <div>
                    <div className="text-xs font-bold text-white tracking-tight">{remainingCalories}</div>
                    <div className="text-[9px] text-neutral-400 uppercase tracking-wider">Remaining</div>
                  </div>
                  <ChevronUp className="w-3.5 h-3.5 text-neutral-400 ml-1" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="flex items-center gap-1.5 bg-white/5 rounded-xl px-2 py-1 border border-white/5">
                  <Droplets className="w-3 h-3 text-sky-300" />
                  <span className="text-neutral-300">Hydration:</span>
                  <span className="font-medium text-white">{waterPercent}%</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/5 rounded-xl px-2 py-1 border border-white/5">
                  <Dumbbell className="w-3 h-3 text-neutral-300" />
                  <span className="text-neutral-300">Logged:</span>
                  <span className="font-medium text-white">{totalCalories} kcal</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
