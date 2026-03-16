"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, CalendarDays, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { TopChart } from "@/components/dashboard/TopChart";
import { MiddleOverview } from "@/components/dashboard/MiddleOverview";
import { RightSidebar } from "@/components/dashboard/RightSidebar";
import { AiCoach } from "@/components/dashboard/AiCoach";
import { WeeklyView } from "@/components/weekly/WeeklyView";
import { HabitGrid } from "@/components/dashboard/HabitGrid";
import { createClient } from "@/lib/supabase";

type Tab = "dashboard" | "weekly";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 6)  return "고요한 새벽이네요 🌙";
  if (h < 12) return "좋은 아침이에요 🌿";
  if (h < 18) return "오후도 힘내요 ☀️";
  return "오늘 하루도 수고했어요 🌛";
}

export default function Home() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push("/login");
      } else {
        setUserEmail(data.user.email ?? null);
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
        {/* 달 글로우 — 우상단 */}
        <div className="absolute top-[-8%] right-[18%] w-[500px] h-[500px] rounded-full blur-[130px]"
          style={{ background: "rgba(30,110,220,0.40)" }} />
        <div className="absolute top-[-4%] right-[22%] w-[280px] h-[280px] rounded-full blur-[80px]"
          style={{ background: "rgba(60,150,230,0.32)" }} />
        {/* 달빛 지면 반사 */}
        <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[400px] rounded-full blur-[160px]"
          style={{ background: "rgba(20,80,200,0.28)" }} />
        {/* 은하수 느낌 */}
        <div className="absolute top-[30%] left-[-5%] w-[400px] h-[200px] rounded-full blur-[100px]"
          style={{ background: "rgba(15,60,180,0.20)", transform: "rotate(-20deg)" }} />
        {/* 떠다니는 달무리 오브 */}
        <div className="star-orb" style={{ width: 240, height: 240, top: "4%",   right: "14%",  animationDelay: "0s",  animationDuration: "16s" }} />
        <div className="star-orb" style={{ width: 140, height: 140, top: "25%",  left: "4%",   animationDelay: "4s",  animationDuration: "13s" }} />
        <div className="star-orb" style={{ width: 90,  height: 90,  top: "60%",  right: "6%",  animationDelay: "7s",  animationDuration: "11s" }} />
        <div className="star-orb" style={{ width: 110, height: 110, bottom:"10%",left: "12%",  animationDelay: "2s",  animationDuration: "15s" }} />
        {/* 반짝이는 별 */}
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

      <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-7 space-y-4" style={{ zIndex: 1 }}>

        {/* ── 헤더 ────────────────────────────────────── */}
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="dawn-card px-6 py-4 flex items-center justify-between gap-4"
        >
          {/* 좌측: 브랜드 */}
          <div className="flex items-center gap-5">
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

          {/* 중앙: 탭 */}
          <div className="flex items-center gap-1 p-1 rounded-xl"
            style={{ background: "rgba(136,192,224,0.04)", border: "1px solid var(--border-2)" }}>
            {([
              { id: "dashboard", label: "대시보드",   icon: LayoutDashboard },
              { id: "weekly",    label: "주간 기록",   icon: CalendarDays },
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

          {/* 우측: 스탯 */}
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="label-text mb-0.5">연속 일수</p>
              <p className="text-sm font-bold" style={{ color: "var(--amber)" }}>7일 🔥</p>
            </div>
            <div className="hidden md:block w-px h-8" style={{ background: "var(--border-2)" }} />
            <div className="text-right hidden md:block">
              <p className="label-text mb-0.5">이번 달</p>
              <p className="text-sm font-bold" style={{ color: "var(--blue)" }}>74%</p>
            </div>
            <div className="w-px h-8 hidden sm:block" style={{ background: "var(--border-2)" }} />
            {/* 유저 + 로그아웃 */}
            <div className="flex items-center gap-3">
              {userEmail && (
                <p className="text-xs hidden md:block truncate max-w-[140px]" style={{ color: "var(--text-3)" }}>
                  {userEmail}
                </p>
              )}
              <motion.button
                onClick={handleLogout}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
                style={{
                  background: "rgba(136,192,224,0.05)",
                  border: "1px solid var(--border-2)",
                  color: "var(--text-3)",
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
              <section className="dawn-card p-6"><TopChart /></section>
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 items-start">
                <div className="flex flex-col gap-4">
                  <section className="dawn-card p-6"><HabitGrid /></section>
                  <section className="dawn-card p-6"><MiddleOverview /></section>
                </div>
                <div className="flex flex-col gap-4">
                  <section className="dawn-card p-6"><AiCoach /></section>
                  <section className="dawn-card p-6"><RightSidebar /></section>
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
              <section className="dawn-card p-6"><WeeklyView /></section>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="h-8" />
      </div>
    </div>
  );
}
