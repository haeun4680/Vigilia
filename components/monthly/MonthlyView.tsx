"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Check, X, Minus } from "lucide-react";
import { useHabits } from "@/lib/habit-context";
import type { Habit, HabitCheck } from "@/lib/supabase";

const DAY_SHORT = ["일","월","화","수","목","금","토"];

type DayInfo = {
  dateStr: string;
  dayShort: string;
  date: number;
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
  isCurrentMonth: boolean;
};

function RingProgress({ pct, isToday, size = 52 }: { pct: number; isToday: boolean; size?: number }) {
  const r = size * 0.38;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);
  const cx = size / 2, cy = size / 2;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={cx} cy={cy} r={r} fill="none"
          stroke="rgba(136,192,224,0.06)" strokeWidth={3} />
        <motion.circle cx={cx} cy={cy} r={r} fill="none"
          stroke={pct === 0 ? "rgba(136,192,224,0.06)" : isToday ? "var(--blue)" : "var(--blue-dim)"}
          strokeWidth={isToday ? 3.5 : 2.5} strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          transform={`rotate(-90 ${cx} ${cy})`}
          style={pct > 0 ? { filter: `drop-shadow(0 0 ${isToday ? 4 : 2}px rgba(136,192,224,${isToday ? 0.5 : 0.25}))` } : undefined}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-bold tabular-nums"
          style={{
            fontSize: size * 0.2,
            color: pct === 0 ? "var(--text-4)" : isToday ? "var(--blue)" : "var(--text-2)",
            fontFamily: "var(--font-en)",
          }}>
          {pct}%
        </span>
      </div>
    </div>
  );
}

function DayColumn({ dayInfo, habits, checks, colIdx, selected, onSelect }: {
  dayInfo: DayInfo;
  habits: Habit[];
  checks: HabitCheck[];
  colIdx: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const { isToday, isFuture, isCurrentMonth, dayShort, date, dateStr } = dayInfo;

  const doneCount = habits.filter(h =>
    !isFuture && checks.some(c => c.habit_id === h.id && c.checked_date === dateStr)
  ).length;
  const pct = isFuture || habits.length === 0 ? 0 : Math.round((doneCount / habits.length) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: isCurrentMonth ? 1 : 0.35, y: 0 }}
      transition={{ delay: colIdx * 0.03 }}
      onClick={onSelect}
      className="flex flex-col cursor-pointer rounded-xl transition-all duration-200 flex-1 min-w-[100px]"
      style={{
        background: selected ? "rgba(136,192,224,0.05)" : isToday ? "rgba(136,192,224,0.03)" : "rgba(255,255,255,0.01)",
        border: selected ? "1px solid rgba(136,192,224,0.25)" :
          isToday ? "1px solid rgba(136,192,224,0.12)" : "1px solid rgba(255,255,255,0.04)",
        boxShadow: selected ? "0 0 16px rgba(136,192,224,0.07)" : "none",
      }}>

      {/* 요일 헤더 */}
      <div className="px-2 pt-2.5 pb-2 text-center"
        style={{ borderBottom: "1px solid rgba(136,192,224,0.06)" }}>
        <div className="text-[9px] font-medium tracking-widest mb-0.5"
          style={{ color: isToday ? "var(--blue)" : "var(--text-3)", fontFamily: "var(--font-en)" }}>
          {dayShort}
        </div>
        <div className="text-lg font-bold"
          style={{ color: isToday ? "var(--text-1)" : isCurrentMonth ? "var(--text-3)" : "var(--text-4)", fontFamily: "var(--font-en)" }}>
          {date}
        </div>
        {isToday && (
          <div className="text-[8px] tracking-widest" style={{ color: "var(--blue)" }}>오늘</div>
        )}
      </div>

      {/* 링 */}
      <div className="flex justify-center py-2">
        <RingProgress pct={pct} isToday={isToday} size={52} />
      </div>

      {/* 달성 수 */}
      {!isFuture && habits.length > 0 && (
        <div className="px-2 pb-2.5 text-center">
          <span className="text-[10px] font-semibold tabular-nums"
            style={{
              color: pct >= 80 ? "var(--blue)" : pct >= 50 ? "var(--amber)" : "#c87070",
              fontFamily: "var(--font-en)",
            }}>
            {doneCount}/{habits.length}
          </span>
        </div>
      )}
      {isFuture && (
        <div className="px-2 pb-2.5 text-center">
          <span className="text-[10px]" style={{ color: "var(--text-4)" }}>—</span>
        </div>
      )}
    </motion.div>
  );
}

