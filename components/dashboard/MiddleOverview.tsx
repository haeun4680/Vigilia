"use client";

import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";
import { weeklyDetailData } from "@/lib/mock-data";

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

function WeekMiniChart({ weekData, weekIdx }: { weekData: typeof weeklyDetailData[0]; weekIdx: number }) {
  const valid = weekData.days.filter((d) => d.value !== null);
  const avg = valid.length > 0
    ? Math.round(valid.reduce((s, d) => s + (d.value ?? 0), 0) / valid.length)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: weekIdx * 0.07 + 0.1 }}
      className="flex-1 min-w-0"
    >
      <div className="flex items-center justify-between mb-2 px-0.5">
        <span className="text-[10px] font-medium" style={{ color: "var(--blue)", fontFamily: "var(--font-en)" }}>
          {weekData.week}
        </span>
        <span className="text-[9px]" style={{ color: "var(--text-3)" }}>
          {avg > 0 ? `${avg}%` : "—"}
        </span>
      </div>

      <div className="h-24">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weekData.days} barSize={9} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <YAxis domain={[0, 100]} hide />
            <XAxis dataKey="day" axisLine={false} tickLine={false}
              tick={{ fill: "var(--text-4)", fontSize: 7, fontFamily: "monospace" }} />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <ReferenceLine y={70} stroke="rgba(136,192,224,0.08)" strokeDasharray="3 3" />
            <Bar dataKey="value" radius={[3, 3, 0, 0]}>
              {weekData.days.map((entry, i) => (
                <Cell key={i}
                  fill={
                    entry.value === null ? "rgba(136,192,224,0.03)" :
                    entry.isToday        ? "rgba(112,192,255,0.6)"  :
                    (entry.value ?? 0) >= 80 ? "rgba(136,192,224,0.55)" :
                    (entry.value ?? 0) >= 60 ? "rgba(136,192,224,0.3)" :
                                               "rgba(136,192,224,0.12)"
                  }
                  stroke={entry.isToday ? "rgba(112,192,255,0.6)" : "none"}
                  strokeWidth={1}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 h-px" style={{ background: "var(--border-2)" }} />
    </motion.div>
  );
}

export function MiddleOverview() {
  const totalCleared = weeklyDetailData.reduce((s, w) =>
    s + w.days.filter((d) => (d.value ?? 0) >= 70).length, 0);
  const totalDays = weeklyDetailData.reduce((s, w) =>
    s + w.days.filter((d) => d.value !== null).length, 0);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="w-full">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="label-text mb-1.5">WEEKLY MISSIONS</p>
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-1)" }}>주차별 달성 현황</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="label-text mb-0.5">완료</p>
            <p className="text-sm font-bold" style={{ color: "var(--blue)" }}>
              {totalCleared}<span style={{ color: "var(--text-3)" }}>/{totalDays}</span>
            </p>
          </div>
          <div className="flex flex-col gap-1">
            {[
              { label: "≥80%", opacity: "0.55" },
              { label: "≥60%", opacity: "0.30" },
              { label: "<60%", opacity: "0.12" },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-sm"
                  style={{ background: `rgba(136,192,224,${l.opacity})` }} />
                <span className="text-[8px]" style={{ color: "var(--text-3)", fontFamily: "var(--font-en)" }}>
                  {l.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex gap-3">
        {weeklyDetailData.map((w, i) => (
          <WeekMiniChart key={w.week} weekData={w} weekIdx={i} />
        ))}
      </div>
    </motion.div>
  );
}
