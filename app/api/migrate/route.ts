import { NextResponse } from "next/server";

// Supabase 프로젝트 레퍼런스 추출
const PROJECT_REF = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "")
  .replace("https://", "")
  .replace(".supabase.co", "");

// 누적 마이그레이션 목록 — 이 파일에만 추가하면 자동 적용
const MIGRATIONS: { id: string; sql: string }[] = [
  {
    id: "001_user_coins",
    sql: `
      CREATE TABLE IF NOT EXISTS user_coins (
        user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        balance INTEGER NOT NULL DEFAULT 0,
        ai_weekly_used_at TIMESTAMPTZ,
        ai_monthly_used_at TIMESTAMPTZ,
        is_subscribed BOOLEAN NOT NULL DEFAULT FALSE,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      ALTER TABLE user_coins ENABLE ROW LEVEL SECURITY;
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE tablename='user_coins' AND policyname='own'
        ) THEN
          CREATE POLICY "own" ON user_coins FOR ALL USING (auth.uid() = user_id);
        END IF;
      END $$;
    `,
  },
  {
    id: "002_coin_transactions",
    sql: `
      CREATE TABLE IF NOT EXISTS coin_transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        amount INTEGER NOT NULL,
        reason TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      ALTER TABLE coin_transactions ENABLE ROW LEVEL SECURITY;
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE tablename='coin_transactions' AND policyname='own'
        ) THEN
          CREATE POLICY "own" ON coin_transactions FOR ALL USING (auth.uid() = user_id);
        END IF;
      END $$;
    `,
  },
  {
    id: "003_journey_start_date",
    sql: `ALTER TABLE user_coins ADD COLUMN IF NOT EXISTS journey_start_date TEXT;`,
  },
];

async function runSQL(sql: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(
      `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({ query: sql }),
      }
    );
    if (!res.ok) {
      const text = await res.text();
      return { ok: false, error: text };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function POST() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "SERVICE_ROLE_KEY_MISSING" }, { status: 500 });
  }

  const results: { id: string; ok: boolean; error?: string }[] = [];

  for (const m of MIGRATIONS) {
    const result = await runSQL(m.sql);
    results.push({ id: m.id, ...result });
    // 실패해도 다음 마이그레이션 계속 시도
  }

  const allOk = results.every(r => r.ok);
  return NextResponse.json({ ok: allOk, results }, { status: allOk ? 200 : 207 });
}
