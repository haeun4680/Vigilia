"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { habitRows, HabitRow } from "@/lib/mock-data";

const _now = new Date();
const DAYS_IN_MONTH = new Date(_now.getFullYear(), _now.getMonth() + 1, 0).getDate();
const DAYS = Array.from({ length: DAYS_IN_MONTH }, (_, i) => i + 1);
const TODAY = _now.getDate();

export function MonthlyGrid() {
  const [habits, setHabits] = useState<HabitRow[]>(habitRows);

  const toggle = (habitId: number, dayIdx: number) => {
    if (dayIdx + 1 >= TODAY) return;
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== habitId) return h;
        const m = [...h.monthly];
        m[dayIdx] = !m[dayIdx];
        return { ...h, monthly: m };
      })
    );
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }} className="w-full">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="label-text mb-1.5">DAILY QUESTS</p>
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-1)" }}>
            이번 달 루틴 기록
          </h2>
        </div>
        <span className="text-xs" style={{ color: "var(--text-3)" }}>
          {new Date().toLocaleDateString("ko-KR", { month: "long", year: "numeric" })}
        </span>
      </div>

      <div className="overflow-x-auto -mx-1 px-1">
        <table className="border-collapse" style={{ minWidth: "680px" }}>
          <thead>
            <tr>
              <th className="text-left pr-4 pb-2 sticky left-0 z-10 w-[120px]"
                style={{ background: "var(--bg-card)" }}>
                <span className="label-text">루틴</span>
              </th>
              {DAYS.map((d) => (
                <th key={d} className="pb-2 w-6">
                  <span className="text-[8px] font-medium block text-center"
                    style={{
                      color: d === TODAY ? "var(--blue)" : d < TODAY ? "var(--text-4)" : "var(--text-4)",
                      fontFamily: "var(--font-en)",
                      opacity: d > TODAY ? 0.3 : 1,
                    }}>
                    {d}
                  </span>
                </th>
              ))}
            </tr>
            <tr>
              <td colSpan={DAYS_IN_MONTH + 1} style={{ borderBottom: "1px solid var(--border-2)", paddingBottom: "4px" }} />
            </tr>
          </thead>

          <tbody>
            {habits.map((habit, rowIdx) => {
              const doneCount = habit.monthly.filter(Boolean).length;
              const rate = Math.round((doneCount / Math.max(TODAY - 1, 1)) * 100);
              return (
                <motion.tr key={habit.id}
                  initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: rowIdx * 0.04 + 0.2 }}>
                  <td className="py-1.5 pr-4 sticky left-0 z-10" style={{ background: "var(--bg-card)" }}>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{habit.icon}</span>
                      <span className="text-[10px] font-medium truncate max-w-[72px]"
                        style={{ color: "var(--text-2)" }}>
                        {habit.name}
                      </span>
                      <span className="text-[9px] ml-auto pl-1 tabular-nums"
                        style={{ color: rate >= 80 ? "var(--blue)" : "var(--text-3)", fontFamily: "var(--font-en)" }}>
                        {rate}%
                      </span>
                    </div>
                  </td>
                  {habit.monthly.map((checked, dayIdx) => {
                    const d = dayIdx + 1;
                    const isFuture = d >= TODAY;
                    return (
                      <td key={dayIdx} className="py-1.5 text-center">
                        <button onClick={() => toggle(habit.id, dayIdx)} disabled={isFuture}
                          className="w-4 h-4 mx-auto flex items-center justify-center transition-all duration-100 rounded-sm"
                          style={{
                            background: checked ? "rgba(136,192,224,0.15)" : "transparent",
                            border: checked ? "1px solid rgba(136,192,224,0.4)" :
                              d === TODAY ? "1px solid rgba(136,192,224,0.2)" : "none",
                            cursor: isFuture ? "default" : "pointer",
                          }}>
                          {checked ? (
                            <div className="w-1.5 h-1.5 rounded-sm"
                              style={{ background: "var(--blue)", boxShadow: "0 0 6px rgba(136,192,224,0.7)" }} />
                          ) : isFuture ? null : (
                            <div className="w-[3px] h-[3px] rounded-full"
                              style={{ background: "var(--text-4)" }} />
                          )}
                        </button>
                      </td>
                    );
                  })}
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
