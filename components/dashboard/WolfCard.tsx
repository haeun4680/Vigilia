"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useHabits, toLocalDateStr } from "@/lib/habit-context";

const STAGES = [
  { stage: 1, name: "달빛 알",           image: "/wolf/rmbg_wolf-1-egg.png",    minXP: 0,     nextXP: 1000,  glow: "rgba(43,143,240,0.30)" },
  { stage: 2, name: "아기 늑대",          image: "/wolf/rmbg_wolf-2-baby.png",   minXP: 1000,  nextXP: 5000,  glow: "rgba(43,143,240,0.45)" },
  { stage: 3, name: "소년 늑대",          image: "/wolf/rmbg_wolf-3-young.png",  minXP: 5000,  nextXP: 15000, glow: "rgba(80,160,255,0.55)" },
  { stage: 4, name: "성체 늑대",          image: "/wolf/rmbg_wolf-4-adult.png",  minXP: 15000, nextXP: 30000, glow: "rgba(112,192,255,0.70)" },
  { stage: 5, name: "전설의 문라이트 울프", image: "/wolf/rmbg_wolf-5-legend.png", minXP: 30000, nextXP: 30000, glow: "rgba(255,200,50,0.65)" },
];

function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function WolfCard() {
  const { habits, checks } = useHabits();

  const { xp, stage, progressPct, penaltyYesterday } = useMemo(() => {
    const empty = { xp: 0, stage: STAGES[0], progressPct: 0, penaltyYesterday: false };
    if (habits.length === 0 || checks.length === 0) return empty;

    const today = new Date();
    const todayStr = toLocalDateStr(today);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = toLocalDateStr(yesterday);

    const firstCheck = [...checks]
      .sort((a, b) => a.checked_date.localeCompare(b.checked_date))[0].checked_date;

    const checkMap = new Map<string, number>();
    checks.forEach(c => {
      checkMap.set(c.checked_date, (checkMap.get(c.checked_date) || 0) + 1);
    });

    let xp = 0;
    const d = parseLocalDate(firstCheck);

    while (toLocalDateStr(d) < todayStr) {
      const dateStr = toLocalDateStr(d);
      const completed = checkMap.get(dateStr) || 0;
      const rate = Math.min(Math.round((completed / habits.length) * 100), 100);

      if (completed === 0) {
        xp = Math.max(0, xp - 300);
      } else {
        xp += rate;
      }

      d.setDate(d.getDate() + 1);
    }

    const currentStage = [...STAGES].reverse().find(s => xp >= s.minXP) ?? STAGES[0];
    const isMax = currentStage.stage === 5;
    const progressPct = isMax
      ? 100
      : Math.round(((xp - currentStage.minXP) / (currentStage.nextXP - currentStage.minXP)) * 100);

    const firstDate = parseLocalDate(firstCheck);
    const penaltyYesterday =
      (checkMap.get(yesterdayStr) || 0) === 0 && firstDate < yesterday;

    return { xp, stage: currentStage, progressPct, penaltyYesterday };
  }, [habits, checks]);

  const isMax = stage.stage === 5;

  // 단계별 애니메이션
  const wolfAnimate = stage.stage === 1
    ? { y: [0, -5, 0] }                                      // 알: 둥실둥실
    : stage.stage === 2
    ? { rotate: [-4, 4, -4], y: [0, -2, 0] }                // 아기: 살랑살랑
    : stage.stage === 3
    ? { scaleX: [1, 1.04, 1], scaleY: [1, 0.97, 1] }        // 소년: 숨쉬기
    : stage.stage === 4
    ? { rotate: [-2, 2, -2], y: [0, -3, 0] }                // 성체: 앞뒤로 기울기
    : { y: [0, -6, 0], scale: [1, 1.04, 1] };               // 전설: 위엄있게 부유

  const wolfTransition = stage.stage === 1
    ? { duration: 3.5, repeat: Infinity, ease: "easeInOut" }
    : stage.stage === 2
    ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
    : stage.stage === 3
    ? { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
    : stage.stage === 4
    ? { duration: 2.0, repeat: Infinity, ease: "easeInOut" }
    : { duration: 4.0, repeat: Infinity, ease: "easeInOut" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center gap-3 pb-5"
      style={{ borderBottom: "1px solid var(--border-2)" }}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between w-full">
        <p className="label-text">WOLF COMPANION</p>
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{
            background: "rgba(43,143,240,0.12)",
            color: "var(--blue)",
            border: "1px solid rgba(43,143,240,0.2)",
          }}
        >
          Lv.{stage.stage}
        </span>
      </div>

      {/* 늑대 이미지 */}
      <motion.div
        className="relative flex items-center justify-center"
        animate={wolfAnimate}
        transition={wolfTransition}
      >
        {/* 글로우 */}
        <div
          className="absolute rounded-full blur-2xl"
          style={{
            width: 80,
            height: 40,
            bottom: -8,
            background: stage.glow,
            opacity: 0.6,
          }}
        />
        {/* 전설 등급 오라 */}
        {isMax && (
          <motion.div
            className="absolute rounded-full"
            style={{ width: 110, height: 110, border: "1px solid rgba(255,200,50,0.3)" }}
            animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
        <img
          src={stage.image}
          alt={stage.name}
          width={96}
          height={96}
          className="relative z-10"
          style={{
            imageRendering: "pixelated",
            filter: `drop-shadow(0 0 10px ${stage.glow})`,
          }}
        />
      </motion.div>

      {/* 이름 & 페널티 경고 */}
      <div className="text-center">
        <p className="text-xs font-semibold" style={{ color: "var(--text-1)" }}>
          {stage.name}
        </p>
        {penaltyYesterday && (
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-[9px] mt-1"
            style={{ color: "#e87070" }}
          >
            ⚠ 어제 루틴 0% — 페널티 적용
          </motion.p>
        )}
      </div>

      {/* XP 바 */}
      <div className="w-full">
        <div className="flex justify-between mb-1.5">
          <span className="text-[9px]" style={{ color: "var(--text-3)" }}>
            {isMax ? "LEGENDARY MAX" : "다음 단계"}
          </span>
          <span className="text-[9px] tabular-nums" style={{ color: "var(--text-3)", fontFamily: "var(--font-en)" }}>
            {isMax ? "MAX" : `${xp.toLocaleString()} / ${stage.nextXP.toLocaleString()} XP`}
          </span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(43,143,240,0.08)" }}>
          <motion.div
            className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
            style={{
              background: isMax
                ? "linear-gradient(90deg, rgba(255,180,30,0.9), rgba(255,230,80,1))"
                : "linear-gradient(90deg, rgba(43,143,240,0.8), rgba(112,192,255,1))",
              boxShadow: `0 0 8px ${stage.glow}`,
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}
