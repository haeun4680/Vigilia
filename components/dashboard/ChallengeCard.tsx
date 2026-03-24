"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight } from "lucide-react";
import { useChallenges } from "@/lib/challenge-context";
import { useHabits, toLocalDateStr } from "@/lib/habit-context";
import {
  ANIMALS, DURATION_OPTIONS, DURATION_INFO,
  getAnimalsByDuration, type Animal,
} from "@/lib/animals";

// ── 챌린지 진행 일수 계산 ─────────────────────────
function calcProgress(startedAt: string, checks: any[], habits: any[]) {
  if (habits.length === 0) return { daysOk: 0, hasMissed: false };

  const today = new Date();
  const todayStr = toLocalDateStr(today);
  const checkMap = new Map<string, number>();
  checks.forEach(c => checkMap.set(c.checked_date, (checkMap.get(c.checked_date) || 0) + 1));

  let daysOk = 0;
  let hasMissed = false;
  const d = new Date(startedAt.replace(/-/g, "/"));

  while (toLocalDateStr(d) < todayStr) {
    const ds = toLocalDateStr(d);
    if ((checkMap.get(ds) || 0) > 0) {
      daysOk++;
    } else {
      hasMissed = true;
    }
    d.setDate(d.getDate() + 1);
  }
  return { daysOk, hasMissed };
}

