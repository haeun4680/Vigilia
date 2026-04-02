"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, RefreshCw, Coins } from "lucide-react";
import { useHabits, toLocalDateStr } from "@/lib/habit-context";
import { useForbidden } from "@/lib/forbidden-context";
import { useCoins } from "@/lib/coin-context";

const COIN_COST = 100;

type CoachResult = {
  strength: string;
  improve: string;
  tip: string;
  forbidden: string;
  score: number;
};

export function AiCoach() {
  const { habits, checks } = useHabits();
  const { habits: forbiddenHabits, checks: forbiddenChecks } = useForbidden();
  const { coins, isSubscribed, spendCoins, markAiWeeklyUsed } = useCoins();

  const [result, setResult] = useState<CoachResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmCoin, setConfirmCoin] = useState(false);

  // 무료 사용 가능 여부 — localStorage 기준 (DB 비동기 타이밍 문제 회피)
  const WEEKLY_KEY = "ai_coach_weekly_used";
  const checkCanUseFree = () => {
    if (isSubscribed) return true;
    const last = localStorage.getItem(WEEKLY_KEY);
    if (!last) return true;
    return Date.now() - Number(last) > 7 * 24 * 60 * 60 * 1000;
  };

  const buildPayload = () => {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
    const weekDates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return toLocalDateStr(d);
    });

    const habitsPayload = habits.map((h) => ({
      icon: h.icon ?? "✅",
      name: h.name,
      checks: weekDates.map((d) =>
        checks.some((c) => c.habit_id === h.id && c.checked_date === d)
      ),
    }));

    const totalPossible = habits.length * 7;
    const totalDone = habitsPayload.reduce((s, h) => s + h.checks.filter(Boolean).length, 0);
    const weeklyStats = totalPossible === 0 ? 0 : Math.round((totalDone / totalPossible) * 100);

    const forbiddenPayload = forbiddenHabits.map(h => {
      const violatedDays = weekDates.filter(d =>
        forbiddenChecks.some(c => c.habit_id === h.id && c.checked_date === d)
      ).length;
      return { icon: h.icon ?? "🚫", name: h.name, violatedDays, totalDays: 7 };
    });

    return { habitsPayload, weeklyStats, forbiddenPayload };
  };

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    setConfirmCoin(false);

    const { habitsPayload, weeklyStats, forbiddenPayload } = buildPayload();
    const isInTauri = typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
    const analyzeUrl = isInTauri
      ? "https://habit-tracker-nine-sigma.vercel.app/api/analyze"
      : "/api/analyze";

    try {
      const res = await fetch(analyzeUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habits: habitsPayload, weeklyStats, forbidden: forbiddenPayload }),
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
    if (checkCanUseFree()) {
      localStorage.setItem(WEEKLY_KEY, String(Date.now())); // 즉시 기록
      markAiWeeklyUsed(); // DB 동기화 (fire-and-forget)
      await runAnalysis();
    } else {
      setConfirmCoin(true);
    }
  };

  const analyzWithCoin = async () => {
    const ok = await spendCoins(COIN_COST, "ai_weekly_extra");
    if (!ok) {
      setError(`코인이 부족해요. (보유 ${coins}개 / 필요 ${COIN_COST}개)`);
      setConfirmCoin(false);
      return;
    }
    await runAnalysis();
  };

  // 무료 사용까지 남은 일수
  const lastUsed = typeof window !== "undefined" ? Number(localStorage.getItem(WEEKLY_KEY) ?? 0) : 0;
  const daysUntilFree = !checkCanUseFree() && lastUsed
    ? Math.ceil((7 * 24 * 60 * 60 * 1000 - (Date.now() - lastUsed)) / (24 * 60 * 60 * 1000))
    : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" style={{ color: "var(--blue)" }} />
          <span className="text-sm font-semibold" style={{ color: "var(--text-1)" }}>AI 루틴 코치</span>
          {!checkCanUseFree() && !isSubscribed && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full"
              style={{ background: "rgba(136,192,224,0.08)", color: "var(--text-4)", border: "1px solid var(--border-2)" }}>
              {daysUntilFree}일 후 무료
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* 코인 잔액 */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg"
            style={{ background: "rgba(255,200,60,0.08)", border: "1px solid rgba(255,200,60,0.2)" }}>
            <span className="text-xs">🌙</span>
            <span className="text-xs font-bold tabular-nums" style={{ color: "#f0c040" }}>{coins}</span>
          </div>
          <motion.button
            onClick={analyze}
            disabled={loading || habits.length === 0}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{
              background: "rgba(136,192,224,0.1)",
              border: "1px solid rgba(136,192,224,0.25)",
              color: "var(--blue)",
              opacity: (loading || habits.length === 0) ? 0.5 : 1,
            }}
          >
            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
            {loading ? "분석 중..." : result ? "재분석" : "분석하기"}
          </motion.button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* 코인 소모 확인 */}
        {confirmCoin && !loading && (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-3 rounded-xl space-y-2.5"
            style={{ background: "rgba(255,200,60,0.04)", border: "1px solid rgba(255,200,60,0.2)" }}
          >
            <p className="text-xs font-medium" style={{ color: "var(--text-2)" }}>
              이번 주 무료 분석을 이미 사용했어요.
            </p>
            <p className="text-[11px]" style={{ color: "var(--text-3)" }}>
              🌙 달빛 코인 {COIN_COST}개로 추가 분석할까요? (보유: {coins}개)
            </p>
            <div className="flex gap-2">
              <motion.button
                onClick={analyzWithCoin}
                disabled={coins < COIN_COST}
                whileTap={{ scale: 0.95 }}
                className="flex-1 py-1.5 rounded-lg text-xs font-semibold"
                style={{
                  background: coins >= COIN_COST ? "rgba(255,200,60,0.15)" : "rgba(136,192,224,0.05)",
                  border: `1px solid ${coins >= COIN_COST ? "rgba(255,200,60,0.35)" : "var(--border-2)"}`,
                  color: coins >= COIN_COST ? "#f0c040" : "var(--text-4)",
                  opacity: coins < COIN_COST ? 0.5 : 1,
                }}
              >
                {coins < COIN_COST ? `코인 부족 (${coins}/${COIN_COST})` : `🌙 ${COIN_COST}코인 사용`}
              </motion.button>
              <motion.button
                onClick={() => setConfirmCoin(false)}
                whileTap={{ scale: 0.95 }}
                className="px-3 py-1.5 rounded-lg text-xs"
                style={{ border: "1px solid var(--border-2)", color: "var(--text-4)" }}
              >
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
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-6 flex flex-col items-center gap-2"
          >
            <div className="w-6 h-6 rounded-full border-2 animate-spin"
              style={{ borderColor: "var(--blue)", borderTopColor: "transparent" }} />
            <p className="text-xs" style={{ color: "var(--text-3)" }}>루틴을 분석하는 중...</p>
          </motion.div>
        )}

        {error && !loading && !confirmCoin && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-3 rounded-lg text-xs"
            style={{ background: "rgba(248,113,113,0.08)", color: "#f87171", border: "1px solid rgba(248,113,113,0.2)" }}
          >
            {error}
          </motion.div>
        )}

        {result && !loading && !confirmCoin && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-2.5"
          >
            <div className="flex items-center justify-between p-3 rounded-xl"
              style={{ background: "rgba(136,192,224,0.06)", border: "1px solid rgba(136,192,224,0.12)" }}>
              <span className="text-xs font-medium" style={{ color: "var(--text-2)" }}>이번 주 루틴 점수</span>
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
              <p className="text-[11px] font-semibold" style={{ color: "var(--text-3)" }}>이번 주 팁</p>
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
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-4 text-center"
          >
            <p className="text-xs" style={{ color: "var(--text-4)" }}>
              분석하기 버튼을 눌러 AI 코칭을 받아보세요
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
