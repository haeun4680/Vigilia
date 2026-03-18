"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, RefreshCw } from "lucide-react";
import { useHabits } from "@/lib/habit-context";

type CoachResult = {
  strength: string;
  improve: string;
  tip: string;
  score: number;
};

export function AiCoach() {
  const { habits, checks } = useHabits();
  const [result, setResult] = useState<CoachResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = async () => {
    setLoading(true);
    setError(null);

    // 이번 주 날짜 계산
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
    const weekDates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d.toISOString().slice(0, 10);
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

    const isInTauri = typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
    const analyzeUrl = isInTauri
      ? "https://habit-tracker-nine-sigma.vercel.app/api/analyze"
      : "/api/analyze";

    try {
      const res = await fetch(analyzeUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habits: habitsPayload, weeklyStats }),
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

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" style={{ color: "var(--blue)" }} />
          <span className="text-sm font-semibold" style={{ color: "var(--text-1)" }}>AI 루틴 코치</span>
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

      <AnimatePresence mode="wait">
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

        {error && !loading && (
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

        {result && !loading && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-2.5"
          >
            {/* 점수 */}
            <div className="flex items-center justify-between p-3 rounded-xl"
              style={{ background: "rgba(136,192,224,0.06)", border: "1px solid rgba(136,192,224,0.12)" }}>
              <span className="text-xs font-medium" style={{ color: "var(--text-2)" }}>이번 주 루틴 점수</span>
              <span className="text-lg font-bold" style={{ color: "var(--blue)" }}>{result.score}점</span>
            </div>

            {/* 잘하고 있는 점 */}
            <div className="space-y-1">
              <p className="text-[11px] font-semibold" style={{ color: "var(--blue-dim)" }}>✨ 잘하고 있어요</p>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-2)" }}>{result.strength}</p>
            </div>

            {/* 개선점 */}
            <div className="space-y-1">
              <p className="text-[11px] font-semibold" style={{ color: "var(--amber)" }}>💡 이렇게 해보세요</p>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-2)" }}>{result.improve}</p>
            </div>

            {/* 팁 */}
            <div className="p-2.5 rounded-lg space-y-1"
              style={{ background: "rgba(136,192,224,0.04)", border: "1px solid rgba(136,192,224,0.1)" }}>
              <p className="text-[11px] font-semibold" style={{ color: "var(--text-3)" }}>이번 주 팁</p>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-2)" }}>{result.tip}</p>
            </div>
          </motion.div>
        )}

        {!result && !loading && !error && (
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
