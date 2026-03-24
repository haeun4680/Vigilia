"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { createClient } from "@/lib/supabase";
import { toLocalDateStr } from "@/lib/habit-context";

export type Challenge = {
  id: string;
  user_id: string;
  duration_days: number;
  target_animal: string;
  started_at: string;
  completed_at: string | null;
  status: "active" | "completed" | "failed";
};

type ChallengeContextType = {
  activeChallenge: Challenge | null;
  completedChallenges: Challenge[];
  loading: boolean;
  startChallenge: (durationDays: number, targetAnimal: string) => Promise<void>;
  completeChallenge: () => Promise<void>;
  refresh: () => Promise<void>;
};

const ChallengeContext = createContext<ChallengeContextType | null>(null);

export function useChallenges() {
  const ctx = useContext(ChallengeContext);
  if (!ctx) throw new Error("useChallenges must be inside ChallengeProvider");
  return ctx;
}

export function ChallengeProvider({ children }: { children: ReactNode }) {
  const supabase = createClient();
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [completedChallenges, setCompletedChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChallenges = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data } = await supabase
      .from("challenges")
      .select("*")
      .eq("user_id", user.id)
      .order("started_at", { ascending: false });

    if (data) {
      setActiveChallenge(data.find((c: Challenge) => c.status === "active") ?? null);
      setCompletedChallenges(data.filter((c: Challenge) => c.status === "completed"));
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchChallenges(); }, [fetchChallenges]);

  const startChallenge = useCallback(async (durationDays: number, targetAnimal: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase.from("challenges").insert({
      user_id: user.id,
      duration_days: durationDays,
      target_animal: targetAnimal,
      started_at: toLocalDateStr(new Date()),
      status: "active",
    }).select().single();

    if (data) setActiveChallenge(data);
  }, [supabase]);

  const completeChallenge = useCallback(async () => {
    if (!activeChallenge) return;

    const { data } = await supabase.from("challenges")
      .update({ status: "completed", completed_at: toLocalDateStr(new Date()) })
      .eq("id", activeChallenge.id)
      .select().single();

    if (data) {
      setCompletedChallenges(prev => [data, ...prev]);
      setActiveChallenge(null);
    }
  }, [supabase, activeChallenge]);

  return (
    <ChallengeContext.Provider value={{
      activeChallenge, completedChallenges, loading,
      startChallenge, completeChallenge, refresh: fetchChallenges,
    }}>
      {children}
    </ChallengeContext.Provider>
  );
}
