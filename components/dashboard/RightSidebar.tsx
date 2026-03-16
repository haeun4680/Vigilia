"use client";

import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { overallStats, habitRows } from "@/lib/mock-data";
import { Flame, TrendingUp, Calendar, Star } from "lucide-react";

const StatRow = ({ icon: Icon, label, value, delay }: {
  icon: any; label: string; value: string | number; delay: number;
}) => (
  <motion.div initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }}
    transition={{ delay }}
    className="flex items-center justify-between py-2.5"
    style={{ borderBottom: "1px solid var(--border-2)" }}>
    <div className="flex items-center gap-2">
      <Icon className="w-3 h-3" style={{ color: "var(--text-3)" }} />
      <span className="text-xs" style={{ color: "var(--text-2)" }}>{label}</span>
    </div>
    <span className="text-xs font-semibold tabular-nums" style={{ color: "var(--blue)" }}>
      {value}
    </span>
  </motion.div>
);

export function RightSidebar() {
  const { completionRate, longestStreak, currentStreak, bestHabit, pieData, totalDays } = overallStats;
  const habitStats = habitRows.map((h) => ({
    name: h.name, icon: h.icon,
    rate: Math.round((h.monthly.filter(Boolean).length / Math.max(totalDays, 1)) * 100),
  }));

  const chartData = [
    { value: completionRate, color: "var(--blue)" },
    { value: 100 - completionRate, color: "rgba(136,192,224,0.06)" },
  ];

  return (
    <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="flex flex-col gap-5">
      {/* 헤더 */}
      <div>
        <p className="label-text mb-1.5">OVERALL EXP</p>
        <h2 className="text-sm font-semibold" style={{ color: "var(--text-1)" }}>이번 달 성과</h2>
      </div>

      {/* 도넛 차트 */}
      <div className="relative h-32 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={chartData} cx="50%" cy="50%"
              innerRadius={40} outerRadius={54}
              startAngle={90} endAngle={-270}
              dataKey="value" strokeWidth={0}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.color}
                  style={i === 0 ? { filter: "drop-shadow(0 0 8px rgba(136,192,224,0.5))" } : undefined} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold" style={{ color: "var(--blue)" }}>{completionRate}%</span>
          <span className="text-[9px] mt-0.5" style={{ color: "var(--text-3)" }}>달성</span>
        </div>
      </div>

      {/* 스탯 목록 */}
      <div>
        <StatRow icon={Flame}      label="연속 일수"    value={`${currentStreak}일`}  delay={0.25} />
        <StatRow icon={TrendingUp} label="최고 기록"    value={`${longestStreak}일`}  delay={0.3} />
        <StatRow icon={Calendar}   label="기록 일수"    value={`${totalDays}일`}       delay={0.35} />
        <StatRow icon={Star}       label="최고 루틴"    value={bestHabit}              delay={0.4} />
      </div>

      {/* 루틴별 달성률 */}
      <div>
        <p className="label-text mb-3">루틴별 달성률</p>
        <div className="space-y-2.5">
          {habitStats.map((h, i) => (
            <motion.div key={h.name}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 0.45 + i * 0.05 }}
              className="flex items-center gap-2">
              <span className="text-xs w-4 text-center">{h.icon}</span>
              <div className="flex-1 h-[3px] rounded-full overflow-hidden"
                style={{ background: "rgba(136,192,224,0.07)" }}>
                <motion.div className="h-full rounded-full"
                  style={{ background: "var(--blue)", boxShadow: "0 0 6px rgba(136,192,224,0.4)" }}
                  initial={{ width: 0 }}
                  animate={{ width: `${h.rate}%` }}
                  transition={{ delay: 0.5 + i * 0.05, duration: 0.8, ease: "easeOut" }} />
              </div>
              <span className="text-[9px] w-7 text-right tabular-nums"
                style={{ color: "var(--text-3)", fontFamily: "var(--font-en)" }}>
                {h.rate}%
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
