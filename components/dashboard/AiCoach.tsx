"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, TrendingUp, AlertCircle, Lightbulb, RefreshCw, KeyRound } from "lucide-react";
import { habitRows, overallStats, weeklyProgress } from "@/lib/mock-data";

type Analysis = {
  strength: string;
  improve: string;
  tip: string;
  score: number;
};

type State = "idle" | "loading" | "done" | "error" | "no_key";

const insightCards = [
  {
    key: "strength" as const,
    icon: TrendingUp,
    label: "STRENGTH",
    labelKo: "잘하고 있어요",
    color: "var(--blue)",
    bg: "rgba(136,192,224,0.06)",
    border: "rgba(136,192,224,0.2)",
  },
  {
    key: "improve" as const,
    icon: AlertCircle,
    label: "IMPROVE",
    labelKo: "이렇게 해봐요",
    color: "var(--lavender)",
    bg: "rgba(184,200,240,0.06)",
    border: "rgba(184,200,240,0.2)",
  },
  {
    key: "tip" as const,
    icon: Lightbulb,
    label: "TIP",
    labelKo: "이번 주 조언",
    color: "var(--amber)",
    bg: "rgba(240,208,144,0.06)",
    border: "rgba(240,208,144,0.18)",
  },
];

function ScoreRing({ score }: { score: number }) {
  const size = 64;
  const r = size * 0.38;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  const cx = size / 2, cy = size / 2;
  const color = score >= 80 ? "var(--blue)" : score >= 60 ? "var(--lavender)" : "var(--amber)";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={cx} cy={cy} r={r} fill="none"
          stroke="rgba(136,192,224,0.08)" strokeWidth={4} />
        <motion.circle cx={cx} cy={cy} r={r} fill="none"
          stroke={color} strokeWidth={4} strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ filter: `drop-shadow(0 0 5px ${color})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-bold tabular-nums" style={{ color, fontFamily: "var(--font-en)" }}>
          {score}
        </span>
      </div>
    </div>
  );
}

function LoadingDots() {
  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2].map((i) => (
        <motion.div key={i}
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: "var(--blue)" }}
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
          transition={{ duration: 1.2, delay: i * 0.2, repeat: Infinity }}
        />
      ))}
    </div>
  );
}

export function AiCoach() {
  const [state, setState] = useState<State>("idle");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);

  const weekDoneCount = habitRows.reduce((s, h) => s + h.checks.filter(Boolean).length, 0);
  const weekAvg = Math.round((weekDoneCount / (habitRows.length * 7)) * 100);

  const analyze = async () => {
    setState("loading");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          habits: habitRows,
          weeklyStats: weekAvg,
          monthlyRate: overallStats.completionRate,
          streak: overallStats.currentStreak,
          totalDays: overallStats.totalDays,
        }),
      });

      const data = await res.json();

      if (data.error === "API_KEY_MISSING") {
        setState("no_key");
        return;
      }
      if (data.error) throw new Error(data.error);

      setAnalysis(data);
      setState("done");
    } catch {
      setState("error");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }} className="w-full">

      {/* 헤더 */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="label-text mb-1.5">AI COACH</p>
          <h2 className="text-sm font-semibold flex items-center gap-2" style={{ color: "var(--text-1)" }}>
            <Sparkles className="w-3.5 h-3.5" style={{ color: "var(--blue)" }} />
            루틴 AI 분석
          </h2>
        </div>

        {(state === "idle" || state === "error" || state === "done") && (
          <button onClick={analyze}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
            style={{
              background: "rgba(136,192,224,0.08)",
              border: "1px solid rgba(136,192,224,0.2)",
              color: "var(--blue)",
            }}>
            {state === "done"
              ? <><RefreshCw className="w-3 h-3" /> 재분석</>
              : <><Sparkles className="w-3 h-3" /> 분석 시작</>
            }
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">

        {/* idle */}
        {state === "idle" && (
          <motion.div key="idle"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-8 gap-3"
            style={{ border: "1px dashed var(--border-1)", borderRadius: 12 }}>
            <Sparkles className="w-6 h-6" style={{ color: "rgba(136,192,224,0.3)" }} />
            <p className="text-xs text-center" style={{ color: "var(--text-3)" }}>
              분석 시작 버튼을 눌러<br />AI 루틴 코치의 인사이트를 받아보세요
            </p>
          </motion.div>
        )}

        {/* loading */}
        {state === "loading" && (
          <motion.div key="loading"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-10 gap-4">
            <LoadingDots />
            <p className="text-xs" style={{ color: "var(--text-3)" }}>루틴 데이터 분석 중...</p>
          </motion.div>
        )}

        {/* no key */}
        {state === "no_key" && (
          <motion.div key="no_key"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="p-4 rounded-xl flex items-start gap-3"
            style={{ background: "rgba(240,208,144,0.06)", border: "1px solid rgba(240,208,144,0.18)" }}>
            <KeyRound className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "var(--amber)" }} />
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: "var(--amber)" }}>API 키가 필요해요</p>
              <p className="text-[11px]" style={{ color: "var(--text-2)" }}>
                <code className="px-1 rounded" style={{ background: "rgba(255,255,255,0.05)" }}>.env.local</code> 파일에
                Gemini API 키를 입력해주세요.<br />
                <span style={{ color: "var(--text-3)" }}>
                  aistudio.google.com에서 무료로 발급 가능합니다.
                </span>
              </p>
            </div>
          </motion.div>
        )}

        {/* error */}
        {state === "error" && (
          <motion.div key="error"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="py-6 flex flex-col items-center gap-2">
            <p className="text-xs" style={{ color: "#c87070" }}>분석 중 오류가 발생했어요. 다시 시도해주세요.</p>
          </motion.div>
        )}

        {/* done */}
        {state === "done" && analysis && (
          <motion.div key="done"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="space-y-3">

            {/* 점수 + 요약 */}
            <div className="flex items-center gap-4 p-3 rounded-xl"
              style={{ background: "rgba(136,192,224,0.04)", border: "1px solid var(--border-2)" }}>
              <ScoreRing score={analysis.score} />
              <div>
                <p className="label-text mb-1">이번 달 루틴 점수</p>
                <p className="text-lg font-bold tabular-nums"
                  style={{
                    color: analysis.score >= 80 ? "var(--blue)" : analysis.score >= 60 ? "var(--lavender)" : "var(--amber)",
                    fontFamily: "var(--font-en)",
                  }}>
                  {analysis.score}점
                  <span className="text-xs font-normal ml-1.5" style={{ color: "var(--text-3)" }}>/ 100</span>
                </p>
              </div>
            </div>

            {/* 인사이트 카드 3개 */}
            {insightCards.map(({ key, icon: Icon, label, labelKo, color, bg, border }, i) => (
              <motion.div key={key}
                initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="p-3 rounded-xl"
                style={{ background: bg, border: `1px solid ${border}` }}>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Icon className="w-3 h-3" style={{ color }} />
                  <span className="label-text" style={{ color }}>{label}</span>
                  <span className="text-[9px]" style={{ color: "var(--text-3)" }}>— {labelKo}</span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-2)" }}>
                  {analysis[key]}
                </p>
              </motion.div>
            ))}
          </motion.div>
        )}

      </AnimatePresence>
    </motion.div>
  );
}
