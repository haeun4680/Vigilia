"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, CalendarDays, CalendarRange, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { TopChart } from "@/components/dashboard/TopChart";
import { MiddleOverview } from "@/components/dashboard/MiddleOverview";
import { RightSidebar } from "@/components/dashboard/RightSidebar";
import { WeeklyView } from "@/components/weekly/WeeklyView";
import { MonthlyView } from "@/components/monthly/MonthlyView";
import { HabitGrid } from "@/components/dashboard/HabitGrid";
import { createClient } from "@/lib/supabase";
import { HabitProvider, useHabits } from "@/lib/habit-context";

type Tab = "dashboard" | "weekly" | "monthly";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 6)  return "고요한 새벽이네요 🌙";
  if (h < 12) return "좋은 아침이에요 🌿";
  if (h < 18) return "오후도 힘내요 ☀️";
  return "오늘 하루도 수고했어요 🌛";
}

// 헤더 통계 — 실제 데이터
function HeaderStats() {
  const { habits, checks } = useHabits();

  const { currentStreak, completionRate } = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const checkedDates = new Set(checks.map(c => c.checked_date));

    let currentStreak = 0;
    const d = new Date(now);
    while (true) {
      const ds = d.toISOString().slice(0, 10);
      if (ds > today) { d.setDate(d.getDate() - 1); continue; }
      if (!checkedDates.has(ds)) break;
      currentStreak++;
      d.setDate(d.getDate() - 1);
    }

    const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const daysThisMonth = now.getDate();
    const thisMonthChecks = checks.filter(c => c.checked_date.startsWith(monthPrefix)).length;
    const totalPossible = habits.length * daysThisMonth;
    const completionRate = totalPossible === 0 ? 0
      : Math.round((thisMonthChecks / totalPossible) * 100);

    return { currentStreak, completionRate };
  }, [habits, checks]);

  return (
    <>
      <div className="text-right hidden md:block">
        <p className="label-text mb-0.5">연속 일수</p>
        <p className="text-sm font-bold" style={{ color: "var(--amber)" }}>{currentStreak}일 🔥</p>
      </div>
      <div className="hidden md:block w-px h-8" style={{ background: "var(--border-2)" }} />
      <div className="text-right hidden md:block">
        <p className="label-text mb-0.5">이번 달</p>
        <p className="text-sm font-bold" style={{ color: "var(--blue)" }}>{completionRate}%</p>
      </div>
    </>
  );
}

