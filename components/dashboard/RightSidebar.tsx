"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Flame, TrendingUp, Calendar, Star } from "lucide-react";
import { useHabits } from "@/lib/habit-context";

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
  const { habits, checks } = useHabits();

  const stats = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const daysThisMonth = now.getDate();

    // 이번 달 달성률
    const thisMonthChecks = checks.filter(c => c.checked_date.startsWith(monthPrefix));
    const totalPossible = habits.length * daysThisMonth;
    const completionRate = totalPossible === 0 ? 0
      : Math.round((thisMonthChecks.length / totalPossible) * 100);

    // 루틴별 이번 달 달성률
    const habitStats = habits.map(h => {
      const count = thisMonthChecks.filter(c => c.habit_id === h.id).length;
      return {
        id: h.id, name: h.name, icon: h.icon,
        rate: daysThisMonth === 0 ? 0 : Math.round((count / daysThisMonth) * 100),
      };
    });

    // 최고 루틴
    const bestHabit = habitStats.length > 0
      ? habitStats.reduce((a, b) => a.rate >= b.rate ? a : b)
      : null;

    // 전체 기록 일수 (체크가 있는 날짜 수)
    const totalDays = new Set(checks.map(c => c.checked_date)).size;

    // 현재 연속 일수
    const checkedDates = new Set(checks.map(c => c.checked_date));
    let currentStreak = 0;
    const d = new Date(now);
    while (true) {
      const ds = d.toISOString().slice(0, 10);
      if (ds > today) { d.setDate(d.getDate() - 1); continue; }
      if (!checkedDates.has(ds)) break;
      currentStreak++;
      d.setDate(d.getDate() - 1);
    }

    // 최고 연속 기록 (지난 365일)
    let longestStreak = 0;
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const d2 = new Date(now);
      d2.setDate(now.getDate() - 364 + i);
      if (checkedDates.has(d2.toISOString().slice(0, 10))) {
        streak++;
        longestStreak = Math.max(longestStreak, streak);
      } else {
        streak = 0;
      }
    }

    return { completionRate, currentStreak, longestStreak, totalDays, habitStats, bestHabit };
  }, [habits, checks]);

  const { completionRate, currentStreak, longestStreak, totalDays, habitStats, bestHabit } = stats;

  const chartData = [
    { value: completionRate, color: "var(--blue)" },
    { value: Math.max(0, 100 - completionRate), color: "rgba(136,192,224,0.06)" },
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
        <StatRow icon={Flame}      label="연속 일수" value={`${currentStreak}일`}  delay={0.25} />
        <StatRow icon={TrendingUp} label="최고 기록" value={`${longestStreak}일`}  delay={0.3}  />
        <StatRow icon={Calendar}   label="기록 일수" value={`${totalDays}일`}       delay={0.35} />
        <StatRow icon={Star}       label="최고 루틴"
          value={bestHabit ? `${bestHabit.icon} ${bestHabit.name}` : "-"}
          delay={0.4} />
      </div>

      {/* 루틴별 달성률 */}
      <div>
        <p className="label-text mb-3">루틴별 달성률</p>
        <div className="space-y-2.5">
          {habitStats.length === 0 && (
            <p className="text-xs" style={{ color: "var(--text-3)" }}>아직 루틴이 없어요.</p>
          )}
          {habitStats.map((h, i) => (
            <motion.div key={h.id}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 0.45 + i * 0.05 }}
              className="flex items-center gap-2">
              <span className="text-xs w-4 text-center flex-shrink-0">{h.icon}</span>
              <div className="flex-1 h-[3px] rounded-full overflow-hidden"
                style={{ background: "rgba(136,192,224,0.07)" }}>
                <motion.div className="h-full rounded-full"
                  style={{ background: "var(--blue)", boxShadow: "0 0 6px rgba(136,192,224,0.4)" }}
                  initial={{ width: 0 }}
                  animate={{ width: `${h.rate}%` }}
                  transition={{ delay: 0.5 + i * 0.05, duration: 0.8, ease: "easeOut" }} />
              </div>
              <span className="text-[9px] w-7 text-right tabular-nums flex-shrink-0"
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
