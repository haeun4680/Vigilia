import { createClient as _create } from "@supabase/supabase-js";

// 싱글턴 — tauri.localhost에서 쿠키 대신 localStorage 사용
const _client = _create<any>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function createClient() {
  return _client;
}

export type Habit = {
  id: string;
  user_id: string;
  icon: string;
  name: string;
  goal: string;
  created_at: string;
};

export type HabitCheck = {
  id: string;
  habit_id: string;
  user_id: string;
  checked_date: string; // YYYY-MM-DD
};
