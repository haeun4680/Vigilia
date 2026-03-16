"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { habitRows, weekDates } from "@/lib/mock-data";
import { Check, X, Minus } from "lucide-react";

function RingProgress({ pct, isToday, size = 72 }: { pct: number; isToday: boolean; size?: number }) {
  const r = size * 0.38;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);
  const cx = size / 2, cy = size / 2;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={cx} cy={cy} r={r} fill="none"
          stroke="rgba(136,192,224,0.06)" strokeWidth={3.5} />
        <motion.circle cx={cx} cy={cy} r={r} fill="none"
          stroke={pct === 0 ? "rgba(136,192,224,0.06)" : isToday ? "var(--blue)" : "var(--blue-dim)"}
          strokeWidth={isToday ? 4 : 3} strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          transform={`rotate(-90 ${cx} ${cy})`}
          style={pct > 0 ? { filter: `drop-shadow(0 0 ${isToday ? 5 : 3}px rgba(136,192,224,${isToday ? 0.5 : 0.25}))` } : undefined}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-bold tabular-nums"
          style={{
            fontSize: size * 0.19,
            color: pct === 0 ? "var(--text-4)" : isToday ? "var(--blue)" : "var(--text-2)",
            fontFamily: "var(--font-en)",
          }}>
          {pct}%
        </span>
      </div>
    </div>
  );
}

function TaskItem({ habit, status, delay }: {
  habit: typeof habitRows[0];
  status: "done" | "missed" | "future";
  delay: number;
}) {
  return (
    <motion.div initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="flex items-center gap-2 py-1">
      <div className="w-3.5 h-3.5 rounded-sm flex items-center justify-center flex-shrink-0"
        style={{
          background:
            status === "done"   ? "rgba(136,192,224,0.12)" :
            status === "missed" ? "rgba(200,100,100,0.07)"  : "rgba(255,255,255,0.02)",
          border:
            status === "done"   ? "1px solid rgba(136,192,224,0.3)"  :
            status === "missed" ? "1px solid rgba(200,100,100,0.2)"   :
            "1px solid rgba(255,255,255,0.05)",
        }}>
        {status === "done"   && <Check className="w-2 h-2" style={{ color: "var(--blue)" }} />}
        {status === "missed" && <X className="w-2 h-2" style={{ color: "#c87070" }} />}
        {status === "future" && <Minus className="w-2 h-2" style={{ color: "var(--text-4)" }} />}
      </div>
      <span className="text-[10px]">{habit.icon}</span>
      <span className="text-[10px] truncate"
        style={{
          color: status === "done" ? "var(--text-3)" : status === "missed" ? "#8a6060" : "var(--text-4)",
          textDecoration: status === "done" ? "line-through" : "none",
        }}>
        {habit.name}
      </span>
    </motion.div>
  );
}

