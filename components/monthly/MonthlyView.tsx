"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowLeft, Check, X, Sparkles, RefreshCw } from "lucide-react";
import { useHabits, toLocalDateStr } from "@/lib/habit-context";
import type { Habit, HabitCheck } from "@/lib/supabase";
import { useForbidden } from "@/lib/forbidden-context";
import type { ForbiddenHabit, ForbiddenCheck } from "@/lib/forbidden-context";
import { useCoins } from "@/lib/coin-context";

const COIN_COST = 100;

// ─── AI 코치 ─────────────────────────────────────────────
type CoachResult = { strength: string; improve: string; tip: string; forbidden: string; score: number };

function MonthlyAiCoach({ habits, checks, forbiddenHabits, forbiddenChecks, mode, year, month }: {
  habits: Habit[]; checks: HabitCheck[];
  forbiddenHabits: ForbiddenHabit[]; forbiddenChecks: ForbiddenCheck[];
  mode: "year" | "month"; year: number; month?: number;
}) {
  const { coins, isSubscribed, aiMonthlyUsedAt, spendCoins, markAiMonthlyUsed } = useCoins();
  const [result, setResult] = useState<CoachResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmCoin, setConfirmCoin] = useState(false);

  const now = new Date();
  const canUseFree = isSubscribed ||
    !aiMonthlyUsedAt ||
    aiMonthlyUsedAt.getMonth() !== now.getMonth() ||
    aiMonthlyUsedAt.getFullYear() !== now.getFullYear();

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    setConfirmCoin(false);
    const todayStr = toLocalDateStr(new Date());

    let startStr: string;
    let endStr: string;
    let period: string;

    if (mode === "year") {
      startStr = `${year}-01-01`;
      endStr = todayStr;
      const endMonth = new Date().getMonth() + 1;
      period = `${year}년 1월~${endMonth}월`;
    } else {
      const m = month!;
      startStr = `${year}-${String(m + 1).padStart(2, "0")}-01`;
      const lastDay = new Date(year, m + 1, 0).getDate();
      endStr = `${year}-${String(m + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
      if (endStr > todayStr) endStr = todayStr;
      period = `${year}년 ${m + 1}월`;
    }

    // 기간 내 날짜 수
    const start = new Date(startStr);
    const end = new Date(endStr);
    const totalDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000) + 1);

    const habitsPayload = habits.map(h => {
      const completedDays = checks.filter(c =>
        c.habit_id === h.id && c.checked_date >= startStr && c.checked_date <= endStr
      ).length;
      const pct = Math.round((completedDays / totalDays) * 100);
      return { icon: h.icon ?? "✅", name: h.name, completedDays, totalDays, pct };
    });

    const totalDone = habitsPayload.reduce((s, h) => s + h.completedDays, 0);
    const avgPct = habits.length === 0 ? 0 : Math.round((totalDone / (habits.length * totalDays)) * 100);

    const isInTauri = typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
    const analyzeUrl = isInTauri
      ? "https://habit-tracker-nine-sigma.vercel.app/api/analyze-monthly"
      : "/api/analyze-monthly";

    const forbiddenPayload = forbiddenHabits.map(h => {
      const violatedDays = forbiddenChecks.filter(c =>
        c.habit_id === h.id && c.checked_date >= startStr && c.checked_date <= endStr
      ).length;
      const cleanPct = Math.round(((totalDays - violatedDays) / totalDays) * 100);
      return { icon: h.icon ?? "🚫", name: h.name, violatedDays, totalDays, cleanPct };
    });

    try {
      const res = await fetch(analyzeUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habits: habitsPayload, avgPct, period, mode, forbidden: forbiddenPayload }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error === "API_KEY_MISSING" ? "AI 기능이 아직 설정되지 않았어요." : data.error);
      } else {
        setResult(data);
      }
    } catch {
      setError("분석 중 오류가 발생했어요.");
    } finally {
      setLoading(false);
    }
  };

  const analyze = async () => {
    if (canUseFree) {
      await markAiMonthlyUsed();
      await runAnalysis();
    } else {
      setConfirmCoin(true);
    }
  };

  const analyzeWithCoin = async () => {
    const ok = await spendCoins(COIN_COST, "ai_monthly_extra");
    if (!ok) {
      setError(`코인이 부족해요. (보유 ${coins}개 / 필요 ${COIN_COST}개)`);
      setConfirmCoin(false);
      return;
    }
    await runAnalysis();
  };

  const labelText = mode === "year" ? `${year}년 올해 전체 분석` : `${year}년 ${month! + 1}월 분석`;
  const scoreLabel = mode === "year" ? "올해 루틴 점수" : `${month! + 1}월 루틴 점수`;

  return (
    <div className="mt-4 p-4 rounded-xl space-y-3"
      style={{ background: "rgba(136,192,224,0.02)", border: "1px solid var(--border-2)" }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" style={{ color: "var(--blue)" }} />
          <span className="text-sm font-semibold" style={{ color: "var(--text-1)" }}>AI 루틴 코치</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full"
            style={{ background: "rgba(136,192,224,0.08)", color: "var(--blue-dim)", border: "1px solid rgba(136,192,224,0.15)" }}>
            {labelText}
          </span>
          {!canUseFree && !isSubscribed && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full"
              style={{ background: "rgba(255,200,60,0.08)", color: "#f0c040", border: "1px solid rgba(255,200,60,0.2)" }}>
              이번 달 사용함
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg"
            style={{ background: "rgba(255,200,60,0.08)", border: "1px solid rgba(255,200,60,0.2)" }}>
            <span className="text-xs">🌙</span>
            <span className="text-xs font-bold tabular-nums" style={{ color: "#f0c040" }}>{coins}</span>
          </div>
          <motion.button onClick={analyze} disabled={loading || habits.length === 0}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{
              background: "rgba(136,192,224,0.1)", border: "1px solid rgba(136,192,224,0.25)",
              color: "var(--blue)", opacity: (loading || habits.length === 0) ? 0.5 : 1,
            }}>
            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
            {loading ? "분석 중..." : result ? "재분석" : "분석하기"}
          </motion.button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {confirmCoin && !loading && (
          <motion.div key="confirm" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="p-3 rounded-xl space-y-2.5"
            style={{ background: "rgba(255,200,60,0.04)", border: "1px solid rgba(255,200,60,0.2)" }}>
            <p className="text-xs font-medium" style={{ color: "var(--text-2)" }}>
              이번 달 무료 분석을 이미 사용했어요.
            </p>
            <p className="text-[11px]" style={{ color: "var(--text-3)" }}>
              🌙 달빛 코인 {COIN_COST}개로 추가 분석할까요? (보유: {coins}개)
            </p>
            <div className="flex gap-2">
              <motion.button onClick={analyzeWithCoin} disabled={coins < COIN_COST}
                whileTap={{ scale: 0.95 }}
                className="flex-1 py-1.5 rounded-lg text-xs font-semibold"
                style={{
                  background: coins >= COIN_COST ? "rgba(255,200,60,0.15)" : "rgba(136,192,224,0.05)",
                  border: `1px solid ${coins >= COIN_COST ? "rgba(255,200,60,0.35)" : "var(--border-2)"}`,
                  color: coins >= COIN_COST ? "#f0c040" : "var(--text-4)",
                  opacity: coins < COIN_COST ? 0.5 : 1,
                }}>
                {coins < COIN_COST ? `코인 부족 (${coins}/${COIN_COST})` : `🌙 ${COIN_COST}코인 사용`}
              </motion.button>
              <motion.button onClick={() => setConfirmCoin(false)} whileTap={{ scale: 0.95 }}
                className="px-3 py-1.5 rounded-lg text-xs"
                style={{ border: "1px solid var(--border-2)", color: "var(--text-4)" }}>
                취소
              </motion.button>
            </div>
            {coins < COIN_COST && (
              <p className="text-[10px]" style={{ color: "var(--text-4)" }}>
                💡 루틴을 일주일 연속 달성하면 10코인을 획득해요!
              </p>
            )}
          </motion.div>
        )}
        {loading && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="py-6 flex flex-col items-center gap-2">
            <div className="w-6 h-6 rounded-full border-2 animate-spin"
              style={{ borderColor: "var(--blue)", borderTopColor: "transparent" }} />
            <p className="text-xs" style={{ color: "var(--text-3)" }}>루틴을 분석하는 중...</p>
          </motion.div>
        )}
        {error && !loading && !confirmCoin && (
          <motion.div key="error" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="p-3 rounded-lg text-xs"
            style={{ background: "rgba(248,113,113,0.08)", color: "#f87171", border: "1px solid rgba(248,113,113,0.2)" }}>
            {error}
          </motion.div>
        )}
        {result && !loading && !confirmCoin && (
          <motion.div key="result" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="space-y-2.5">
            <div className="flex items-center justify-between p-3 rounded-xl"
              style={{ background: "rgba(136,192,224,0.06)", border: "1px solid rgba(136,192,224,0.12)" }}>
              <span className="text-xs font-medium" style={{ color: "var(--text-2)" }}>{scoreLabel}</span>
              <span className="text-lg font-bold" style={{ color: "var(--blue)" }}>{result.score}점</span>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] font-semibold" style={{ color: "var(--blue-dim)" }}>✨ 잘하고 있어요</p>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-2)" }}>{result.strength}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] font-semibold" style={{ color: "var(--amber)" }}>💡 이렇게 해보세요</p>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-2)" }}>{result.improve}</p>
            </div>
            <div className="p-2.5 rounded-lg space-y-1"
              style={{ background: "rgba(136,192,224,0.04)", border: "1px solid rgba(136,192,224,0.1)" }}>
              <p className="text-[11px] font-semibold" style={{ color: "var(--text-3)" }}>앞으로의 팁</p>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-2)" }}>{result.tip}</p>
            </div>
            {result.forbidden && (
              <div className="p-2.5 rounded-lg space-y-1"
                style={{ background: "rgba(200,80,80,0.04)", border: "1px solid rgba(200,80,80,0.15)" }}>
                <p className="text-[11px] font-semibold" style={{ color: "#c87070" }}>🚫 금지 목록 피드백</p>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-2)" }}>{result.forbidden}</p>
              </div>
            )}
          </motion.div>
        )}
        {!result && !loading && !error && !confirmCoin && (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-3 text-center">
            <p className="text-xs" style={{ color: "var(--text-4)" }}>분석하기 버튼을 눌러 AI 코칭을 받아보세요</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const DAY_SHORT = ["일","월","화","수","목","금","토"];
const MONTH_NAMES = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];

// ─── 링 프로그레스 ───────────────────────────────────────
function RingProgress({ pct, isToday, size = 52 }: { pct: number; isToday: boolean; size?: number }) {
  const r = size * 0.38;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);
  const cx = size / 2, cy = size / 2;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(136,192,224,0.06)" strokeWidth={3} />
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
          style={{ fontSize: size * 0.2, color: pct === 0 ? "var(--text-4)" : isToday ? "var(--blue)" : "var(--text-2)", fontFamily: "var(--font-en)" }}>
          {pct}%
        </span>
      </div>
    </div>
  );
}

// ─── 월별 통계 계산 ───────────────────────────────────────
function calcMonthStats(year: number, month: number, habits: Habit[], checks: HabitCheck[], todayStr: string) {
  const monthPrefix = `${year}-${String(month + 1).padStart(2, "0")}`;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const pastDays = Array.from({ length: daysInMonth }, (_, i) => {
    const d = `${monthPrefix}-${String(i + 1).padStart(2, "0")}`;
    return d <= todayStr ? d : null;
  }).filter(Boolean) as string[];

  if (pastDays.length === 0 || habits.length === 0) return { avgPct: 0, perfectDays: 0, totalChecks: 0, pastDays: 0 };

  const totalChecks = checks.filter(c => c.checked_date.startsWith(monthPrefix)).length;
  const totalPossible = habits.length * pastDays.length;
  const avgPct = Math.round((totalChecks / totalPossible) * 100);
  const perfectDays = pastDays.filter(d =>
    checks.filter(c => c.checked_date === d).length === habits.length
  ).length;

  return { avgPct, perfectDays, totalChecks, pastDays: pastDays.length };
}

// ─── 월별 카드 (연간 개요) ────────────────────────────────
function MonthCard({ year, month, habits, checks, forbiddenHabits, forbiddenChecks, todayStr, isCurrentMonth, isFuture, onClick }: {
  year: number; month: number;
  habits: Habit[]; checks: HabitCheck[];
  forbiddenHabits: ForbiddenHabit[]; forbiddenChecks: ForbiddenCheck[];
  todayStr: string; isCurrentMonth: boolean; isFuture: boolean;
  onClick: () => void;
}) {
  const stats = useMemo(
    () => calcMonthStats(year, month, habits, checks, todayStr),
    [year, month, habits, checks, todayStr]
  );

  const pctColor = stats.avgPct >= 80 ? "var(--blue)" : stats.avgPct >= 50 ? "var(--amber)" : stats.avgPct > 0 ? "#c87070" : "var(--text-4)";

  const forbiddenCleanRate = useMemo(() => {
    if (forbiddenHabits.length === 0 || stats.pastDays === 0) return null;
    const monthPrefix = `${year}-${String(month + 1).padStart(2, "0")}`;
    const violatedDays = new Set(
      forbiddenChecks.filter(c => c.checked_date.startsWith(monthPrefix)).map(c => c.checked_date)
    ).size;
    return Math.round(((stats.pastDays - violatedDays) / stats.pastDays) * 100);
  }, [forbiddenHabits, forbiddenChecks, year, month, stats.pastDays]);

  return (
    <motion.div
      whileHover={!isFuture ? { scale: 1.02, y: -2 } : {}}
      whileTap={!isFuture ? { scale: 0.98 } : {}}
      onClick={!isFuture ? onClick : undefined}
      className="p-3 rounded-xl flex flex-col gap-2"
      style={{
        background: isCurrentMonth ? "rgba(136,192,224,0.05)" : "rgba(136,192,224,0.02)",
        border: isCurrentMonth ? "1px solid rgba(136,192,224,0.2)" : "1px solid var(--border-2)",
        cursor: isFuture ? "default" : "pointer",
        opacity: isFuture ? 0.35 : 1,
      }}>
      {/* 월 이름 */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold" style={{ color: isCurrentMonth ? "var(--blue)" : "var(--text-2)" }}>
          {MONTH_NAMES[month]}
        </span>
        {isCurrentMonth && (
          <span className="text-[8px] px-1.5 py-0.5 rounded-full"
            style={{ background: "rgba(136,192,224,0.12)", color: "var(--blue)" }}>이번 달</span>
        )}
      </div>

      {/* 달성률 바 */}
      {!isFuture && habits.length > 0 && stats.pastDays > 0 ? (
        <>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(136,192,224,0.08)" }}>
            <motion.div className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${stats.avgPct}%` }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              style={{ background: pctColor, boxShadow: stats.avgPct > 0 ? `0 0 6px ${pctColor}40` : "none" }} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold" style={{ color: pctColor, fontFamily: "var(--font-en)" }}>
              {stats.avgPct}%
            </span>
            <span className="text-[9px]" style={{ color: "var(--text-4)" }}>
              {stats.perfectDays}일 완벽
            </span>
          </div>
          {forbiddenCleanRate !== null && (
            <>
              <div className="h-0.5 rounded-full overflow-hidden" style={{ background: "rgba(200,80,80,0.1)" }}>
                <motion.div className="h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${forbiddenCleanRate}%` }}
                  transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
                  style={{
                    background: forbiddenCleanRate === 100 ? "var(--blue)" : forbiddenCleanRate >= 60 ? "var(--amber)" : "#c87070",
                  }} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[9px]" style={{ color: "var(--text-4)" }}>🚫 자제율</span>
                <span className="text-[9px] font-semibold" style={{
                  color: forbiddenCleanRate === 100 ? "var(--blue)" : forbiddenCleanRate >= 60 ? "var(--amber)" : "#c87070",
                  fontFamily: "var(--font-en)"
                }}>{forbiddenCleanRate}%</span>
              </div>
            </>
          )}
        </>
      ) : (
        <div className="text-[9px]" style={{ color: "var(--text-4)" }}>
          {isFuture ? "—" : habits.length === 0 ? "루틴 없음" : "기록 없음"}
        </div>
      )}
    </motion.div>
  );
}

