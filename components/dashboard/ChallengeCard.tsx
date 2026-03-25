"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight } from "lucide-react";
import { useChallenges } from "@/lib/challenge-context";
import { useHabits, toLocalDateStr } from "@/lib/habit-context";
import {
  ANIMALS, DURATION_OPTIONS, DURATION_INFO,
  getAnimalsByDuration, type Animal,
} from "@/lib/animals";

// ── 컨페티 파티클 ─────────────────────────────────
const CONFETTI_COLORS = [
  "#ff6b6b", "#ffd93d", "#6bcb77", "#4d96ff",
  "#ff922b", "#cc5de8", "#f06595", "#74c0fc",
];

function Confetti() {
  const pieces = useMemo(() => Array.from({ length: 60 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 1.2,
    duration: 2.2 + Math.random() * 1.5,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    size: 6 + Math.random() * 8,
    rotation: Math.random() * 360,
    shape: Math.random() > 0.5 ? "rect" : "circle",
  })), []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 110 }}>
      {pieces.map(p => (
        <motion.div
          key={p.id}
          initial={{ y: -20, x: `${p.x}vw`, opacity: 1, rotate: p.rotation }}
          animate={{ y: "110vh", opacity: [1, 1, 0], rotate: p.rotation + 360 * 2 }}
          transition={{ duration: p.duration, delay: p.delay, ease: "easeIn" }}
          style={{
            position: "absolute",
            top: 0,
            width: p.size,
            height: p.shape === "rect" ? p.size * 0.5 : p.size,
            borderRadius: p.shape === "circle" ? "50%" : "2px",
            background: p.color,
          }}
        />
      ))}
    </div>
  );
}

// ── 동물 획득 축하 모달 ───────────────────────────
function AcquisitionModal({ animal, onClose }: { animal: Animal; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <>
      <Confetti />
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 flex items-center justify-center p-4"
        style={{ background: "rgba(2,7,16,0.88)", backdropFilter: "blur(10px)", zIndex: 105 }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.5, y: 40 }} animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="dawn-card p-10 flex flex-col items-center gap-5 max-w-xs w-full text-center"
          style={{ borderColor: `${animal.rarityColor}40`, boxShadow: `0 0 60px ${animal.glowColor}40` }}
          onClick={e => e.stopPropagation()}
        >
          {/* 동물 이모지 */}
          <motion.div
            animate={{ y: [0, -14, 0], scale: [1, 1.08, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="text-8xl"
            style={{ filter: `drop-shadow(0 0 24px ${animal.glowColor})` }}
          >
            {animal.emoji}
          </motion.div>

          {/* NEW 뱃지 */}
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
          >
            <span className="text-[11px] font-black px-3 py-1 rounded-full tracking-widest"
              style={{
                background: `${animal.rarityColor}20`,
                color: animal.rarityColor,
                border: `1px solid ${animal.rarityColor}50`,
              }}>
              NEW {animal.rarityLabel}
            </span>
          </motion.div>

          {/* 이름 */}
          <div className="space-y-1">
            <motion.p
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-black"
              style={{ color: "var(--text-1)" }}
            >
              {animal.name}
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="text-sm"
              style={{ color: "var(--text-3)" }}
            >
              도감에 추가됐어요! 🎉
            </motion.p>
          </div>

          {/* 닫기 버튼 */}
          <motion.button
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-sm font-bold mt-1"
            style={{
              background: `${animal.rarityColor}20`,
              border: `1px solid ${animal.rarityColor}40`,
              color: animal.rarityColor,
            }}
          >
            확인
          </motion.button>
        </motion.div>
      </motion.div>
    </>
  );
}

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
  const [celebrateAnimal, setCelebrateAnimal] = useState<Animal | null>(null);

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
    if (!animal) return;
    await completeChallenge();
    setCelebrateAnimal(animal);
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

        {/* 진행 중인 챌린지 */}
        {activeChallenge && animal && (
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
        {!activeChallenge && (
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

      {/* 동물 획득 축하 모달 */}
      <AnimatePresence>
        {celebrateAnimal && (
          <AcquisitionModal
            animal={celebrateAnimal}
            onClose={() => setCelebrateAnimal(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