function DayColumn({ dayInfo, colIdx, selected, onSelect }: {
  dayInfo: typeof weekDates[0]; colIdx: number; selected: boolean; onSelect: () => void;
}) {
  const { isToday, isPast, dayShort, date } = dayInfo;
  const tasksWithStatus = habitRows.map((h) => ({
    habit: h,
    status: (
      isPast  ? (h.checks[colIdx] ? "done" : "missed") :
      isToday ? (h.checks[colIdx] ? "done" : "missed") :
      "future"
    ) as "done" | "missed" | "future",
  }));
  const doneCount = tasksWithStatus.filter((t) => t.status === "done").length;
  const pct = (isToday || isPast) ? Math.round((doneCount / habitRows.length) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: colIdx * 0.06 }}
      onClick={onSelect}
      className="flex flex-col cursor-pointer rounded-xl transition-all duration-200 flex-1 min-w-[118px]"
      style={{
        background: selected ? "rgba(136,192,224,0.05)" : isToday ? "rgba(136,192,224,0.03)" : "rgba(255,255,255,0.01)",
        border: selected ? "1px solid rgba(136,192,224,0.25)" :
          isToday ? "1px solid rgba(136,192,224,0.12)" : "1px solid rgba(255,255,255,0.04)",
        boxShadow: selected ? "0 0 20px rgba(136,192,224,0.07)" : "none",
      }}>
      {/* 요일 헤더 */}
      <div className="px-3 pt-3 pb-2.5 text-center"
        style={{ borderBottom: "1px solid rgba(136,192,224,0.06)" }}>
        <div className="text-[9px] font-medium tracking-[0.18em] mb-1"
          style={{
            color: isToday ? "var(--blue)" : "var(--text-3)",
            fontFamily: "var(--font-en)",
          }}>
          {dayShort}
        </div>
        <div className="text-xl font-bold" style={{ color: isToday ? "var(--text-1)" : "var(--text-4)", fontFamily: "var(--font-en)" }}>
          {date}
        </div>
        {isToday && (
          <div className="text-[8px] tracking-widest mt-0.5" style={{ color: "var(--blue)" }}>오늘</div>
        )}
      </div>

      {/* 링 */}
      <div className="flex justify-center py-3">
        <RingProgress pct={pct} isToday={isToday} size={68} />
      </div>

      {/* 루틴 목록 */}
      <div className="px-3 pb-3 flex-1">
        <p className="label-text mb-1.5">오늘의 루틴</p>
        <div className="space-y-0">
          {tasksWithStatus.map(({ habit, status }, i) => (
            <TaskItem key={habit.id} habit={habit} status={status}
              delay={colIdx * 0.05 + i * 0.025} />
          ))}
        </div>
        {(isToday || isPast) && (
          <div className="mt-2.5 pt-2" style={{ borderTop: "1px solid rgba(136,192,224,0.06)" }}>
            <div className="flex items-center justify-between">
              <span className="label-text">달성</span>
              <span className="text-[10px] font-semibold tabular-nums"
                style={{
                  color: pct >= 80 ? "var(--blue)" : pct >= 50 ? "var(--amber)" : "#c87070",
                  fontFamily: "var(--font-en)",
                }}>
                {doneCount}/{habitRows.length}
              </span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function WeeklyView() {
  const todayIdx = weekDates.findIndex((d) => d.isToday);
  const [selected, setSelected] = useState(todayIdx >= 0 ? todayIdx : 0);
  const selectedDay = weekDates[selected];
  const totalDone = habitRows.filter((h) => h.checks[selected]).length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="label-text mb-1.5">WEEKLY RESULTS</p>
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-1)" }}>이번 주 기록</h2>
        </div>
        <div className="text-right">
          <p className="label-text mb-0.5">{selectedDay?.dayShort} · {selectedDay?.date}</p>
          <p className="text-sm font-semibold" style={{ color: "var(--blue)", fontFamily: "var(--font-en)" }}>
            {totalDone}/{habitRows.length} 완료
          </p>
        </div>
      </div>

      {/* 7일 컬럼 */}
      <div className="overflow-x-auto -mx-1 px-1">
        <div className="flex gap-2" style={{ minWidth: "700px" }}>
          {weekDates.map((d, i) => (
            <DayColumn key={i} dayInfo={d} colIdx={i}
              selected={selected === i} onSelect={() => setSelected(i)} />
          ))}
        </div>
      </div>

      {/* 선택된 날 요약 */}
      <AnimatePresence mode="wait">
        <motion.div key={selected}
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
          className="mt-4 p-4 rounded-xl"
          style={{ background: "rgba(136,192,224,0.02)", border: "1px solid var(--border-2)" }}>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="label-text mr-1">{selectedDay?.dayShort} 요약</span>
            {habitRows.map((h, i) => {
              const done = h.checks[selected];
              const isFuture = !selectedDay?.isToday && !selectedDay?.isPast;
              return (
                <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                  style={{
                    background: isFuture ? "rgba(255,255,255,0.02)" :
                      done ? "rgba(136,192,224,0.07)" : "rgba(200,100,100,0.05)",
                    border: isFuture ? "1px solid rgba(255,255,255,0.04)" :
                      done ? "1px solid rgba(136,192,224,0.18)" : "1px solid rgba(200,100,100,0.12)",
                  }}>
                  <span className="text-xs">{h.icon}</span>
                  <span className="text-[9px]"
                    style={{ color: isFuture ? "var(--text-4)" : done ? "var(--blue)" : "#c87070" }}>
                    {h.name}
                  </span>
                  {!isFuture && (done
                    ? <Check className="w-2.5 h-2.5" style={{ color: "var(--blue)" }} />
                    : <X className="w-2.5 h-2.5" style={{ color: "#c87070" }} />
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