// ─── 주간 컬럼 (월 상세 내부) ─────────────────────────────
type DayInfo = {
  dateStr: string; dayShort: string; date: number;
  isToday: boolean; isFuture: boolean; isCurrentMonth: boolean;
};

function DayColumn({ dayInfo, habits, checks, colIdx, selected, onSelect }: {
  dayInfo: DayInfo; habits: Habit[]; checks: HabitCheck[];
  colIdx: number; selected: boolean; onSelect: () => void;
}) {
  const { isToday, isFuture, isCurrentMonth, dayShort, date, dateStr } = dayInfo;
  const doneCount = habits.filter(h =>
    !isFuture && checks.some(c => c.habit_id === h.id && c.checked_date === dateStr)
  ).length;
  const pct = isFuture || habits.length === 0 ? 0 : Math.round((doneCount / habits.length) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: isCurrentMonth ? 1 : 0.3, y: 0 }}
      transition={{ delay: colIdx * 0.03 }}
      onClick={onSelect}
      className="flex flex-col cursor-pointer rounded-xl flex-1 min-w-[100px]"
      style={{
        background: selected ? "rgba(136,192,224,0.05)" : isToday ? "rgba(136,192,224,0.03)" : "rgba(255,255,255,0.01)",
        border: selected ? "1px solid rgba(136,192,224,0.25)" : isToday ? "1px solid rgba(136,192,224,0.12)" : "1px solid rgba(255,255,255,0.04)",
        boxShadow: selected ? "0 0 16px rgba(136,192,224,0.07)" : "none",
      }}>
      <div className="px-2 pt-2.5 pb-2 text-center" style={{ borderBottom: "1px solid rgba(136,192,224,0.06)" }}>
        <div className="text-[9px] font-medium tracking-widest mb-0.5"
          style={{ color: isToday ? "var(--blue)" : "var(--text-3)", fontFamily: "var(--font-en)" }}>{dayShort}</div>
        <div className="text-lg font-bold"
          style={{ color: isToday ? "var(--text-1)" : isCurrentMonth ? "var(--text-3)" : "var(--text-4)", fontFamily: "var(--font-en)" }}>{date}</div>
        {isToday && <div className="text-[8px] tracking-widest" style={{ color: "var(--blue)" }}>오늘</div>}
      </div>
      <div className="flex justify-center py-2">
        <RingProgress pct={pct} isToday={isToday} size={52} />
      </div>
      <div className="px-2 pb-2.5 text-center">
        {!isFuture && habits.length > 0 ? (
          <span className="text-[10px] font-semibold tabular-nums"
            style={{ color: pct >= 80 ? "var(--blue)" : pct >= 50 ? "var(--amber)" : "#c87070", fontFamily: "var(--font-en)" }}>
            {doneCount}/{habits.length}
          </span>
        ) : (
          <span className="text-[10px]" style={{ color: "var(--text-4)" }}>—</span>
        )}
      </div>
    </motion.div>
  );
}

