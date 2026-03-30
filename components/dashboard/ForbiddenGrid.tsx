"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Loader2, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { toLocalDateStr } from "@/lib/habit-context";
import { useForbidden } from "@/lib/forbidden-context";

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
      isToday, isFuture,
      isPast: !isToday && !isFuture,
      isSun: d.getDay() === 0,
      isSat: d.getDay() === 6,
      dateStr: toLocalDateStr(d),
    };
  });
}


function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

export function ForbiddenGrid() {
  const supabase = createClient();
  const { habits, checks, userId, loading, toggleCheck, refresh } = useForbidden();
  const isMobile = useIsMobile();
  const monthDates = useMemo(() => getMonthDates(), []);

  const visibleDates = isMobile
    ? monthDates.filter(d => !d.isFuture).slice(-7)
    : monthDates;

  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("🚫");
  const [hoverRow, setHoverRow] = useState<string | null>(null);

  const isViolated = (habitId: string, dateStr: string) =>
    checks.some(c => c.habit_id === habitId && c.checked_date === dateStr);

  const handleToggle = useCallback(async (habitId: string, dateStr: string) => {
    await toggleCheck(habitId, dateStr);
  }, [toggleCheck]);

  const addHabit = async () => {
    if (!newName.trim() || !userId) return;
    const maxOrder = habits.length > 0 ? Math.max(...habits.map(h => h.sort_order)) + 1 : 0;
    await supabase.from("forbidden_habits").insert({
      user_id: userId, icon: newIcon, name: newName.trim(), sort_order: maxOrder,
    });
    setNewName(""); setNewIcon("🚫"); setAdding(false);
    await refresh();
  };

  const deleteHabit = async (habitId: string) => {
    await supabase.from("forbidden_habits").delete().eq("id", habitId);
    await refresh();
  };

  if (loading) return (
    <div className="flex items-center justify-center py-10">
      <Loader2 className="w-4 h-4 animate-spin" style={{ color: "#c87070" }} />
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }} className="w-full overflow-x-auto">
      <table className="w-full border-collapse" style={{ minWidth: isMobile ? "auto" : "540px" }}>
        <thead>
          <tr>
            <th className="text-left pb-3 pr-6 w-[160px]">
              <div>
                <span className="label-text" style={{ color: "rgba(200,100,100,0.7)" }}>금지 목록</span>
                <p className="text-[10px] mt-0.5" style={{ color: "var(--text-3)" }}>
                  {isMobile ? "최근 7일" : new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long" })}
                </p>
              </div>
            </th>
            {visibleDates.map((d, i) => (
              <th key={i} className="pb-3" style={{ minWidth: 22 }}>
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-[8px] font-medium"
                    style={{ color: d.isToday ? "#c87070" : d.isSun ? "rgba(200,100,100,0.6)" : d.isSat ? "rgba(100,150,220,0.6)" : "var(--text-4)" }}>
                    {d.dayShort}
                  </span>
                  <span className="text-[10px] font-semibold tabular-nums"
                    style={{ color: d.isToday ? "#c87070" : d.isFuture ? "var(--text-4)" : "var(--text-3)" }}>
                    {d.date}
                  </span>
                </div>
              </th>
            ))}
          </tr>
          <tr>
            <td colSpan={visibleDates.length + 1} className="pb-2"
              style={{ borderBottom: "1px solid rgba(200,100,100,0.15)" }} />
          </tr>
        </thead>

        <tbody>
          <AnimatePresence initial={false}>
            {habits.length === 0 && !adding && (
              <tr>
                <td colSpan={visibleDates.length + 1} className="py-6 text-center">
                  <p className="text-xs" style={{ color: "var(--text-3)" }}>
                    고치고 싶은 나쁜 습관을 추가해보세요!
                  </p>
                </td>
              </tr>
            )}

            {habits.map((habit, rowIdx) => (
              <motion.tr
                key={habit.id}
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25, delay: rowIdx * 0.04 }}
                onMouseEnter={() => setHoverRow(habit.id)}
                onMouseLeave={() => setHoverRow(null)}
              >
                {/* 이름 셀 */}
                <td className="py-2 pr-2">
                  <div className="relative flex items-start gap-1.5" style={{ width: 160 }}>
                    <span className="text-base leading-none flex-shrink-0 mt-0.5">{habit.icon}</span>
                    <span className="text-sm font-medium break-keep leading-snug"
                      style={{ color: "var(--text-1)", wordBreak: "break-all", maxWidth: 90 }}>
                      {habit.name}
                    </span>
                    <AnimatePresence>
                      {hoverRow === habit.id && (
                        <motion.div
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
                          className="absolute right-0 top-0 flex items-center gap-1">
                          <motion.button onClick={() => deleteHabit(habit.id)}
                            whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}
                            style={{ color: "#c87070" }}>
                            <Trash2 className="w-3 h-3" />
                          </motion.button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </td>

                {/* 체크 셀 */}
                {visibleDates.map(({ isToday, isPast, isFuture, dateStr }) => {
                  const violated = isViolated(habit.id, dateStr);
                  return (
                    <td key={dateStr} className="py-1.5 text-center">
                      <motion.button
                        onClick={() => !isFuture && handleToggle(habit.id, dateStr)}
                        disabled={isFuture}
                        className="relative mx-auto flex items-center justify-center rounded-md focus:outline-none"
                        animate={violated ? { scale: [1, 1.25, 0.92, 1] } : { scale: 1 }}
                        transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
                        style={{
                          width: 18, height: 18,
                          background: violated ? "rgba(200,80,80,0.15)" : isToday ? "rgba(200,80,80,0.05)" : "transparent",
                          border: violated ? "1px solid rgba(200,80,80,0.5)" : isToday ? "1px solid rgba(200,80,80,0.2)" : "1px solid transparent",
                          boxShadow: violated ? "0 0 8px rgba(200,80,80,0.3)" : "none",
                          cursor: isFuture ? "default" : "pointer",
                          opacity: isFuture ? 0.4 : 1,
                        }}>
                        {violated ? (
                          <X className="w-3 h-3" style={{ color: "#c87070", filter: "drop-shadow(0 0 3px rgba(200,80,80,0.8))" }} />
                        ) : isFuture ? (
                          <div className="w-1 h-1 rounded-full" style={{ background: "rgba(200,80,80,0.1)" }} />
                        ) : (
                          <div className="w-1 h-1 rounded-full"
                            style={{ background: isPast ? "rgba(200,80,80,0.15)" : "rgba(200,80,80,0.25)" }} />
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
                      style={{ border: "1px solid rgba(200,80,80,0.3)" }} maxLength={2} autoFocus />
                    <input value={newName} onChange={(e) => setNewName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addHabit()}
                      placeholder="금지 항목..."
                      className="flex-1 bg-transparent text-sm focus:outline-none py-1"
                      style={{ borderBottom: "1px solid rgba(200,80,80,0.3)", color: "var(--text-1)" }} />
                    <button onClick={addHabit} style={{ color: "#c87070" }}><Plus className="w-4 h-4" /></button>
                    <button onClick={() => setAdding(false)} style={{ color: "var(--text-3)" }}><X className="w-4 h-4" /></button>
                  </div>
                </td>
                {visibleDates.map((_, i) => <td key={i} />)}
              </motion.tr>
            )}
          </AnimatePresence>

          <tr>
            <td colSpan={visibleDates.length + 1} className="pt-1"
              style={{ borderTop: "1px solid rgba(200,100,100,0.1)" }} />
          </tr>
          <tr>
            <td colSpan={visibleDates.length + 1} className="pt-2 pb-1">
              <motion.button onClick={() => setAdding(true)}
                whileHover={{ x: 2 }} whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1.5 text-sm font-medium"
                style={{ color: "#c87070" }}>
                <Plus className="w-4 h-4" />
                금지 항목 추가
              </motion.button>
            </td>
          </tr>
        </tbody>
      </table>
    </motion.div>
  );
}
