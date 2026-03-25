"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase";

export type ForbiddenHabit = {
  id: string;
  user_id: string;
  icon: string;
  name: string;
  sort_order: number;
};

export type ForbiddenCheck = {
  id: string;
  habit_id: string;
  user_id: string;
  checked_date: string;
};

type ForbiddenContextType = {
  habits: ForbiddenHabit[];
  checks: ForbiddenCheck[];
  userId: string | null;
  loading: boolean;
  violationDates: Set<string>;
  toggleCheck: (habitId: string, dateStr: string) => Promise<void>;
  refresh: () => Promise<void>;
};

const ForbiddenContext = createContext<ForbiddenContextType | null>(null);

export function ForbiddenProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const [habits, setHabits] = useState<ForbiddenHabit[]>([]);
  const [checks, setChecks] = useState<ForbiddenCheck[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    setUserId(user.id);

    const [{ data: h }, { data: c }] = await Promise.all([
      supabase.from("forbidden_habits").select("*").eq("user_id", user.id).order("sort_order"),
      supabase.from("forbidden_checks").select("*").eq("user_id", user.id),
    ]);

    setHabits(h ?? []);
    setChecks(c ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const toggleCheck = async (habitId: string, dateStr: string) => {
    const existing = checks.find(c => c.habit_id === habitId && c.checked_date === dateStr);
    if (existing) {
      await supabase.from("forbidden_checks").delete().eq("id", existing.id);
      setChecks(prev => prev.filter(c => c.id !== existing.id));
    } else {
      const { data } = await supabase.from("forbidden_checks")
        .insert({ habit_id: habitId, user_id: userId, checked_date: dateStr })
        .select().single();
      if (data) setChecks(prev => [...prev, data]);
    }
  };

  const violationDates = new Set(checks.map(c => c.checked_date));

  return (
    <ForbiddenContext.Provider value={{ habits, checks, userId, loading, violationDates, toggleCheck, refresh }}>
      {children}
    </ForbiddenContext.Provider>
  );
}

export function useForbidden() {
  const ctx = useContext(ForbiddenContext);
  if (!ctx) throw new Error("useForbidden must be used within ForbiddenProvider");
  return ctx;
}