function WeekSection({ weekDays, habits, checks, selectedDate, onSelect, weekIdx }: {
  weekDays: DayInfo[];
  habits: Habit[];
  checks: HabitCheck[];
  selectedDate: string | null;
  onSelect: (dateStr: string) => void;
  weekIdx: number;
}) {
  const currentMonthDays = weekDays.filter(d => d.isCurrentMonth && !d.isFuture);
  const weekDone = currentMonthDays.reduce((sum, d) =>
    sum + habits.filter(h => checks.some(c => c.habit_id === h.id && c.checked_date === d.dateStr)).length, 0);
  const weekPossible = currentMonthDays.length * habits.length;
  const weekPct = weekPossible === 0 ? 0 : Math.round((weekDone / weekPossible) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: weekIdx * 0.08 }}>
      {/* 주차 헤더 */}
      <div className="flex items-center justify-between mb-2">
        <span className="label-text">{weekIdx + 1}주차</span>
        {currentMonthDays.length > 0 && habits.length > 0 && (
          <span className="text-[10px] font-semibold"
            style={{
              color: weekPct >= 80 ? "var(--blue)" : weekPct >= 50 ? "var(--amber)" : "#c87070",
              fontFamily: "var(--font-en)",
            }}>
            {weekPct}%
          </span>
        )}
      </div>

      {/* 7일 컬럼 */}
      <div className="overflow-x-auto -mx-1 px-1 mb-3">
        <div className="flex gap-1.5" style={{ minWidth: "620px" }}>
          {weekDays.map((d, i) => (
            <DayColumn
              key={d.dateStr}
              dayInfo={d}
              habits={habits}
              checks={checks}
              colIdx={i}
              selected={selectedDate === d.dateStr}
              onSelect={() => onSelect(d.dateStr)}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export function MonthlyView() {
  const { habits, checks, loading } = useHabits();
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(todayStr);

  const isCurrentViewMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();

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

  // 이 달의 주 단위로 날짜 생성
  const weeks = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const lastDay = new Date(viewYear, viewMonth + 1, 0);
    const firstDow = firstDay.getDay(); // 0=일

    // 달력 시작일 (이전달 날짜 포함)
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDow);

    const allWeeks: DayInfo[][] = [];
    let current = new Date(startDate);

    while (current <= lastDay || current.getDay() !== 0) {
      const week: DayInfo[] = [];
      for (let i = 0; i < 7; i++) {
        const dateStr = current.toISOString().slice(0, 10);
        const isCurrentMonth = current.getMonth() === viewMonth;
        week.push({
          dateStr,
          dayShort: DAY_SHORT[current.getDay()],
          date: current.getDate(),
          isToday: dateStr === todayStr,
          isPast: dateStr < todayStr,
          isFuture: dateStr > todayStr,
          isCurrentMonth,
        });
        current.setDate(current.getDate() + 1);
      }
      allWeeks.push(week);
      if (current > lastDay && current.getDay() === 0) break;
    }

    return allWeeks;
  }, [viewYear, viewMonth, todayStr]);

  // 월간 통계
  const monthStats = useMemo(() => {
    const monthPrefix = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}`;
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const pastDays = Array.from({ length: daysInMonth }, (_, i) => {
      const d = `${monthPrefix}-${String(i + 1).padStart(2, "0")}`;
      return d <= todayStr ? d : null;
    }).filter(Boolean) as string[];

    if (pastDays.length === 0 || habits.length === 0) return { avgPct: 0, perfectDays: 0, totalChecks: 0 };

    const totalChecks = checks.filter(c => c.checked_date.startsWith(monthPrefix)).length;
    const totalPossible = habits.length * pastDays.length;
    const avgPct = Math.round((totalChecks / totalPossible) * 100);
    const perfectDays = pastDays.filter(d => {
      const done = checks.filter(c => c.checked_date === d).length;
      return done === habits.length;
    }).length;

    return { avgPct, perfectDays, totalChecks };
  }, [checks, habits, viewYear, viewMonth, todayStr]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-5 h-5 rounded-full border-2 animate-spin"
          style={{ borderColor: "var(--blue)", borderTopColor: "transparent" }} />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>

      {/* 헤더 */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="label-text mb-1.5">MONTHLY RESULTS</p>
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
          {!isCurrentViewMonth && (
            <motion.button
              onClick={() => { setViewYear(today.getFullYear()); setViewMonth(today.getMonth()); setSelectedDate(todayStr); }}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="px-2.5 py-1 rounded-lg text-[10px] font-medium"
              style={{ background: "rgba(136,192,224,0.08)", border: "1px solid var(--border-1)", color: "var(--blue)" }}>
              이번 달
            </motion.button>
          )}
          <motion.button onClick={nextMonth} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            disabled={isCurrentViewMonth}
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(136,192,224,0.06)", border: "1px solid var(--border-2)", opacity: isCurrentViewMonth ? 0.3 : 1 }}>
            <ChevronRight className="w-3.5 h-3.5" style={{ color: "var(--text-3)" }} />
          </motion.button>
        </div>
      </div>

      {/* 월간 통계 */}
      <div className="grid grid-cols-3 gap-3 mb-6">
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

      {/* 주차별 컬럼 */}
      <div className="space-y-4">
        {weeks.map((week, wi) => (
          <WeekSection
            key={wi}
            weekIdx={wi}
            weekDays={week}
            habits={habits}
            checks={checks}
            selectedDate={selectedDate}
            onSelect={(d) => setSelectedDate(selectedDate === d ? null : d)}
          />
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
                    {done
                      ? <Check className="w-2.5 h-2.5" style={{ color: "var(--blue)" }} />
                      : <X className="w-2.5 h-2.5" style={{ color: "#c87070" }} />
                    }
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
