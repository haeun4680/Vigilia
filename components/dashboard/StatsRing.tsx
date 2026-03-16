"use client";

import { motion } from "framer-motion";
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from "recharts";

interface StatsRingProps {
  label: string;
  value: number;
  color: string;
  delay?: number;
}

export function StatsRing({ label, value, color, delay = 0 }: StatsRingProps) {
  const data = [{ value, fill: color }];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center gap-2"
    >
      <div className="relative w-24 h-24">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="70%"
            outerRadius="100%"
            data={data}
            startAngle={90}
            endAngle={-270}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar
              dataKey="value"
              cornerRadius={8}
              background={{ fill: "rgba(255,255,255,0.04)" }}
              angleAxisId={0}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold" style={{ color }}>
            {value}%
          </span>
        </div>
      </div>
      <span className="text-xs text-muted-foreground font-medium tracking-wider uppercase">
        {label}
      </span>
    </motion.div>
  );
}
