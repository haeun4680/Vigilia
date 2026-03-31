"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { createClient } from "@/lib/supabase";
import { toLocalDateStr } from "@/lib/habit-context";

type CoinContextType = {
  coins: number;
  isSubscribed: boolean;
  aiWeeklyUsedAt: Date | null;
  aiMonthlyUsedAt: Date | null;
  loading: boolean;
  spendCoins: (amount: number, reason: string) => Promise<boolean>;
  checkHabitStreakReward: (habitId: string) => Promise<boolean>; // returns true if rewarded
  markAiWeeklyUsed: () => Promise<void>;
  markAiMonthlyUsed: () => Promise<void>;
};

const CoinContext = createContext<CoinContextType | null>(null);

export function useCoins() {
  const ctx = useContext(CoinContext);
  if (!ctx) throw new Error("useCoins must be inside CoinProvider");
  return ctx;
}

export function CoinProvider({ children }: { children: ReactNode }) {
  const supabase = createClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [coins, setCoins] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [aiWeeklyUsedAt, setAiWeeklyUsedAt] = useState<Date | null>(null);
  const [aiMonthlyUsedAt, setAiMonthlyUsedAt] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  const loadCoins = useCallback(async (uid: string) => {
    const { data } = await supabase
      .from("user_coins")
      .select("*")
      .eq("user_id", uid)
      .single();

    if (data) {
      setCoins(data.balance ?? 0);
      setIsSubscribed(data.is_subscribed ?? false);
      setAiWeeklyUsedAt(data.ai_weekly_used_at ? new Date(data.ai_weekly_used_at) : null);
      setAiMonthlyUsedAt(data.ai_monthly_used_at ? new Date(data.ai_monthly_used_at) : null);
    } else {
      // 첫 로그인 시 row 생성
      await supabase.from("user_coins").insert({ user_id: uid, balance: 0 });
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id);
        loadCoins(data.user.id);
      } else {
        setLoading(false);
      }
    });
  }, [loadCoins, supabase]);

  // DB에서 최신 잔액 재조회
  const refreshBalance = useCallback(async (uid: string) => {
    const { data } = await supabase
      .from("user_coins")
      .select("balance")
      .eq("user_id", uid)
      .single();
    if (data) setCoins(data.balance ?? 0);
  }, [supabase]);

  // 코인 지급 (DB increment)
  const awardCoins = useCallback(async (amount: number, reason: string, uid: string) => {
    const { data: cur } = await supabase
      .from("user_coins")
      .select("balance")
      .eq("user_id", uid)
      .single();
    const newBalance = (cur?.balance ?? 0) + amount;
    await Promise.all([
      supabase.from("coin_transactions").insert({ user_id: uid, amount, reason }),
      supabase.from("user_coins").update({ balance: newBalance, updated_at: new Date().toISOString() }).eq("user_id", uid),
    ]);
    setCoins(newBalance);
  }, [supabase]);

  // 코인 사용 — 잔액 부족 시 false 반환
  const spendCoins = useCallback(async (amount: number, reason: string): Promise<boolean> => {
    if (!userId) return false;
    const { data: cur } = await supabase
      .from("user_coins")
      .select("balance")
      .eq("user_id", userId)
      .single();
    const current = cur?.balance ?? 0;
    if (current < amount) return false;
    const newBalance = current - amount;
    await Promise.all([
      supabase.from("coin_transactions").insert({ user_id: userId, amount: -amount, reason }),
      supabase.from("user_coins").update({ balance: newBalance, updated_at: new Date().toISOString() }).eq("user_id", userId),
    ]);
    setCoins(newBalance);
    return true;
  }, [userId, supabase]);

  // 주간 개근 보상 체크 (체크 추가 후 호출)
  const checkHabitStreakReward = useCallback(async (habitId: string): Promise<boolean> => {
    if (!userId) return false;

    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
    const weekStart = toLocalDateStr(monday);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const weekEnd = toLocalDateStr(sunday);

    // 이번 주 이 루틴의 체크 수 확인
    const { data: weekChecks } = await supabase
      .from("habit_checks")
      .select("checked_date")
      .eq("habit_id", habitId)
      .eq("user_id", userId)
      .gte("checked_date", weekStart)
      .lte("checked_date", weekEnd);

    if (!weekChecks || weekChecks.length < 7) return false;

    // 이미 이번 주에 이 루틴 보상 받았는지 확인
    const rewardReason = `weekly_streak:${habitId}:${weekStart}`;
    const { data: existing } = await supabase
      .from("coin_transactions")
      .select("id")
      .eq("user_id", userId)
      .eq("reason", rewardReason)
      .maybeSingle();

    if (existing) return false;

    await awardCoins(10, rewardReason, userId);
    return true;
  }, [userId, awardCoins, supabase]);

  const markAiWeeklyUsed = useCallback(async () => {
    if (!userId) return;
    const now = new Date();
    setAiWeeklyUsedAt(now);
    await supabase.from("user_coins")
      .update({ ai_weekly_used_at: now.toISOString() })
      .eq("user_id", userId);
  }, [userId, supabase]);

  const markAiMonthlyUsed = useCallback(async () => {
    if (!userId) return;
    const now = new Date();
    setAiMonthlyUsedAt(now);
    await supabase.from("user_coins")
      .update({ ai_monthly_used_at: now.toISOString() })
      .eq("user_id", userId);
  }, [userId, supabase]);

  return (
    <CoinContext.Provider value={{
      coins, isSubscribed, aiWeeklyUsedAt, aiMonthlyUsedAt, loading,
      spendCoins, checkHabitStreakReward, markAiWeeklyUsed, markAiMonthlyUsed,
    }}>
      {children}
    </CoinContext.Provider>
  );
}
