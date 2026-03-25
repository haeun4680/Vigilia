"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChallenges } from "@/lib/challenge-context";
import { ANIMALS } from "@/lib/animals";
import { CollectionModal } from "./CollectionModal";

export function CollectionPreview() {
  const { completedChallenges } = useChallenges();
  const [showModal, setShowModal] = useState(false);

  // 수집한 동물 ID 목록 (중복 제거)
  const collectedIds = [...new Set(completedChallenges.map(c => c.target_animal))];
  const collectedAnimals = collectedIds
    .map(id => ANIMALS.find(a => a.id === id))
    .filter(Boolean) as typeof ANIMALS;

  return (
    <>
    <div className="flex flex-col gap-3 pb-5" style={{ borderBottom: "1px solid var(--border-2)" }}>
      {/* 헤더 */}
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center justify-between w-full group"
      >
        <p className="label-text">COLLECTION</p>
        <span className="text-[10px] transition-colors"
          style={{ color: "var(--text-3)" }}>
          {collectedAnimals.length} / {ANIMALS.length} →
        </span>
      </button>

      {/* 수집된 동물 없을 때 */}
      {collectedAnimals.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-3">
          <span className="text-2xl opacity-30">🔒</span>
          <p className="text-[10px] text-center" style={{ color: "var(--text-4)" }}>
            챌린지를 완료하면<br />동물이 추가돼요
          </p>
        </div>
      )}

      {/* 수집된 동물 그리드 */}
      {collectedAnimals.length > 0 && (
        <div className="grid grid-cols-4 gap-1.5">
          {collectedAnimals.map((animal, i) => (
            <motion.div
              key={animal.id}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="flex flex-col items-center gap-1 p-2 rounded-lg"
              style={{
                background: `${animal.glowColor}15`,
                border: `1px solid ${animal.glowColor}30`,
              }}
              title={animal.name}
            >
              <motion.span
                className="text-xl"
                animate={{ y: [0, -2, 0] }}
                transition={{ duration: 2 + i * 0.3, repeat: Infinity, ease: "easeInOut" }}
                style={{ filter: `drop-shadow(0 0 4px ${animal.glowColor})` }}
              >
                {animal.emoji}
              </motion.span>
              <span className="text-[8px] text-center leading-tight truncate w-full text-center"
                style={{ color: "var(--text-3)" }}>
                {animal.name}
              </span>
            </motion.div>
          ))}

          {/* 잠긴 슬롯 미리보기 (최대 4개) */}
          {Array.from({ length: Math.min(4, ANIMALS.length - collectedAnimals.length) }).map((_, i) => (
            <div key={`lock-${i}`}
              className="flex items-center justify-center p-2 rounded-lg aspect-square"
              style={{ background: "rgba(43,143,240,0.03)", border: "1px solid rgba(43,143,240,0.08)" }}>
              <span className="text-sm opacity-20">🔒</span>
            </div>
          ))}
        </div>
      )}
    </div>

    {/* 도감 모달 */}
    <AnimatePresence>
      {showModal && (
        <CollectionModal
          collectedIds={collectedIds}
          onClose={() => setShowModal(false)}
        />
      )}
    </AnimatePresence>
    </>
  );
}
