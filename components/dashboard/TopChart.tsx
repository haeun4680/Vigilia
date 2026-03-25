"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine, CartesianGrid, ReferenceDot,
} from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useHabits, calcDailyRate, toLocalDateStr } from "@/lib/habit-context";
import { useForbidden } from "@/lib/forbidden-context";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.[0]?.value != null) {
    return (
      <div className="dawn-card px-3 py-2 text-xs">
        <p className="mb-0.5" style={{ color: "var(--text-3)", fontFamily: "var(--font-en)" }}>{label}</p>
        <p className="font-bold" style={{ color: "var(--blue)" }}>{payload[0].value}%</p>
      </div>
    );
  }
  return null;
};

type RangeKey = "1W" | "1M" | "3M" | "6M" | "1Y";

const RANGES: { key: RangeKey; label: string; days: number }[] = [
  { key: "1W", label: "1주",  days: 7   },
  { key: "1M", label: "1달",  days: 30  },
  { key: "3M", label: "3달",  days: 90  },
  { key: "6M", label: "6달",  days: 180 },
  { key: "1Y", label: "올해", days: 365 },
];

function buildChartData(habits: any[], checks: any[], days: number) {
  const today = new Date();
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (days - 1) + i);
    const dateStr = toLocalDateStr(d);
    const isFuture = d > today;

    // 날짜 라벨: 7일은 요일, 나머지는 날짜
    let label: string;
    if (days <= 7) {
      label = ["일","월","화","수","목","금","토"][d.getDay()];
    } else if (days <= 30) {
      label = `${d.getMonth() + 1}/${d.getDate()}`;
    } else {
      // 1일이면 월 표시, 나머지는 빈 값 (XAxis interval로 조절)
      label = d.getDate() === 1 ? `${d.getMonth() + 1}월` : `${d.getDate()}`;
    }

    return {
      label,
      dateStr,
      value: isFuture ? null : calcDailyRate(habits, checks, dateStr),
    };
  });
}

export function TopChart() {
  const { habits, checks } = useHabits();
  const { violationDates } = useForbidden();
  const [range, setRange] = useState<RangeKey>("1M");

  const days = RANGES.find(r => r.key === range)!.days;

  const data = useMemo(
    () => buildChartData(habits, checks, days),
    [habits, checks, days]
  );

  const stats = useMemo(() => {
    const valid = data.filter(d => d.value !== null) as { value: number }[];
    if (valid.length === 0) return { avg: 0, change: 0, up: true };
    const avg = Math.round(valid.reduce((s, d) => s + d.value, 0) / valid.length);
    const change = valid.length >= 2 ? valid[valid.length - 1].value - valid[0].value : 0;
    return { avg, change, up: change >= 0 };
  }, [data]);

  const xInterval = days <= 7 ? 0 : days <= 30 ? 3 : days <= 90 ? 6 : days <= 180 ? 14 : 30;

  // 위반 날짜의 라벨 + 실제 값
  const violationPoints = data.filter(d => violationDates.has(d.dateStr) && d.value !== null);

  return (
    <div className="w-full">
      <div className="flex items-start justify-between mb-5 gap-4 flex-wrap">
        <div>
          <p className="label-text mb-1.5">ROUTINE FLOW</p>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold" style={{ color: "var(--blue)" }}>
              {stats.avg}%
            </span>
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium"
              style={{
                background: stats.up ? "rgba(136,192,224,0.08)" : "rgba(200,100,100,0.08)",
                color: stats.up ? "var(--blue)" : "#c87070",
                border: `1px solid ${stats.up ? "rgba(136,192,224,0.15)" : "rgba(200,100,100,0.15)"}`,
              }}>
              {stats.up ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {stats.up ? "+" : ""}{stats.change}%
            </div>
          </div>
          <p className="text-xs mt-1" style={{ color: "var(--text-3)" }}>평균 일별 달성률</p>
        </div>

        {/* 기간 선택 */}
        <div className="flex items-center gap-px p-1 rounded-xl"
          style={{ background: "rgba(136,192,224,0.04)", border: "1px solid var(--border-2)" }}>
          {RANGES.map((r) => (
            <button key={r.key} onClick={() => setRange(r.key)}
              className="px-3 py-1.5 rounded-lg text-[10px] font-medium tracking-wider transition-all duration-150"
              style={{
                fontFamily: "var(--font-en)",
                background: range === r.key ? "rgba(136,192,224,0.12)" : "transparent",
                color: range === r.key ? "var(--blue)" : "var(--text-3)",
                border: range === r.key ? "1px solid rgba(136,192,224,0.2)" : "1px solid transparent",
              }}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={range}
          initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
          className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="sageGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#2b8ff0" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#2b8ff0" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="rgba(136,192,224,0.05)" />
              <XAxis dataKey="label" axisLine={false} tickLine={false}
                interval={xInterval}
                tick={{ fill: "var(--text-4)", fontSize: 9, fontFamily: "monospace" }} />
              <YAxis domain={[0, 100]} axisLine={false} tickLine={false}
                tick={{ fill: "var(--text-4)", fontSize: 9 }} />
              <Tooltip content={<CustomTooltip />}
                cursor={{ stroke: "rgba(136,192,224,0.2)", strokeWidth: 1, strokeDasharray: "4 4" }} />
              <ReferenceLine y={stats.avg} stroke="rgba(136,192,224,0.1)" strokeDasharray="6 4" />
              {violationPoints.map((d, i) => (
                <ReferenceDot key={i} x={d.label} y={d.value as number} r={4}
                  fill="rgba(200,80,80,0.9)" stroke="rgba(255,120,120,0.4)" strokeWidth={2} />
              ))}
              <Area type="monotone" dataKey="value"
                stroke="var(--blue)" strokeWidth={1.5}
                fill="url(#sageGradient)" dot={false} connectNulls={false}
                style={{ filter: "drop-shadow(0 0 6px rgba(136,192,224,0.5))" }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
