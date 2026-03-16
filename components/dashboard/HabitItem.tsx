"use client";

import { motion } from "framer-motion";

interface HabitItemProps {
  habit: {
    id: number;
    name: string;
    icon: string;
    progress: number;
    target: string;
    current: string;
    color: string;
  };
  index: number;
}

export function HabitItem({ habit, index }: HabitItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 * index + 0.4, duration: 0.4 }}
      className="group"
    >
      <div className="flex items-center gap-3 mb-2">
        <span className="text-base">{habit.icon}</span>
        <div className="flex-1 flex items-center justify-between">
          <span className="text-sm font-medium text-foreground/90">{habit.name}</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {habit.current} / {habit.target}
            </span>
            <span
              className="text-xs font-semibold tabular-nums"
              style={{ color: habit.color }}
            >
              {habit.progress}%
            </span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="ml-7 h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full relative"
          style={{ backgroundColor: habit.color }}
          initial={{ width: 0 }}
          animate={{ width: `${habit.progress}%` }}
          transition={{ delay: 0.1 * index + 0.6, duration: 0.7, ease: "easeOut" }}
        >
          {/* Shimmer effect */}
          <div
            className="absolute inset-0 rounded-full opacity-50"
            style={{
              background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)`,
            }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
