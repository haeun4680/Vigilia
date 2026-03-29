"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Plus, X, Loader2, Pencil, Trash2, GripVertical } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useHabits, toLocalDateStr } from "@/lib/habit-context";
import type { Habit } from "@/lib/supabase";
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const DAY_SHORT = ["일","월","화","수","목","금","토"];

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


function SortableRow({ habit, rowIdx, monthDates, checks, editingId, editIcon, editName, hoverRow, ripples,
  setHoverRow, setEditIcon, setEditName, setEditingId, onSaveEdit, onStartEdit, onDelete, onToggle, isChecked }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: habit.id });

  return (
    <motion.tr
      ref={setNodeRef}
      initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.25, delay: rowIdx * 0.04 }}
      onMouseEnter={() => setHoverRow(habit.id)}
      onMouseLeave={() => setHoverRow(null)}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        background: isDragging ? "rgba(136,192,224,0.05)" : "transparent",
        zIndex: isDragging ? 10 : "auto",
      }}>

      {/* 이름 셀 */}
      <td className="py-2 pr-2">
        {editingId === habit.id ? (
          <div className="flex items-center gap-1.5">
            <input value={editIcon} onChange={(e: any) => setEditIcon(e.target.value)}
              className="w-7 text-center bg-transparent rounded text-base focus:outline-none"
              style={{ border: "1px solid var(--border-1)" }} maxLength={2} autoFocus />
            <input value={editName} onChange={(e: any) => setEditName(e.target.value)}
              onKeyDown={(e: any) => e.key === "Enter" && onSaveEdit()}
              className="flex-1 bg-transparent text-sm focus:outline-none py-0.5"
              style={{ borderBottom: "1px solid var(--border-1)", color: "var(--text-1)" }} />
          </div>
        ) : (
          <div className="relative flex items-start gap-1.5" style={{ width: 160 }}>
            {/* 드래그 핸들 */}
            <button {...attributes} {...listeners}
              className="flex-shrink-0 cursor-grab active:cursor-grabbing touch-none mt-0.5"
              style={{ color: hoverRow === habit.id ? "var(--text-3)" : "transparent" }}>
              <GripVertical className="w-3 h-3" />
            </button>
            <span className="text-base leading-none flex-shrink-0 mt-0.5">{habit.icon}</span>
            <span className="text-sm font-medium break-keep leading-snug" style={{ color: "var(--text-1)", wordBreak: "break-all", maxWidth: 90 }}>{habit.name}</span>
            {/* 수정/삭제 — 절대 위치로 레이아웃 영향 없음 */}
            <AnimatePresence>
              {hoverRow === habit.id && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
                  className="absolute right-0 top-0 flex items-center gap-1">
                  <motion.button onClick={() => onStartEdit(habit)}
                    whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}
                    title="수정" style={{ color: "var(--blue)" }}>
                    <Pencil className="w-3 h-3" />
                  </motion.button>
                  <motion.button onClick={() => onDelete(habit.id)}
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
            <motion.button onClick={onSaveEdit} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
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

      {/* 체크 셀 */}
      {monthDates.map(({ isToday, isPast, isFuture, dateStr }: any) => {
        const checked = isChecked(habit.id, dateStr);
        const rippleKey = `${habit.id}-${dateStr}`;
        return (
          <td key={dateStr} className="py-1.5 text-center">
            <motion.button
              onClick={() => !isFuture && onToggle(habit.id, dateStr)}
              disabled={isFuture}
              className="relative mx-auto flex items-center justify-center rounded-md focus:outline-none"
              animate={checked ? { scale: [1, 1.25, 0.92, 1] } : { scale: 1 }}
              transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
              style={{
                width: 22, height: 22,
                background: checked ? "rgba(136,192,224,0.16)" : isToday ? "rgba(136,192,224,0.05)" : "transparent",
                border: checked ? "1px solid rgba(136,192,224,0.45)" : isToday ? "1px solid rgba(136,192,224,0.2)" : "1px solid transparent",
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
                <Check className="w-3 h-3" style={{ color: "var(--blue)", filter: "drop-shadow(0 0 3px rgba(136,192,224,0.8))" }} />
              ) : isFuture ? null : (
                <div className="w-1 h-1 rounded-full"
                  style={{ background: isPast ? "rgba(136,192,224,0.2)" : "rgba(136,192,224,0.35)" }} />
              )}
            </motion.button>
          </td>
        );
      })}
    </motion.tr>
  );
}

export function HabitGrid() {
  const supabase = createClient();
  const { habits, checks, userId, loading, toggleCheck, refresh, reorderHabits } = useHabits();
  const isMobile = useIsMobile();

  const monthDates = useMemo(() => getMonthDates(), []);
  const MONTH_LABEL = useMemo(() => new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long" }), []);

  // 모바일에서는 최근 7일만 표시
  const visibleDates = isMobile
    ? monthDates.filter(d => !d.isFuture).slice(-7)
    : monthDates;

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = habits.findIndex(h => h.id === active.id);
    const newIdx = habits.findIndex(h => h.id === over.id);
    reorderHabits(arrayMove(habits, oldIdx, newIdx));
  }, [habits, reorderHabits]);

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
      <table className="w-full border-collapse" style={{ minWidth: isMobile ? "auto" : "540px" }}>
        <thead>
          <tr>
            <th className="text-left pb-3 pr-6 w-[160px]">
              <div>
                <span className="label-text">나의 루틴</span>
                <p className="text-[10px] mt-0.5" style={{ color: "var(--text-3)" }}>
                  {isMobile ? "최근 7일" : MONTH_LABEL}
                </p>
              </div>
            </th>
            {visibleDates.map((d, i) => (
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
            <td colSpan={visibleDates.length + 1} className="pb-2" style={{ borderBottom: "1px solid var(--border-2)" }} />
          </tr>
        </thead>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={habits.map(h => h.id)} strategy={verticalListSortingStrategy}>
        <tbody>
          <AnimatePresence initial={false}>
            {habits.length === 0 && !adding && (
              <tr>
                <td colSpan={visibleDates.length + 1} className="py-8 text-center">
                  <p className="text-xs" style={{ color: "var(--text-3)" }}>
                    아직 루틴이 없어요. 아래 버튼으로 추가해보세요!
                  </p>
                </td>
              </tr>
            )}

            {habits.map((habit, rowIdx) => (
              <SortableRow
                key={habit.id}
                habit={habit}
                rowIdx={rowIdx}
                monthDates={visibleDates}
                checks={checks}
                editingId={editingId}
                editIcon={editIcon}
                editName={editName}
                hoverRow={hoverRow}
                ripples={ripples}
                setHoverRow={setHoverRow}
                setEditIcon={setEditIcon}
                setEditName={setEditName}
                setEditingId={setEditingId}
                onSaveEdit={saveEdit}
                onStartEdit={startEdit}
                onDelete={deleteHabit}
                onToggle={handleToggle}
                isChecked={isChecked}
              />
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
                {visibleDates.map((_, i) => <td key={i} />)}
              </motion.tr>
            )}
          </AnimatePresence>

          <tr>
            <td colSpan={visibleDates.length + 1} className="pt-1" style={{ borderTop: "1px solid var(--border-2)" }} />
          </tr>
          <tr>
            <td colSpan={visibleDates.length + 1} className="pt-2 pb-1">
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
          </SortableContext>
        </DndContext>
      </table>
    </motion.div>
  );
}
