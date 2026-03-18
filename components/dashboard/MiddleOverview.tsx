"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";
import { useHabits, calcDailyRate } from "@/lib/habit-context";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.[0]) {
    return (
      <div className="dawn-card px-3 py-2 text-xs">
        <p className="mb-0.5" style={{ color: "var(--text-3)" }}>{label}</p>
        <p className="font-bold" style={{ color: "var(--blue)" }}>
          {payload[0].value != null ? `${payload[0].value}%` : "기록 없음"}
        </p>
      </div>
    );
  }
  return null;
};

function getBarColor(value: number | null, isToday: boolean) {
  if (value === null) return "rgba(43,143,240,0.04)";
  if (isToday)        return "url(#barGradientToday)";
  if (value >= 80)    return "url(#barGradientHigh)";
  if (value >= 60)    return "url(#barGradientMid)";
  return              "url(#barGradientLow)";
}

function getBarGlow(value: number | null, isToday: boolean) {
  if (isToday)              return "rgba(112,192,255,0.7)";
  if ((value ?? 0) >= 80)  return "rgba(43,143,240,0.5)";
  if ((value ?? 0) >= 60)  return "rgba(43,143,240,0.3)";
  return "none";
}

const DAY_SHORTS = ["월","화","수","목","금","토","일"];

// 지난 4주 각각의 Mon~Sun 날짜 배열
function getWeeks() {
  const today = new Date();
  const todayMon = new Date(today);
  todayMon.setDate(today.getDate() - ((today.getDay() + 6) % 7));

  return Array.from({ length: 4 }, (_, wi) => {
    const mon = new Date(todayMon);
    mon.setDate(todayMon.getDate() - (3 - wi) * 7);
    const weekNum = wi + 1;
    const days = Array.from({ length: 7 }, (_, di) => {
      const d = new Date(mon);
      d.setDate(mon.getDate() + di);
      return {
        day: DAY_SHORTS[di],
        dateStr: d.toISOString().slice(0, 10),
        isToday: d.toDateString() === today.toDateString(),
        isFuture: d > today && d.toDateString() !== today.toDateString(),
      };
    });
    const label = wi === 3 ? "이번주" : `${4 - wi}주 전`;
    return { week: label, weekNum, days };
  });
}

function WeekMiniChart({ weekData, weekIdx, habits, checks }: {
  weekData: ReturnType<typeof getWeeks>[0];
  weekIdx: number;
  habits: any[];
  checks: any[];
}) {
  const chartData = weekData.days.map(d => ({
    day: d.day,
    value: d.isFuture ? null : calcDailyRate(habits, checks, d.dateStr),
    isToday: d.isToday,
  }));

  const valid = chartData.filter(d => d.value !== null) as { value: number }[];
  const avg = valid.length > 0
    ? Math.round(valid.reduce((s, d) => s + d.value, 0) / valid.length)
    : 0;
  const avgColor = avg >= 80 ? "var(--blue)" : avg >= 60 ? "var(--lavender)" : avg > 0 ? "var(--amber)" : "var(--text-4)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: weekIdx * 0.09 + 0.1, ease: [0.25, 0.8, 0.25, 1] }}
      className="flex-1 min-w-0"
    >
      <div className="flex items-center justify-between mb-2 px-0.5">
        <span className="text-[10px] font-semibold tracking-wide"
          style={{ color: weekIdx === 3 ? "var(--blue)" : "var(--text-3)", fontFamily: "var(--font-en)" }}>
          {weekData.week}
        </span>
        <motion.span
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: weekIdx * 0.09 + 0.4 }}
          className="text-[10px] font-bold tabular-nums"
          style={{ color: avgColor, fontFamily: "var(--font-en)" }}>
          {avg > 0 ? `${avg}%` : "—"}
        </motion.span>
      </div>

      <div className="h-28">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barSize={11} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="barGradientHigh" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(112,192,255,0.95)" />
                <stop offset="100%" stopColor="rgba(43,143,240,0.55)" />
              </linearGradient>
              <linearGradient id="barGradientMid" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(96,160,240,0.75)" />
                <stop offset="100%" stopColor="rgba(43,100,200,0.35)" />
              </linearGradient>
              <linearGradient id="barGradientLow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(60,100,200,0.45)" />
                <stop offset="100%" stopColor="rgba(30,60,160,0.18)" />
              </linearGradient>
              <linearGradient id="barGradientToday" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(180,225,255,1.0)" />
                <stop offset="100%" stopColor="rgba(80,160,255,0.7)" />
              </linearGradient>
            </defs>
            <YAxis domain={[0, 100]} hide />
            <XAxis dataKey="day" axisLine={false} tickLine={false}
              tick={{ fill: "var(--text-4)", fontSize: 7, fontFamily: "monospace" }} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(43,143,240,0.04)", radius: 4 }} />
            <ReferenceLine y={70} stroke="rgba(43,143,240,0.12)" strokeDasharray="3 3" />
            <Bar dataKey="value" radius={[4, 4, 1, 1]}
              isAnimationActive animationBegin={weekIdx * 90} animationDuration={700} animationEasing="ease-out">
              {chartData.map((entry, i) => (
                <Cell key={i}
                  fill={getBarColor(entry.value, !!entry.isToday)}
                  stroke={entry.isToday ? "rgba(180,225,255,0.6)" : (entry.value ?? 0) >= 80 ? "rgba(112,192,255,0.3)" : "none"}
                  strokeWidth={1}
                  style={{ filter: getBarGlow(entry.value, !!entry.isToday) !== "none"
                    ? `drop-shadow(0 0 4px ${getBarGlow(entry.value, !!entry.isToday)})`
                    : undefined }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 mb-1">
        <div className="h-0.5 rounded-full overflow-hidden" style={{ background: "rgba(43,143,240,0.08)" }}>
          <motion.div className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${avg}%` }}
            transition={{ duration: 0.8, delay: weekIdx * 0.09 + 0.3, ease: "easeOut" }}
            style={{
              background: avg >= 80
                ? "linear-gradient(90deg, rgba(43,143,240,0.8), rgba(112,192,255,1))"
                : avg >= 60
                ? "linear-gradient(90deg, rgba(96,112,192,0.7), rgba(140,160,230,0.9))"
                : "linear-gradient(90deg, rgba(160,130,60,0.6), rgba(200,175,80,0.8))",
              boxShadow: `0 0 6px ${avg >= 80 ? "rgba(112,192,255,0.5)" : avg >= 60 ? "rgba(140,160,230,0.4)" : "rgba(200,175,80,0.4)"}`,
            }} />
        </div>
      </div>
    </motion.div>
  );
}

export function MiddleOverview() {
  const { habits, checks } = useHabits();
  const weeks = useMemo(() => getWeeks(), []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="w-full">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="label-text mb-1.5">WEEKLY MISSIONS</p>
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-1)" }}>주차별 달성 현황</h2>
        </div>
        <div className="flex flex-col gap-1">
          {[
            { label: "≥80%", color: "rgba(112,192,255,0.8)" },
            { label: "≥60%", color: "rgba(96,160,240,0.55)" },
            { label: "<60%", color: "rgba(60,100,200,0.35)" },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-sm" style={{ background: l.color, boxShadow: `0 0 4px ${l.color}` }} />
              <span className="text-[8px]" style={{ color: "var(--text-3)", fontFamily: "var(--font-en)" }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto -mx-1 px-1">
        <div className="flex gap-3" style={{ minWidth: "440px" }}>
          {weeks.map((w, i) => (
            <WeekMiniChart key={w.week} weekData={w} weekIdx={i} habits={habits} checks={checks} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
