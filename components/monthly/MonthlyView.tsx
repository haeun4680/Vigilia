"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useHabits } from "@/lib/habit-context";

const DAY_LABELS = ["일","월","화","수","목","금","토"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay(); // 0=일
}

export function MonthlyView() {
  const { habits, checks, loading } = useHabits();
  const today = new Date();

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(
    today.toISOString().slice(0, 10)
  );

  const todayStr = today.toISOString().slice(0, 10);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDow = getFirstDayOfWeek(viewYear, viewMonth);

  // 이 달의 날짜별 체크 수 & 달성률
  const dayStats = useMemo(() => {
    const map: Record<string, { done: number; pct: number }> = {};
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const done = checks.filter(c => c.checked_date === dateStr).length;
      const pct = habits.length === 0 ? 0 : Math.round((done / habits.length) * 100);
      map[dateStr] = { done, pct };
    }
    return map;
  }, [checks, habits, viewYear, viewMonth, daysInMonth]);

  // 월간 통계
  const monthStats = useMemo(() => {
    const monthPrefix = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}`;
    const pastDays = Array.from({ length: daysInMonth }, (_, i) => {
      const d = `${monthPrefix}-${String(i + 1).padStart(2, "0")}`;
      return d <= todayStr ? d : null;
    }).filter(Boolean) as string[];

    if (pastDays.length === 0 || habits.length === 0) return { avgPct: 0, perfectDays: 0, totalChecks: 0 };

    const totalChecks = checks.filter(c => c.checked_date.startsWith(monthPrefix)).length;
    const totalPossible = habits.length * pastDays.length;
    const avgPct = Math.round((totalChecks / totalPossible) * 100);
    const perfectDays = pastDays.filter(d => (dayStats[d]?.pct ?? 0) === 100).length;

    return { avgPct, perfectDays, totalChecks };
  }, [checks, habits, viewYear, viewMonth, daysInMonth, todayStr, dayStats]);

  // 선택된 날 상세
  const selectedDetail = useMemo(() => {
    if (!selectedDate) return null;
    const isFuture = selectedDate > todayStr;
    const habitDetails = habits.map(h => ({
      habit: h,
      done: checks.some(c => c.habit_id === h.id && c.checked_date === selectedDate),
    }));
    return { isFuture, habitDetails };
  }, [selectedDate, habits, checks, todayStr]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
    setSelectedDate(null);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
    setSelectedDate(null);
  };

  const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-5 h-5 rounded-full border-2 animate-spin"
          style={{ borderColor: "var(--blue)", borderTopColor: "transparent" }} />
      </div>
    );
  }

  const cells: (number | null)[] = [
    ...Array.from({ length: firstDow }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>

      {/* 헤더 */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="label-text mb-1.5">MONTHLY OVERVIEW</p>
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-1)" }}>
            {viewYear}년 {viewMonth + 1}월 기록
          </h2>
        </div>
        <div className="flex items-center gap-1">
          <motion.button onClick={prevMonth} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(136,192,224,0.06)", border: "1px solid var(--border-2)" }}>
            <ChevronLeft className="w-3.5 h-3.5" style={{ color: "var(--text-3)" }} />
          </motion.button>
          {!isCurrentMonth && (
            <motion.button onClick={() => { setViewYear(today.getFullYear()); setViewMonth(today.getMonth()); }}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="px-2.5 py-1 rounded-lg text-[10px] font-medium"
              style={{ background: "rgba(136,192,224,0.08)", border: "1px solid var(--border-1)", color: "var(--blue)" }}>
              이번 달
            </motion.button>
          )}
          <motion.button onClick={nextMonth} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            disabled={isCurrentMonth}
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(136,192,224,0.06)", border: "1px solid var(--border-2)", opacity: isCurrentMonth ? 0.3 : 1 }}>
            <ChevronRight className="w-3.5 h-3.5" style={{ color: "var(--text-3)" }} />
          </motion.button>
        </div>
      </div>

      {/* 월간 통계 */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: "평균 달성률", value: `${monthStats.avgPct}%`, color: "var(--blue)" },
          { label: "완벽한 날", value: `${monthStats.perfectDays}일`, color: "var(--amber)" },
          { label: "총 체크 수", value: `${monthStats.totalChecks}회`, color: "var(--text-2)" },
        ].map(({ label, value, color }) => (
          <div key={label} className="p-3 rounded-xl text-center"
            style={{ background: "rgba(136,192,224,0.03)", border: "1px solid var(--border-2)" }}>
            <p className="label-text mb-1">{label}</p>
            <p className="text-sm font-bold" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* 캘린더 */}
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border-2)" }}>
        {/* 요일 헤더 */}
        <div className="grid grid-cols-7">
          {DAY_LABELS.map((d, i) => (
            <div key={d} className="py-2 text-center text-[10px] font-medium"
              style={{
                color: i === 0 ? "#c87070" : i === 6 ? "var(--blue-dim)" : "var(--text-3)",
                background: "rgba(136,192,224,0.03)",
                borderBottom: "1px solid var(--border-2)",
              }}>
              {d}
            </div>
          ))}
        </div>

        {/* 날짜 셀 */}
        <div className="grid grid-cols-7">
          {cells.map((day, idx) => {
            if (!day) return (
              <div key={`e-${idx}`} className="aspect-square"
                style={{ borderRight: "1px solid var(--border-2)", borderBottom: "1px solid var(--border-2)" }} />
            );
            const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const isFuture = dateStr > todayStr;
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDate;
            const stats = dayStats[dateStr] ?? { done: 0, pct: 0 };
            const dow = (firstDow + day - 1) % 7;
            const isSun = dow === 0, isSat = dow === 6;

            const pct = stats.pct;
            const bgAlpha = isFuture ? 0 : pct === 0 ? 0.01 : pct < 50 ? 0.04 : pct < 100 ? 0.08 : 0.14;

            return (
              <motion.div key={dateStr}
                whileHover={{ scale: 0.95 }}
                onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                className="aspect-square flex flex-col items-center justify-center cursor-pointer relative"
                style={{
                  background: isSelected
                    ? "rgba(136,192,224,0.12)"
                    : `rgba(136,192,224,${bgAlpha})`,
                  borderRight: "1px solid var(--border-2)",
                  borderBottom: "1px solid var(--border-2)",
                  outline: isSelected ? "1.5px solid rgba(136,192,224,0.4)" : isToday ? "1.5px solid rgba(136,192,224,0.25)" : "none",
                  outlineOffset: "-1.5px",
                }}>
                <span className="text-[11px] font-medium leading-tight"
                  style={{
                    color: isFuture ? "var(--text-4)" :
                      isToday ? "var(--blue)" :
                      isSun ? "#c87070" : isSat ? "var(--blue-dim)" : "var(--text-2)",
                    fontFamily: "var(--font-en)",
                  }}>
                  {day}
                </span>
                {!isFuture && habits.length > 0 && (
                  <div className="w-1.5 h-1.5 rounded-full mt-0.5"
                    style={{
                      background: pct === 0 ? "rgba(200,100,100,0.3)" :
                        pct < 50 ? "var(--amber)" :
                        pct < 100 ? "rgba(136,192,224,0.5)" : "var(--blue)",
                      boxShadow: pct === 100 ? "0 0 5px rgba(136,192,224,0.6)" : "none",
                    }} />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 범례 */}
      <div className="flex items-center gap-4 mt-3 justify-end flex-wrap">
        {[
          { dot: "var(--blue)", label: "100%" },
          { dot: "rgba(136,192,224,0.5)", label: "50%+" },
          { dot: "var(--amber)", label: "50%-" },
          { dot: "rgba(200,100,100,0.3)", label: "0%" },
        ].map(({ dot, label }) => (
          <div key={label} className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: dot }} />
            <span className="text-[10px]" style={{ color: "var(--text-4)" }}>{label}</span>
          </div>
        ))}
      </div>

      {/* 선택된 날 상세 */}
      <AnimatePresence mode="wait">
        {selectedDate && selectedDetail && (
          <motion.div key={selectedDate}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            className="mt-4 p-4 rounded-xl"
            style={{ background: "rgba(136,192,224,0.02)", border: "1px solid var(--border-2)" }}>
            <div className="flex items-center justify-between mb-3">
              <p className="label-text">
                {viewMonth + 1}월 {parseInt(selectedDate.slice(8))}일 상세
              </p>
              {!selectedDetail.isFuture && habits.length > 0 && (
                <p className="text-xs font-semibold" style={{ color: "var(--blue)" }}>
                  {selectedDetail.habitDetails.filter(h => h.done).length}/{habits.length} 완료
                </p>
              )}
            </div>
            {selectedDetail.isFuture ? (
              <p className="text-xs" style={{ color: "var(--text-4)" }}>아직 오지 않은 날이에요.</p>
            ) : habits.length === 0 ? (
              <p className="text-xs" style={{ color: "var(--text-4)" }}>루틴이 없어요.</p>
            ) : (
              <div className="flex items-center gap-2 flex-wrap">
                {selectedDetail.habitDetails.map(({ habit, done }) => (
                  <div key={habit.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                    style={{
                      background: done ? "rgba(136,192,224,0.07)" : "rgba(200,100,100,0.05)",
                      border: done ? "1px solid rgba(136,192,224,0.18)" : "1px solid rgba(200,100,100,0.12)",
                    }}>
                    <span className="text-xs">{habit.icon}</span>
                    <span className="text-[9px]" style={{ color: done ? "var(--blue)" : "#c87070" }}>
                      {habit.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