export default function Home() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    // Tauri OAuth 콜백에서 URL로 전달된 토큰 처리
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");

    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
        if (data.user) {
          setUserEmail(data.user.email ?? null);
          // URL 정리하지 않음 — history 조작이 재마운트 유발할 수 있음
        } else {
          router.push("/login");
        }
      });
      return;
    }

    // getSession(): 로컬 스토리지 읽기 (네트워크 없음, 빠름)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push("/login");
      } else {
        setUserEmail(session.user?.email ?? null);
      }
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };
  const now = new Date();
  const dateStr = now.toLocaleDateString("ko-KR", {
    year: "numeric", month: "long", day: "numeric", weekday: "long",
  });

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      {/* 달빛 앰비언트 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div className="absolute top-[-8%] right-[18%] w-[500px] h-[500px] rounded-full blur-[130px]"
          style={{ background: "rgba(30,110,220,0.40)" }} />
        <div className="absolute top-[-4%] right-[22%] w-[280px] h-[280px] rounded-full blur-[80px]"
          style={{ background: "rgba(60,150,230,0.32)" }} />
        <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[400px] rounded-full blur-[160px]"
          style={{ background: "rgba(20,80,200,0.28)" }} />
        <div className="absolute top-[30%] left-[-5%] w-[400px] h-[200px] rounded-full blur-[100px]"
          style={{ background: "rgba(15,60,180,0.20)", transform: "rotate(-20deg)" }} />
        <div className="star-orb" style={{ width: 240, height: 240, top: "4%",   right: "14%",  animationDelay: "0s",  animationDuration: "16s" }} />
        <div className="star-orb" style={{ width: 140, height: 140, top: "25%",  left: "4%",   animationDelay: "4s",  animationDuration: "13s" }} />
        <div className="star-orb" style={{ width: 90,  height: 90,  top: "60%",  right: "6%",  animationDelay: "7s",  animationDuration: "11s" }} />
        <div className="star-orb" style={{ width: 110, height: 110, bottom:"10%",left: "12%",  animationDelay: "2s",  animationDuration: "15s" }} />
        {[
          { top:"8%",  left:"10%", dur:"3.2s", delay:"0s"   },
          { top:"12%", left:"45%", dur:"2.8s", delay:"0.8s" },
          { top:"6%",  left:"65%", dur:"4.1s", delay:"1.5s" },
          { top:"20%", right:"25%",dur:"2.5s", delay:"0.3s" },
          { top:"35%", left:"8%",  dur:"3.7s", delay:"2.1s" },
          { top:"50%", left:"55%", dur:"2.9s", delay:"1.0s" },
          { top:"70%", right:"8%", dur:"3.5s", delay:"0.6s" },
          { top:"80%", left:"30%", dur:"4.3s", delay:"1.8s" },
          { top:"15%", right:"10%",dur:"2.7s", delay:"2.5s" },
          { top:"45%", right:"20%",dur:"3.9s", delay:"0.4s" },
          { top:"25%", left:"75%", dur:"2.6s", delay:"1.3s" },
          { top:"62%", left:"22%", dur:"3.3s", delay:"0.9s" },
        ].map((s, i) => (
          <div key={i} className="star-twinkle"
            style={{ top: s.top, left: (s as any).left, right: (s as any).right,
              ["--twinkle-dur" as any]: s.dur, animationDelay: s.delay }} />
        ))}
      </div>

      <HabitProvider>
        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-7 space-y-4" style={{ zIndex: 1 }}>

          {/* ── 헤더 ────────────────────────────────────── */}
          <motion.header
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="dawn-card px-4 sm:px-6 py-3 sm:py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
          >
            {/* 좌측: 브랜드 + 모바일 로그아웃 */}
            <div className="flex items-center justify-between sm:justify-start sm:gap-5">
              <div className="flex items-center gap-4 sm:gap-5">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <div className="w-1.5 h-1.5 rounded-full"
                      style={{ background: "var(--blue)", boxShadow: "0 0 6px var(--blue)" }} />
                    <span className="text-[10px] tracking-[0.2em] uppercase font-medium"
                      style={{ color: "var(--blue-dim)", fontFamily: "var(--font-en)" }}>
                      루틴
                    </span>
                  </div>
                  <p className="text-sm font-medium" style={{ color: "var(--text-2)" }}>
                    {getGreeting()}
                  </p>
                </div>
                <div className="hidden sm:block w-px h-8" style={{ background: "var(--border-2)" }} />
                <div className="hidden sm:block">
                  <p className="label-text mb-0.5">오늘</p>
                  <p className="text-xs font-medium" style={{ color: "var(--text-2)" }}>{dateStr}</p>
                </div>
              </div>
              {/* 모바일 전용 로그아웃 */}
              <motion.button
                onClick={handleLogout}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="sm:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
                style={{
                  background: "rgba(80,160,240,0.08)",
                  border: "1px solid var(--border-1)",
                  color: "var(--text-2)",
                }}>
                <LogOut className="w-3.5 h-3.5" />
              </motion.button>
            </div>

            {/* 중앙: 탭 */}
            <div className="flex justify-center sm:justify-normal">
              <div className="flex items-center gap-1 p-1 rounded-xl"
                style={{ background: "rgba(136,192,224,0.04)", border: "1px solid var(--border-2)" }}>
                {([
                  { id: "dashboard", label: "대시보드", icon: LayoutDashboard },
                  { id: "weekly",    label: "주간 기록", icon: CalendarDays },
                  { id: "monthly",   label: "월간 기록", icon: CalendarRange },
                ] as const).map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setTab(id)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all duration-250"
                    style={{
                      background: tab === id ? "rgba(136,192,224,0.1)" : "transparent",
                      color: tab === id ? "var(--blue)" : "var(--text-3)",
                      border: tab === id ? "1px solid rgba(136,192,224,0.2)" : "1px solid transparent",
                      boxShadow: tab === id ? "0 0 12px rgba(136,192,224,0.08)" : "none",
                    }}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* 우측: 실제 스탯 + 로그아웃 (데스크톱 전용) */}
            <div className="hidden sm:flex items-center gap-4">
              <HeaderStats />
              <div className="w-px h-8" style={{ background: "var(--border-2)" }} />
              <div className="flex items-center gap-3">
                {userEmail && (
                  <p className="text-xs hidden md:block truncate max-w-[140px]" style={{ color: "var(--text-2)" }}>
                    {userEmail}
                  </p>
                )}
                <motion.button
                  onClick={handleLogout}
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
                  style={{
                    background: "rgba(80,160,240,0.08)",
                    border: "1px solid var(--border-1)",
                    color: "var(--text-2)",
                  }}>
                  <LogOut className="w-3 h-3" />
                  로그아웃
                </motion.button>
              </div>
            </div>
          </motion.header>

          {/* ── 탭 콘텐츠 ───────────────────────────────── */}
          <AnimatePresence mode="wait">
            {tab === "dashboard" && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 16, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.99 }}
                transition={{ type: "spring", stiffness: 280, damping: 28 }}
                className="space-y-4"
              >
                <section className="dawn-card p-4 sm:p-6"><TopChart /></section>
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 items-start">
                  <div className="flex flex-col gap-4">
                    <section className="dawn-card p-4 sm:p-6"><MiddleOverview /></section>
                    <section className="dawn-card p-4 sm:p-6"><HabitGrid /></section>
                  </div>
                  <div className="flex flex-col gap-4">
                    <section className="dawn-card p-4 sm:p-6"><RightSidebar /></section>
                  </div>
                </div>
              </motion.div>
            )}

            {tab === "weekly" && (
              <motion.div
                key="weekly"
                initial={{ opacity: 0, y: 16, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.99 }}
                transition={{ type: "spring", stiffness: 280, damping: 28 }}
              >
                <section className="dawn-card p-4 sm:p-6"><WeeklyView /></section>
              </motion.div>
            )}

            {tab === "monthly" && (
              <motion.div
                key="monthly"
                initial={{ opacity: 0, y: 16, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.99 }}
                transition={{ type: "spring", stiffness: 280, damping: 28 }}
              >
                <section className="dawn-card p-4 sm:p-6"><MonthlyView /></section>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="h-8" />
        </div>
      </HabitProvider>
    </div>
  );
}
