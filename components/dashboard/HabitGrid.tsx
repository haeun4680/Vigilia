"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Plus, X, Loader2, Pencil, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useHabits, toLocalDateStr } from "@/lib/habit-context";
import type { Habit } from "@/lib/supabase";

const DAY_SHORT = ["일","월","화","수","목","금","토"];

function getMonthDates() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, i) => {
    const d = new Date(year, month, i + 1);
    const isToday = d.toDateString() === today.toDateString();
    const isFuture = d > today && !isToday;
    return {
      date: i + 1,
      dayShort: DAY_SHORT[d.getDay()],
      isToday,
      isPast: !isToday && !isFuture,
      isFuture,
      isSun: d.getDay() === 0,
      isSat: d.getDay() === 6,
      dateStr: toLocalDateStr(d),
    };
  });
}

const monthDates = getMonthDates();
const MONTH_LABEL = new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long" });

export function HabitGrid() {
  const supabase = createClient();
  const { habits, checks, userId, loading, toggleCheck, refresh } = useHabits();

  // 추가
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("⭐");

  // 수정
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editIcon, setEditIcon] = useState("");
  const [editName, setEditName] = useState("");

  // hover
  const [hoverRow, setHoverRow] = useState<string | null>(null);

  // 체크 ripple
  const [ripples, setRipples] = useState<Record<string, number>>({});

  const isChecked = (habitId: string, dateStr: string) =>
    checks.some(c => c.habit_id === habitId && c.checked_date === dateStr);

  const handleToggle = useCallback(async (habitId: string, dateStr: string) => {
    const wasChecked = isChecked(habitId, dateStr);
    await toggleCheck(habitId, dateStr);
    if (!wasChecked) {
      const key = `${habitId}-${dateStr}`;
      setRipples(r => ({ ...r, [key]: Date.now() }));
      setTimeout(() => setRipples(r => { const n = { ...r }; delete n[key]; return n; }), 600);
    }
  }, [toggleCheck, checks]);

  const addHabit = async () => {
    if (!newName.trim() || !userId) return;
    await supabase.from("habits").insert({ user_id: userId, icon: newIcon, name: newName.trim(), goal: "ongoing" });
    setNewName(""); setNewIcon("⭐"); setAdding(false);
    await refresh();
  };

  const startEdit = (habit: Habit) => {
    setEditingId(habit.id);
    setEditIcon(habit.icon);
    setEditName(habit.name);
  };

  const saveEdit = async () => {
    if (!editingId || !editName.trim()) return;
    await supabase.from("habits").update({ icon: editIcon, name: editName.trim() }).eq("id", editingId);
    setEditingId(null);
    await refresh();
  };

  const deleteHabit = async (habitId: string) => {
    await supabase.from("habits").delete().eq("id", habitId);
    await refresh();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-5 h-5 animate-spin" style={{ color: "var(--blue)" }} />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }} className="w-full overflow-x-auto">
      <table className="w-full border-collapse min-w-[540px]">
        <thead>
          <tr>
            <th className="text-left pb-3 pr-6 w-[160px]">
              <div>
                <span className="label-text">나의 루틴</span>
                <p className="text-[10px] mt-0.5" style={{ color: "var(--text-3)" }}>{MONTH_LABEL}</p>
              </div>
            </th>
            {monthDates.map((d, i) => (
              <th key={i} className="pb-3" style={{ minWidth: 28 }}>
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-[8px] font-medium"
                    style={{ color: d.isToday ? "var(--blue)" : d.isSun ? "rgba(200,100,100,0.6)" : d.isSat ? "rgba(100,150,220,0.6)" : "var(--text-4)" }}>
                    {d.dayShort}
                  </span>
                  <span className="text-[10px] font-semibold tabular-nums"
                    style={{ color: d.isToday ? "var(--blue)" : d.isFuture ? "var(--text-4)" : "var(--text-3)" }}>
                    {d.date}
                  </span>
                </div>
              </th>
            ))}
          </tr>
          <tr>
            <td colSpan={monthDates.length + 1} className="pb-2" style={{ borderBottom: "1px solid var(--border-2)" }} />
          </tr>
        </thead>

        <tbody>
          <AnimatePresence initial={false}>
            {habits.length === 0 && !adding && (
              <tr>
                <td colSpan={monthDates.length + 1} className="py-8 text-center">
                  <p className="text-xs" style={{ color: "var(--text-3)" }}>
                    아직 루틴이 없어요. 아래 버튼으로 추가해보세요!
                  </p>
                </td>
              </tr>
            )}

            {habits.map((habit, rowIdx) => (
              <motion.tr key={habit.id}
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25, delay: rowIdx * 0.04 }}
                onMouseEnter={() => setHoverRow(habit.id)}
                onMouseLeave={() => setHoverRow(null)}>

                {/* 이름 셀 */}
                <td className="py-2 pr-2">
                  {editingId === habit.id ? (
                    <div className="flex items-center gap-1.5">
                      <input value={editIcon} onChange={e => setEditIcon(e.target.value)}
                        className="w-7 text-center bg-transparent rounded text-base focus:outline-none"
                        style={{ border: "1px solid var(--border-1)" }} maxLength={2} autoFocus />
                      <input value={editName} onChange={e => setEditName(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && saveEdit()}
                        className="flex-1 bg-transparent text-sm focus:outline-none py-0.5"
                        style={{ borderBottom: "1px solid var(--border-1)", color: "var(--text-1)" }} />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base leading-none flex-shrink-0">{habit.icon}</span>
                      <span className="text-sm font-medium truncate" style={{ color: "var(--text-1)" }}>{habit.name}</span>
                      <AnimatePresence>
                        {hoverRow === habit.id && (
                          <motion.div
                            initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -4 }} transition={{ duration: 0.15 }}
                            className="flex items-center gap-1 ml-auto flex-shrink-0">
                            <motion.button onClick={() => startEdit(habit)}
                              whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}
                              title="수정" style={{ color: "var(--blue)" }}>
                              <Pencil className="w-3 h-3" />
                            </motion.button>
                            <motion.button onClick={() => deleteHabit(habit.id)}
                              whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}
                              title="삭제" style={{ color: "#c87070" }}>
                              <Trash2 className="w-3 h-3" />
                            </motion.button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </td>

                {/* 편집 모드 저장/취소 */}
                {editingId === habit.id && (
                  <td className="py-2 pr-4">
                    <div className="flex items-center gap-1.5">
                      <motion.button onClick={saveEdit} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        style={{ color: "var(--blue)" }}>
                        <Check className="w-3.5 h-3.5" />
                      </motion.button>
                      <motion.button onClick={() => setEditingId(null)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        style={{ color: "var(--text-3)" }}>
                        <X className="w-3.5 h-3.5" />
                      </motion.button>
                    </div>
                  </td>
                )}

                {/* 체크 셀 7개 */}
                {monthDates.map(({ isToday, isPast, isFuture, dateStr }) => {
                  const checked = isChecked(habit.id, dateStr);
                  const rippleKey = `${habit.id}-${dateStr}`;
                  return (
                    <td key={dateStr} className="py-1.5 text-center">
                      <motion.button
                        onClick={() => !isFuture && handleToggle(habit.id, dateStr)}
                        disabled={isFuture}
                        className="relative mx-auto flex items-center justify-center rounded-md focus:outline-none"
                        animate={checked ? { scale: [1, 1.25, 0.92, 1] } : { scale: 1 }}
                        transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
                        style={{
                          width: 22, height: 22,
                          background: checked ? "rgba(136,192,224,0.16)" : isToday ? "rgba(136,192,224,0.05)" : "transparent",
                          border: checked ? "1px solid rgba(136,192,224,0.45)" :
                            isToday ? "1px solid rgba(136,192,224,0.2)" : "1px solid transparent",
                          boxShadow: checked ? "0 0 8px rgba(136,192,224,0.3)" : "none",
                          cursor: isFuture ? "default" : "pointer",
                          opacity: isFuture ? 0.25 : 1,
                        }}>
                        <AnimatePresence>
                          {ripples[rippleKey] && (
                            <motion.span key={ripples[rippleKey]}
                              className="absolute inset-0 rounded-md"
                              initial={{ opacity: 0.7, scale: 0.6 }}
                              animate={{ opacity: 0, scale: 2.4 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.55, ease: "easeOut" }}
                              style={{ border: "1.5px solid rgba(136,192,224,0.6)", pointerEvents: "none" }}
                            />
                          )}
                        </AnimatePresence>
                        {checked ? (
                          <Check className="w-3 h-3"
                            style={{ color: "var(--blue)", filter: "drop-shadow(0 0 3px rgba(136,192,224,0.8))" }} />
                        ) : isFuture ? null : (
                          <div className="w-1 h-1 rounded-full"
                            style={{ background: isPast ? "rgba(136,192,224,0.2)" : "rgba(136,192,224,0.35)" }} />
                        )}
                      </motion.button>
                    </td>
                  );
                })}
              </motion.tr>
            ))}
          </AnimatePresence>

          {/* 루틴 추가 폼 */}
          <AnimatePresence>
            {adding && (
              <motion.tr initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
                <td className="py-2 pr-4" colSpan={2}>
                  <div className="flex items-center gap-2">
                    <input value={newIcon} onChange={(e) => setNewIcon(e.target.value)}
                      className="w-8 text-center bg-transparent rounded px-1 py-1 text-base focus:outline-none"
                      style={{ border: "1px solid var(--border-1)" }} maxLength={2} autoFocus />
                    <input value={newName} onChange={(e) => setNewName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addHabit()}
                      placeholder="루틴 이름..."
                      className="flex-1 bg-transparent text-sm focus:outline-none py-1"
                      style={{ borderBottom: "1px solid var(--border-1)", color: "var(--text-1)" }} />
                    <button onClick={addHabit} style={{ color: "var(--blue)" }}><Check className="w-4 h-4" /></button>
                    <button onClick={() => setAdding(false)} style={{ color: "var(--text-3)" }}><X className="w-4 h-4" /></button>
                  </div>
                </td>
                {monthDates.map((_, i) => <td key={i} />)}
              </motion.tr>
            )}
          </AnimatePresence>

          <tr>
            <td colSpan={monthDates.length + 1} className="pt-1" style={{ borderTop: "1px solid var(--border-2)" }} />
          </tr>
          <tr>
            <td colSpan={monthDates.length + 1} className="pt-2 pb-1">
              <motion.button onClick={() => setAdding(true)}
                whileHover={{ x: 2 }} whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1.5 text-sm font-medium"
                style={{ color: "var(--blue)" }}>
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
