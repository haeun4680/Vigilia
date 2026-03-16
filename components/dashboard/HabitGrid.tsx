"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Plus, X } from "lucide-react";
import { habitRows, weekDates, HabitRow } from "@/lib/mock-data";

export function HabitGrid() {
  const [habits, setHabits] = useState<HabitRow[]>(habitRows);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newGoal, setNewGoal] = useState("7일");
  const [newIcon, setNewIcon] = useState("⭐");
  // 리플 추적: key = `${habitId}-${dayIdx}`
  const [ripples, setRipples] = useState<Record<string, number>>({});

  const toggleCheck = useCallback((habitId: number, dayIndex: number) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== habitId) return h;
        const checks = [...h.checks];
        const willCheck = !checks[dayIndex];
        checks[dayIndex] = willCheck;
        // 체크할 때만 리플 발동
        if (willCheck) {
          const key = `${habitId}-${dayIndex}`;
          setRipples((r) => ({ ...r, [key]: Date.now() }));
          setTimeout(() => setRipples((r) => { const n = { ...r }; delete n[key]; return n; }), 600);
        }
        return { ...h, checks };
      })
    );
  }, []);

  const addHabit = () => {
    if (!newName.trim()) return;
    setHabits((prev) => [
      ...prev,
      { id: Date.now(), icon: newIcon, name: newName.trim(), goal: newGoal,
        checks: Array(7).fill(false), monthly: Array(30).fill(false) },
    ]);
    setNewName(""); setNewGoal("7일"); setNewIcon("⭐"); setAdding(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }} className="w-full overflow-x-auto">
      <table className="w-full border-collapse min-w-[540px]">
        <thead>
          <tr>
            <th className="text-left pb-3 pr-4 w-[190px]">
              <span className="label-text">오늘의 루틴</span>
            </th>
            <th className="text-left pb-3 pr-6 w-[70px]">
              <span className="label-text">목표</span>
            </th>
            {weekDates.map((d, i) => (
              <th key={i} className="pb-3 w-10">
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-[9px] font-medium tracking-widest"
                    style={{ color: d.isToday ? "var(--blue)" : "var(--text-4)", fontFamily: "var(--font-en)" }}>
                    {d.dayShort}
                  </span>
                  <span className="text-xs font-semibold"
                    style={{
                      color: d.isToday ? "var(--blue)" : d.isPast ? "var(--text-3)" : "var(--text-4)",
                      fontFamily: "var(--font-en)",
                    }}>
                    {d.date}
                  </span>
                </div>
              </th>
            ))}
          </tr>
          <tr>
            <td colSpan={9} className="pb-2" style={{ borderBottom: "1px solid var(--border-2)" }} />
          </tr>
        </thead>

        <tbody>
          <AnimatePresence initial={false}>
            {habits.map((habit, rowIdx) => (
              <motion.tr key={habit.id}
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25, delay: rowIdx * 0.04 }}>
                <td className="py-2.5 pr-4">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base leading-none">{habit.icon}</span>
                    <span className="text-sm font-medium" style={{ color: "var(--text-1)" }}>
                      {habit.name}
                    </span>
                  </div>
                </td>
                <td className="py-2.5 pr-6">
                  <span className="text-xs font-medium tabular-nums" style={{ color: "var(--lavender)" }}>
                    {habit.goal}
                  </span>
                </td>
                {habit.checks.map((checked, dayIdx) => {
                  const isToday = weekDates[dayIdx]?.isToday;
                  const isPast  = weekDates[dayIdx]?.isPast;
                  const rippleKey = `${habit.id}-${dayIdx}`;
                  const hasRipple = !!ripples[rippleKey];
                  return (
                    <td key={dayIdx} className="py-2.5 text-center">
                      <motion.button
                        onClick={() => toggleCheck(habit.id, dayIdx)}
                        className="relative mx-auto flex items-center justify-center w-7 h-7 rounded-lg focus:outline-none"
                        animate={checked ? { scale: [1, 1.3, 0.9, 1] } : { scale: 1 }}
                        transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
                        style={{
                          background: checked ? "rgba(136,192,224,0.14)" : isToday ? "rgba(136,192,224,0.04)" : "transparent",
                          border: checked ? "1px solid rgba(136,192,224,0.4)" :
                            isToday ? "1px solid rgba(136,192,224,0.18)" : "1px solid transparent",
                          boxShadow: checked ? "0 0 10px rgba(136,192,224,0.25)" : "none",
                        }}>

                        {/* 리플 */}
                        <AnimatePresence>
                          {hasRipple && (
                            <motion.span key={ripples[rippleKey]}
                              className="absolute inset-0 rounded-lg"
                              initial={{ opacity: 0.7, scale: 0.6 }}
                              animate={{ opacity: 0, scale: 2.4 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.55, ease: "easeOut" }}
                              style={{ border: "1.5px solid rgba(136,192,224,0.6)", pointerEvents: "none" }}
                            />
                          )}
                        </AnimatePresence>

                        {checked ? (
                          <Check className="w-3.5 h-3.5"
                            style={{ color: "var(--blue)", filter: "drop-shadow(0 0 4px rgba(136,192,224,0.7))" }} />
                        ) : (
                          <div className="w-1 h-1 rounded-full"
                            style={{ background: isPast ? "var(--text-3)" : isToday ? "var(--text-2)" : "var(--text-4)" }} />
                        )}
                      </motion.button>
                    </td>
                  );
                })}
              </motion.tr>
            ))}
          </AnimatePresence>

          {/* 추가 폼 */}
          <AnimatePresence>
            {adding && (
              <motion.tr initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
                <td className="py-2 pr-4" colSpan={2}>
                  <div className="flex items-center gap-2">
                    <input value={newIcon} onChange={(e) => setNewIcon(e.target.value)}
                      className="w-8 text-center bg-transparent rounded px-1 py-1 text-base focus:outline-none"
                      style={{ border: "1px solid var(--border-1)" }}
                      maxLength={2} autoFocus />
                    <input value={newName} onChange={(e) => setNewName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addHabit()}
                      placeholder="루틴 이름..."
                      className="flex-1 bg-transparent text-sm focus:outline-none py-1"
                      style={{ borderBottom: "1px solid var(--border-1)", color: "var(--text-1)" }} />
                    <input value={newGoal} onChange={(e) => setNewGoal(e.target.value)}
                      placeholder="7일"
                      className="w-14 bg-transparent text-xs text-center focus:outline-none py-1"
                      style={{ borderBottom: "1px solid var(--border-1)", color: "var(--blue)" }} />
                    <button onClick={addHabit} style={{ color: "var(--blue)" }}>
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => setAdding(false)} style={{ color: "var(--text-3)" }}>
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </td>
                {weekDates.map((_, i) => <td key={i} />)}
              </motion.tr>
            )}
          </AnimatePresence>

          <tr>
            <td colSpan={9} className="pt-1" style={{ borderTop: "1px solid var(--border-2)" }} />
          </tr>
          <tr>
            <td colSpan={9} className="pt-2 pb-1">
              <motion.button onClick={() => setAdding(true)}
                whileHover={{ x: 2 }} whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1.5 text-sm font-medium"
                style={{ color: adding ? "var(--text-3)" : "var(--blue)" }}>
                <Plus className="w-4 h-4" />
                루틴 추가
              </motion.button>
            </td>
          </tr>
        </tbody>
      </table>
    </motion.div>
  );
}
