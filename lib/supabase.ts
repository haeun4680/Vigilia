import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
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
