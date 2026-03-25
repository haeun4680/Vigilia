"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { ANIMALS, type Rarity } from "@/lib/animals";

type FilterKey = "all" | Rarity;

const FILTERS: { key: FilterKey; label: string; color: string }[] = [
  { key: "all",       label: "전체",      color: "rgba(43,143,240,0.9)"   },
  { key: "common",    label: "COMMON",    color: "rgba(180,180,180,0.9)"  },
  { key: "uncommon",  label: "UNCOMMON",  color: "rgba(80,200,120,0.9)"   },
  { key: "rare",      label: "RARE",      color: "rgba(43,143,240,0.9)"   },
  { key: "epic",      label: "EPIC",      color: "rgba(160,80,240,0.9)"   },
  { key: "legendary", label: "LEGENDARY", color: "rgba(255,200,50,0.9)"   },
];

export function CollectionModal({
  collectedIds,
  onClose,
}: {
  collectedIds: string[];
  onClose: () => void;
}) {
  const [filter, setFilter] = useState<FilterKey>("all");

  const collectedSet = new Set(collectedIds);

  const filtered = filter === "all"
    ? ANIMALS
    : ANIMALS.filter(a => a.rarity === filter);

  const collectedCount = ANIMALS.filter(a => collectedSet.has(a.id)).length;

  const content = (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(2,7,16,0.88)", backdropFilter: "blur(12px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.88, y: 32, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.88, y: 32, opacity: 0 }} transition={{ type: "spring", stiffness: 240, damping: 22 }}
        className="dawn-card w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden"
        style={{ boxShadow: "0 0 80px rgba(43,143,240,0.15), 0 0 160px rgba(43,143,240,0.06)" }}
        onClick={e => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4"
          style={{ borderBottom: "1px solid var(--border-2)" }}>
          <div>
            <p className="label-text mb-0.5">COLLECTION</p>
            <h2 className="text-sm font-bold" style={{ color: "var(--text-1)" }}>
              동물 도감
              <span className="ml-2 text-xs font-normal" style={{ color: "var(--text-3)" }}>
                {collectedCount} / {ANIMALS.length} 수집
              </span>
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg" style={{ color: "var(--text-3)" }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 필터 탭 */}
        <div className="flex items-center gap-1 px-5 py-3 overflow-x-auto"
          style={{ borderBottom: "1px solid var(--border-2)" }}>
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className="flex-shrink-0 px-3 py-1 rounded-lg text-[10px] font-bold tracking-wide transition-all"
              style={{
                background: filter === f.key ? `${f.color}18` : "transparent",
                color: filter === f.key ? f.color : "var(--text-4)",
                border: filter === f.key ? `1px solid ${f.color}35` : "1px solid transparent",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* 동물 그리드 */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={filter}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              className="grid grid-cols-4 sm:grid-cols-6 gap-3"
            >
              {filtered.map((animal, i) => {
                const isCollected = collectedSet.has(animal.id);
                return (
                  <motion.div
                    key={animal.id}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl"
                    style={{
                      background: isCollected
                        ? `${animal.glowColor}15`
                        : "rgba(255,255,255,0.02)",
                      border: isCollected
                        ? `1px solid ${animal.glowColor}35`
                        : "1px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    {/* 동물 이모지 */}
                    <motion.span
                      className="text-3xl"
                      animate={isCollected ? { y: [0, -3, 0] } : {}}
                      transition={{ duration: 2.5 + i * 0.2, repeat: Infinity, ease: "easeInOut" }}
                      style={{
                        filter: isCollected
                          ? `drop-shadow(0 0 6px ${animal.glowColor})`
                          : "grayscale(1) brightness(0.2)",
                        opacity: isCollected ? 1 : 0.4,
                      }}
                    >
                      {animal.emoji}
                    </motion.span>

                    {/* 이름 */}
                    <span
                      className="text-[9px] text-center leading-tight w-full truncate text-center font-medium"
                      style={{ color: isCollected ? "var(--text-2)" : "var(--text-4)" }}
                    >
                      {isCollected ? animal.name : "???"}
                    </span>

                    {/* 희귀도 뱃지 */}
                    <span
                      className="text-[7px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{
                        background: isCollected ? `${animal.rarityColor}15` : "rgba(255,255,255,0.04)",
                        color: isCollected ? animal.rarityColor : "var(--text-4)",
                        border: `1px solid ${isCollected ? animal.rarityColor + "30" : "rgba(255,255,255,0.06)"}`,
                      }}
                    >
                      {animal.rarityLabel}
                    </span>

                    {/* 잠김 표시 */}
                    {!isCollected && (
                      <span className="text-[10px] opacity-20">🔒</span>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 하단 힌트 */}
        <div className="px-5 py-3" style={{ borderTop: "1px solid var(--border-2)" }}>
          <p className="text-[10px] text-center" style={{ color: "var(--text-4)" }}>
            챌린지를 완료하면 동물이 도감에 추가돼요 ✨
          </p>
        </div>
      </motion.div>
    </motion.div>
  );

  return createPortal(content, document.body);
}