// ─── 월 상세 뷰 ───────────────────────────────────────────
function MonthDetail({ year, month, habits, checks, forbiddenHabits, forbiddenChecks, todayStr, onBack }: {
  year: number; month: number;
  habits: Habit[]; checks: HabitCheck[];
  forbiddenHabits: ForbiddenHabit[]; forbiddenChecks: ForbiddenCheck[];
  todayStr: string; onBack: () => void;
}) {
  const [selectedDate, setSelectedDate] = useState<string | null>(() => {
    // 이번 달이면 오늘, 아니면 null
    const prefix = `${year}-${String(month + 1).padStart(2, "0")}`;
    return todayStr.startsWith(prefix) ? todayStr : null;
  });

  const stats = useMemo(() => calcMonthStats(year, month, habits, checks, todayStr), [year, month, habits, checks, todayStr]);

  // 주 단위로 날짜 생성
  const weeks = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDow = firstDay.getDay();
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDow);

    const allWeeks: DayInfo[][] = [];
    const current = new Date(startDate);

    while (current <= lastDay || current.getDay() !== 0) {
      const week: DayInfo[] = [];
      for (let i = 0; i < 7; i++) {
        const dateStr = toLocalDateStr(current);
        week.push({
          dateStr,
          dayShort: DAY_SHORT[current.getDay()],
          date: current.getDate(),
          isToday: dateStr === todayStr,
          isFuture: dateStr > todayStr,
          isCurrentMonth: current.getMonth() === month,
        });
        current.setDate(current.getDate() + 1);
      }
      allWeeks.push(week);
      if (current > lastDay && current.getDay() === 0) break;
    }
    return allWeeks;
  }, [year, month, todayStr]);

  const selectedDetail = useMemo(() => {
    if (!selectedDate) return null;
    return {
      isFuture: selectedDate > todayStr,
      habitDetails: habits.map(h => ({
        habit: h,
        done: checks.some(c => c.habit_id === h.id && c.checked_date === selectedDate),
      })),
    };
  }, [selectedDate, habits, checks, todayStr]);

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.25 }}>

      {/* 헤더 */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <motion.button onClick={onBack} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 text-xs"
            style={{ color: "var(--text-3)" }}>
            <ArrowLeft className="w-3.5 h-3.5" />
            월별 보기
          </motion.button>
          <div className="w-px h-4" style={{ background: "var(--border-2)" }} />
          <div>
            <p className="label-text mb-0.5">MONTHLY DETAIL</p>
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-1)" }}>
              {year}년 {month + 1}월 기록
            </h2>
          </div>
        </div>
      </div>

      {/* 월간 통계 */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: "평균 달성률", value: `${stats.avgPct}%`, color: "var(--blue)" },
          { label: "완벽한 날", value: `${stats.perfectDays}일`, color: "var(--amber)" },
          { label: "총 체크 수", value: `${stats.totalChecks}회`, color: "var(--text-2)" },
        ].map(({ label, value, color }) => (
          <div key={label} className="p-3 rounded-xl text-center"
            style={{ background: "rgba(136,192,224,0.03)", border: "1px solid var(--border-2)" }}>
            <p className="label-text mb-1">{label}</p>
            <p className="text-sm font-bold" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* 금지 목록 통계 */}
      {forbiddenHabits.length > 0 && (() => {
        const monthPrefix = `${year}-${String(month + 1).padStart(2, "0")}`;
        const monthViolations = forbiddenChecks.filter(c => c.checked_date.startsWith(monthPrefix));
        const violatedDays = new Set(monthViolations.map(c => c.checked_date)).size;
        const cleanDays = stats.pastDays - violatedDays;
        const cleanRate = stats.pastDays === 0 ? 0 : Math.round((cleanDays / stats.pastDays) * 100);
        const rateColor = cleanRate === 100 ? "var(--blue)" : cleanRate >= 60 ? "var(--amber)" : "#c87070";
        return (
          <div className="mb-6 p-3 rounded-xl" style={{ background: "rgba(200,80,80,0.03)", border: "1px solid rgba(200,80,80,0.12)" }}>
            <div className="flex items-center justify-between mb-2">
              <span className="label-text">🚫 금지 목록 자제율</span>
              <span className="text-sm font-bold" style={{ color: rateColor, fontFamily: "var(--font-en)" }}>{cleanRate}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden mb-3" style={{ background: "rgba(200,80,80,0.1)" }}>
              <motion.div className="h-full rounded-full"
                initial={{ width: 0 }} animate={{ width: `${cleanRate}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{ background: rateColor, boxShadow: `0 0 6px ${rateColor}40` }} />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "클린 유지일", value: `${cleanDays}일`, color: "var(--blue)" },
                { label: "위반 발생일", value: `${violatedDays}일`, color: "#c87070" },
                { label: "총 위반 수", value: `${monthViolations.length}회`, color: "var(--text-3)" },
              ].map(({ label, value, color }) => (
                <div key={label} className="text-center">
                  <p className="label-text mb-0.5">{label}</p>
                  <p className="text-xs font-bold" style={{ color }}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* 주차별 컬럼 */}
      <div className="space-y-4">
        {weeks.map((week, wi) => {
          const currentMonthDays = week.filter(d => d.isCurrentMonth && !d.isFuture);
          const weekDone = currentMonthDays.reduce((sum, d) =>
            sum + habits.filter(h => checks.some(c => c.habit_id === h.id && c.checked_date === d.dateStr)).length, 0);
          const weekPossible = currentMonthDays.length * habits.length;
          const weekPct = weekPossible === 0 ? 0 : Math.round((weekDone / weekPossible) * 100);

          return (
            <motion.div key={wi} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: wi * 0.07 }}>
              <div className="flex items-center justify-between mb-2">
                <span className="label-text">{wi + 1}주차</span>
                {currentMonthDays.length > 0 && habits.length > 0 && (
                  <span className="text-[10px] font-semibold"
                    style={{ color: weekPct >= 80 ? "var(--blue)" : weekPct >= 50 ? "var(--amber)" : "#c87070", fontFamily: "var(--font-en)" }}>
                    {weekPct}%
                  </span>
                )}
              </div>
              <div className="overflow-x-auto -mx-1 px-1">
                <div className="flex gap-1.5" style={{ minWidth: "620px" }}>
                  {week.map((d, i) => (
                    <DayColumn key={d.dateStr} dayInfo={d} habits={habits} checks={checks}
                      colIdx={i} selected={selectedDate === d.dateStr}
                      onSelect={() => setSelectedDate(selectedDate === d.dateStr ? null : d.dateStr)} />
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
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
              <p className="label-text">{month + 1}월 {parseInt(selectedDate.slice(8))}일 상세</p>
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
                    <span className="text-[9px]" style={{ color: done ? "var(--blue)" : "#c87070" }}>{habit.name}</span>
                    {done
                      ? <Check className="w-2.5 h-2.5" style={{ color: "var(--blue)" }} />
                      : <X className="w-2.5 h-2.5" style={{ color: "#c87070" }} />}
                  </div>
                ))}
              </div>
            )}
            {forbiddenHabits.length > 0 && !selectedDetail.isFuture && (
              <div className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(200,80,80,0.1)" }}>
                <p className="label-text mb-2">🚫 금지 목록</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {forbiddenHabits.map(h => {
                    const violated = forbiddenChecks.some(c => c.habit_id === h.id && c.checked_date === selectedDate);
                    return (
                      <div key={h.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                        style={{
                          background: violated ? "rgba(200,80,80,0.07)" : "rgba(136,192,224,0.05)",
                          border: violated ? "1px solid rgba(200,80,80,0.2)" : "1px solid rgba(136,192,224,0.15)",
                        }}>
                        <span className="text-xs">{h.icon}</span>
                        <span className="text-[9px]" style={{ color: violated ? "#c87070" : "var(--blue-dim)" }}>{h.name}</span>
                        {violated
                          ? <X className="w-2.5 h-2.5" style={{ color: "#c87070" }} />
                          : <Check className="w-2.5 h-2.5" style={{ color: "var(--blue)" }} />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 월별 AI 코치 */}
      <MonthlyAiCoach habits={habits} checks={checks} forbiddenHabits={forbiddenHabits} forbiddenChecks={forbiddenChecks} mode="month" year={year} month={month} />
    </motion.div>
  );
}

// ─── 메인: 연간 월별 개요 ─────────────────────────────────
export function MonthlyView() {
  const { habits, checks, loading } = useHabits();
  const { habits: forbiddenHabits, checks: forbiddenChecks } = useForbidden();
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [detailMonth, setDetailMonth] = useState<number | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-5 h-5 rounded-full border-2 animate-spin"
          style={{ borderColor: "var(--blue)", borderTopColor: "transparent" }} />
      </div>
    );
  }

  // 상세 뷰
  if (detailMonth !== null) {
    return (
      <AnimatePresence mode="wait">
        <MonthDetail
          key={`${viewYear}-${detailMonth}`}
          year={viewYear} month={detailMonth}
          habits={habits} checks={checks}
          forbiddenHabits={forbiddenHabits} forbiddenChecks={forbiddenChecks}
          todayStr={todayStr}
          onBack={() => setDetailMonth(null)}
        />
      </AnimatePresence>
    );
  }

  // 연간 개요
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>

      {/* 헤더 */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="label-text mb-1.5">MONTHLY OVERVIEW</p>
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-1)" }}>{viewYear}년 월별 기록</h2>
        </div>
        <div className="flex items-center gap-1">
          <motion.button onClick={() => setViewYear(y => y - 1)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(136,192,224,0.06)", border: "1px solid var(--border-2)" }}>
            <ChevronLeft className="w-3.5 h-3.5" style={{ color: "var(--text-3)" }} />
          </motion.button>
          {viewYear !== today.getFullYear() && (
            <motion.button onClick={() => setViewYear(today.getFullYear())}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="px-2.5 py-1 rounded-lg text-[10px] font-medium"
              style={{ background: "rgba(136,192,224,0.08)", border: "1px solid var(--border-1)", color: "var(--blue)" }}>
              올해
            </motion.button>
          )}
          <motion.button onClick={() => setViewYear(y => y + 1)}
            disabled={viewYear >= today.getFullYear()}
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(136,192,224,0.06)", border: "1px solid var(--border-2)", opacity: viewYear >= today.getFullYear() ? 0.3 : 1 }}>
            <ChevronRight className="w-3.5 h-3.5" style={{ color: "var(--text-3)" }} />
          </motion.button>
        </div>
      </div>

      {/* 12개월 그리드 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: 12 }, (_, i) => {
          const isCurrent = viewYear === today.getFullYear() && i === today.getMonth();
          const isFuture = viewYear > today.getFullYear() ||
            (viewYear === today.getFullYear() && i > today.getMonth());
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <MonthCard
                year={viewYear} month={i}
                habits={habits} checks={checks}
                forbiddenHabits={forbiddenHabits} forbiddenChecks={forbiddenChecks}
                todayStr={todayStr}
                isCurrentMonth={isCurrent}
                isFuture={isFuture}
                onClick={() => setDetailMonth(i)}
              />
            </motion.div>
          );
        })}
      </div>

      <p className="text-[10px] text-center mt-4" style={{ color: "var(--text-4)" }}>
        월을 클릭하면 상세 기록을 볼 수 있어요
      </p>

      {/* 연간 AI 코치 */}
      <MonthlyAiCoach habits={habits} checks={checks} forbiddenHabits={forbiddenHabits} forbiddenChecks={forbiddenChecks} mode="year" year={viewYear} />
    </motion.div>
  );
}
