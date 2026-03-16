"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine, CartesianGrid,
} from "recharts";
import { chartDataMap, RANGE_OPTIONS, RangeKey } from "@/lib/mock-data";
import { TrendingUp, TrendingDown } from "lucide-react";

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

export function TopChart() {
  const [range, setRange] = useState<RangeKey>("1M");
  const data = chartDataMap[range];

  const stats = useMemo(() => {
    const valid = data.filter((d) => d.value !== null) as { value: number }[];
    if (valid.length < 2) return { avg: 0, change: 0, up: true };
    const avg = Math.round(valid.reduce((s, d) => s + d.value, 0) / valid.length);
    const change = valid[valid.length - 1].value - valid[0].value;
    return { avg, change, up: change >= 0 };
  }, [data]);

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
          {RANGE_OPTIONS.map((r) => (
            <button key={r} onClick={() => setRange(r)}
              className="px-3 py-1.5 rounded-lg text-[10px] font-medium tracking-wider transition-all duration-150"
              style={{
                fontFamily: "var(--font-en)",
                background: range === r ? "rgba(136,192,224,0.12)" : "transparent",
                color: range === r ? "var(--blue)" : "var(--text-3)",
                border: range === r ? "1px solid rgba(136,192,224,0.2)" : "1px solid transparent",
              }}>
              {r}
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
                tick={{ fill: "var(--text-4)", fontSize: 9, fontFamily: "monospace" }}
                interval={Math.floor(data.length / 6)} />
              <YAxis domain={[0, 100]} axisLine={false} tickLine={false}
                tick={{ fill: "var(--text-4)", fontSize: 9 }} />
              <Tooltip content={<CustomTooltip />}
                cursor={{ stroke: "rgba(136,192,224,0.2)", strokeWidth: 1, strokeDasharray: "4 4" }} />
              <ReferenceLine y={stats.avg} stroke="rgba(136,192,224,0.1)" strokeDasharray="6 4" />
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
