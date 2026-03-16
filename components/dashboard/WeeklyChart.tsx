"use client";

import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  Tooltip,
} from "recharts";
import { weeklyData } from "@/lib/mock-data";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1e1e2a] px-3 py-2 rounded-lg border border-white/10 text-sm">
        <p className="text-purple-400 font-semibold">{label}</p>
        <p className="text-white">{payload[0].value}%</p>
      </div>
    );
  }
  return null;
};

export function WeeklyChart() {
  const today = new Date().getDay();
  const dayIndex = today === 0 ? 6 : today - 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="w-full h-32"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={weeklyData} barSize={24} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#6b6b80", fontSize: 11, fontFamily: "Inter" }}
          />
          <YAxis hide domain={[0, 100]} />
          <Tooltip content={<CustomTooltip />} cursor={false} />
          <Bar dataKey="value" radius={[6, 6, 6, 6]}>
            {weeklyData.map((entry, index) => (
              <Cell
                key={index}
                fill={index === dayIndex ? "#7c6ff7" : "rgba(124, 111, 247, 0.2)"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
