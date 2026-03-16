"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { createClient, Habit, HabitCheck } from "@/lib/supabase";

type HabitContextType = {
  habits: Habit[];
  checks: HabitCheck[];
  userId: string | null;
  loading: boolean;
  weekDates: string[];
  refresh: () => Promise<void>;
  toggleCheck: (habitId: string, dateStr: string) => Promise<void>;
};

const HabitContext = createContext<HabitContextType | null>(null);

export function useHabits() {
  const ctx = useContext(HabitContext);
  if (!ctx) throw new Error("useHabits must be used inside HabitProvider");
  return ctx;
}

function getWeekDates() {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().slice(0, 10);
  });
}

// 지난 365일 날짜 범위
function getYearDates() {
  const today = new Date();
  return Array.from({ length: 365 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - 364 + i);
    return d.toISOString().slice(0, 10);
  });
}

const weekDates = getWeekDates();
const yearDates = getYearDates();

export function HabitProvider({ children }: { children: ReactNode }) {
  const supabase = createClient();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [checks, setChecks] = useState<HabitCheck[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (uid: string) => {
    const [{ data: h }, { data: c }] = await Promise.all([
      supabase.from("habits").select("*").eq("user_id", uid).order("created_at"),
      supabase.from("habit_checks").select("*").eq("user_id", uid)
        .gte("checked_date", yearDates[0])
        .lte("checked_date", yearDates[yearDates.length - 1]),
    ]);
    setHabits(h ?? []);
    setChecks(c ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id);
        load(data.user.id);
      } else {
        setLoading(false);
      }
    });
  }, []);

  const refresh = useCallback(async () => {
    if (userId) await load(userId);
  }, [userId, load]);

  const toggleCheck = useCallback(async (habitId: string, dateStr: string) => {
    if (!userId) return;
    const already = checks.some(c => c.habit_id === habitId && c.checked_date === dateStr);

    if (already) {
      // 낙관적 업데이트
      setChecks(prev => prev.filter(c => !(c.habit_id === habitId && c.checked_date === dateStr)));
      await supabase.from("habit_checks").delete()
        .eq("habit_id", habitId).eq("checked_date", dateStr);
    } else {
      const optimistic: HabitCheck = {
        id: `temp-${Date.now()}`, habit_id: habitId,
        user_id: userId, checked_date: dateStr,
      };
      setChecks(prev => [...prev, optimistic]);
      const { data } = await supabase.from("habit_checks")
        .insert({ habit_id: habitId, user_id: userId, checked_date: dateStr })
        .select().single();
      if (data) {
        setChecks(prev => prev.map(c => c.id === optimistic.id ? data : c));
      }
    }
  }, [userId, checks]);

  return (
    <HabitContext.Provider value={{ habits, checks, userId, loading, weekDates, refresh, toggleCheck }}>
      {children}
    </HabitContext.Provider>
  );
}

// 차트용 헬퍼: 날짜별 달성률 계산
export function calcDailyRate(habits: Habit[], checks: HabitCheck[], dateStr: string) {
  if (habits.length === 0) return null;
  const done = checks.filter(c => c.checked_date === dateStr).length;
  return Math.round((done / habits.length) * 100);
}