// ── 동물 선택 모달 ────────────────────────────────
function AnimalSelectModal({ onClose, onStart }: {
  onClose: () => void;
  onStart: (duration: number, animal: Animal) => void;
}) {
  const [step, setStep] = useState<"duration" | "animal">("duration");
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);

  const animals = selectedDuration ? getAnimalsByDuration(selectedDuration) : [];

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(2,7,16,0.85)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
        className="dawn-card p-6 w-full max-w-sm"
        onClick={e => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="label-text mb-1">NEW CHALLENGE</p>
            <h3 className="text-sm font-bold" style={{ color: "var(--text-1)" }}>
              {step === "duration" ? "기간 선택" : "동물 선택"}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg" style={{ color: "var(--text-3)" }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {step === "duration" ? (
            <motion.div key="duration"
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
              className="space-y-2"
            >
              {DURATION_OPTIONS.map(d => {
                const info = DURATION_INFO[d];
                return (
                  <button key={d}
                    onClick={() => { setSelectedDuration(d); setStep("animal"); }}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all"
                    style={{
                      background: "rgba(43,143,240,0.05)",
                      border: "1px solid rgba(43,143,240,0.15)",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(43,143,240,0.12)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "rgba(43,143,240,0.05)")}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold" style={{ color: "var(--text-1)" }}>{info.label}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: `${info.color}20`, color: info.color, border: `1px solid ${info.color}40` }}>
                        {info.rarity}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4" style={{ color: "var(--text-3)" }} />
                  </button>
                );
              })}
            </motion.div>
          ) : (
            <motion.div key="animal"
              initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
            >
              <button onClick={() => setStep("duration")}
                className="text-[11px] mb-4 flex items-center gap-1"
                style={{ color: "var(--text-3)" }}>
                ← 기간 다시 선택
              </button>
              <div className="grid grid-cols-3 gap-2">
                {animals.map(animal => (
                  <button key={animal.id}
                    onClick={() => onStart(selectedDuration!, animal)}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all"
                    style={{
                      background: "rgba(43,143,240,0.05)",
                      border: "1px solid rgba(43,143,240,0.15)",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = `${animal.glowColor}30`)}
                    onMouseLeave={e => (e.currentTarget.style.background = "rgba(43,143,240,0.05)")}
                  >
                    <span className="text-3xl">{animal.emoji}</span>
                    <span className="text-[10px] text-center" style={{ color: "var(--text-2)" }}>{animal.name}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

// ── 메인 ChallengeCard ────────────────────────────
export function ChallengeCard() {
  const { activeChallenge, completedChallenges, loading, startChallenge, completeChallenge } = useChallenges();
  const { habits, checks } = useHabits();
  const [showModal, setShowModal] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);

  const animal = useMemo(() => {
    if (!activeChallenge) return null;
    return ANIMALS.find(a => a.id === activeChallenge.target_animal) ?? null;
  }, [activeChallenge]);

  const { daysOk, hasMissed } = useMemo(() => {
    if (!activeChallenge) return { daysOk: 0, hasMissed: false };
    return calcProgress(activeChallenge.started_at, checks, habits);
  }, [activeChallenge, checks, habits]);

  const progressPct = activeChallenge
    ? Math.min(100, Math.round((daysOk / activeChallenge.duration_days) * 100))
    : 0;

  const isComplete = activeChallenge ? daysOk >= activeChallenge.duration_days : false;

  // 완료 처리
  const handleComplete = async () => {
    setJustCompleted(true);
    await completeChallenge();
    setTimeout(() => setJustCompleted(false), 3000);
  };

  const handleStart = async (duration: number, a: Animal) => {
    setShowModal(false);
    await startChallenge(duration, a.id);
  };

  if (loading) return (
    <div className="pb-5" style={{ borderBottom: "1px solid var(--border-2)" }}>
      <div className="h-24 rounded-xl animate-pulse" style={{ background: "rgba(43,143,240,0.05)" }} />
    </div>
  );

  return (
    <>
      <div className="flex flex-col gap-3 pb-5" style={{ borderBottom: "1px solid var(--border-2)" }}>
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <p className="label-text">CHALLENGE</p>
          <span className="text-[10px]" style={{ color: "var(--text-3)" }}>
            🏆 {completedChallenges.length}마리 수집
          </span>
        </div>

        {/* 완료 축하 */}
        <AnimatePresence>
          {justCompleted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="text-center py-3 rounded-xl"
              style={{ background: "rgba(255,200,50,0.08)", border: "1px solid rgba(255,200,50,0.2)" }}
            >
              <p className="text-xl mb-1">{animal?.emoji}</p>
              <p className="text-xs font-bold" style={{ color: "rgba(255,200,50,0.9)" }}>
                {animal?.name} 획득! 🎉
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 진행 중인 챌린지 */}
        {activeChallenge && animal && !justCompleted && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-3">
            {/* 동물 + 정보 */}
            <div className="flex items-center gap-3">
              <motion.span
                className="text-4xl"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                style={{ filter: `drop-shadow(0 0 8px ${animal.glowColor})` }}
              >
                {animal.emoji}
              </motion.span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-bold" style={{ color: "var(--text-1)" }}>{animal.name}</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: `${animal.rarityColor}15`, color: animal.rarityColor, border: `1px solid ${animal.rarityColor}30` }}>
                    {animal.rarityLabel}
                  </span>
                </div>
                <p className="text-[10px]" style={{ color: "var(--text-3)" }}>
                  {daysOk} / {activeChallenge.duration_days}일 달성
                </p>
              </div>
            </div>

            {/* 프로그레스 바 */}
            <div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(43,143,240,0.08)" }}>
                <motion.div
                  className="h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  style={{
                    background: isComplete
                      ? "linear-gradient(90deg, rgba(255,180,30,0.9), rgba(255,230,80,1))"
                      : `linear-gradient(90deg, ${animal.glowColor}, ${animal.rarityColor})`,
                    boxShadow: `0 0 8px ${animal.glowColor}`,
                  }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[9px]" style={{ color: hasMissed ? "#e87070" : "var(--text-4)" }}>
                  {hasMissed ? "⚠ 빠진 날 있음" : "꾸준히 진행 중!"}
                </span>
                <span className="text-[9px] tabular-nums" style={{ color: "var(--text-4)", fontFamily: "var(--font-en)" }}>
                  {progressPct}%
                </span>
              </div>
            </div>

            {/* 완료 버튼 */}
            {isComplete && (
              <motion.button
                initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                onClick={handleComplete}
                className="w-full py-2 rounded-xl text-xs font-bold"
                style={{
                  background: "linear-gradient(135deg, rgba(255,180,30,0.2), rgba(255,230,80,0.15))",
                  border: "1px solid rgba(255,200,50,0.4)",
                  color: "rgba(255,220,60,0.95)",
                }}
              >
                🎉 {animal.name} 획득하기!
              </motion.button>
            )}
          </motion.div>
        )}

        {/* 챌린지 없음 */}
        {!activeChallenge && !justCompleted && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-3 py-2">
            <span className="text-4xl">🥚</span>
            <p className="text-[11px] text-center" style={{ color: "var(--text-3)" }}>
              도전을 시작하고<br />동물을 수집해보세요!
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="w-full py-2 rounded-xl text-xs font-bold transition-all"
              style={{
                background: "rgba(43,143,240,0.1)",
                border: "1px solid rgba(43,143,240,0.25)",
                color: "var(--blue)",
              }}
            >
              + 도전 시작
            </button>
          </motion.div>
        )}

        {/* 진행 중일 때 새 도전 안내 */}
        {activeChallenge && !isComplete && (
          <p className="text-[9px] text-center" style={{ color: "var(--text-4)" }}>
            완료 후 다음 동물 도전 가능
          </p>
        )}
      </div>

      {/* 동물 선택 모달 */}
      <AnimatePresence>
        {showModal && (
          <AnimalSelectModal
            onClose={() => setShowModal(false)}
            onStart={handleStart}
          />
        )}
      </AnimatePresence>
    </>
  );
}
