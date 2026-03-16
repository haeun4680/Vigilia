"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Sparkles, BarChart2, CalendarDays, Brain, ArrowRight, Check } from "lucide-react";

const features = [
  {
    icon: CalendarDays,
    title: "주간 · 월간 루틴 기록",
    desc: "매일의 루틴을 체크하고, 한눈에 달성률을 확인해요.",
    color: "var(--blue)",
    bg: "rgba(43,143,240,0.06)",
    border: "rgba(43,143,240,0.2)",
  },
  {
    icon: BarChart2,
    title: "습관 성장 그래프",
    desc: "이번 주 루틴 흐름을 시각적으로 파악할 수 있어요.",
    color: "var(--blue-bright)",
    bg: "rgba(112,192,255,0.06)",
    border: "rgba(112,192,255,0.2)",
  },
  {
    icon: Brain,
    title: "AI 루틴 코치",
    desc: "Gemini AI가 내 루틴 데이터를 분석해 실질적인 조언을 드려요.",
    color: "var(--lavender)",
    bg: "rgba(96,112,192,0.06)",
    border: "rgba(96,112,192,0.2)",
  },
  {
    icon: Sparkles,
    title: "연속 달성 스트릭",
    desc: "꾸준히 이어지는 날들이 쌓여 당신의 루틴이 됩니다.",
    color: "var(--amber)",
    bg: "rgba(160,136,64,0.06)",
    border: "rgba(160,136,64,0.2)",
  },
];

const stats = [
  { value: "21일", label: "습관 형성까지" },
  { value: "4가지", label: "핵심 루틴 트래킹" },
  { value: "AI", label: "맞춤 분석 코치" },
];

export default function Landing() {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>

      {/* 배경 앰비언트 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div className="absolute top-[-10%] right-[15%] w-[600px] h-[600px] rounded-full blur-[150px]"
          style={{ background: "rgba(30,110,220,0.35)" }} />
        <div className="absolute top-[-5%] right-[20%] w-[300px] h-[300px] rounded-full blur-[90px]"
          style={{ background: "rgba(60,150,230,0.28)" }} />
        <div className="absolute bottom-[-15%] left-[15%] w-[700px] h-[500px] rounded-full blur-[180px]"
          style={{ background: "rgba(20,80,200,0.22)" }} />
        <div className="absolute top-[40%] left-[-5%] w-[400px] h-[200px] rounded-full blur-[110px]"
          style={{ background: "rgba(15,60,180,0.18)", transform: "rotate(-20deg)" }} />
        {/* 별 */}
        {[
          { top:"5%",  left:"8%",  dur:"3.2s", delay:"0s"   },
          { top:"10%", left:"42%", dur:"2.8s", delay:"0.8s" },
          { top:"7%",  left:"68%", dur:"4.1s", delay:"1.5s" },
          { top:"18%", left:"85%", dur:"2.5s", delay:"0.3s" },
          { top:"32%", left:"5%",  dur:"3.7s", delay:"2.1s" },
          { top:"55%", left:"92%", dur:"2.9s", delay:"1.0s" },
          { top:"72%", left:"12%", dur:"3.5s", delay:"0.6s" },
          { top:"85%", left:"55%", dur:"4.3s", delay:"1.8s" },
          { top:"22%", left:"55%", dur:"2.7s", delay:"2.5s" },
          { top:"48%", left:"75%", dur:"3.9s", delay:"0.4s" },
        ].map((s, i) => (
          <div key={i} className="star-twinkle"
            style={{ top: s.top, left: s.left,
              ["--twinkle-dur" as any]: s.dur, animationDelay: s.delay }} />
        ))}
      </div>

      <div className="relative max-w-[960px] mx-auto px-6 py-10 space-y-24" style={{ zIndex: 1 }}>

        {/* ── 헤더 nav ── */}
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full"
              style={{ background: "var(--blue)", boxShadow: "0 0 8px var(--blue)" }} />
            <span className="text-base font-semibold tracking-wider"
              style={{ color: "var(--text-1)", fontFamily: "var(--font-en)" }}>
              Vigilia
            </span>
          </div>
          <Link href="/dashboard">
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
              style={{
                background: "rgba(43,143,240,0.1)",
                border: "1px solid rgba(43,143,240,0.3)",
                color: "var(--blue)",
              }}>
              앱 시작하기 <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>
          </Link>
        </motion.nav>

        {/* ── Hero ── */}
        <section className="flex flex-col items-center text-center gap-8 pt-12">

          {/* 달 오브 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.0, ease: "easeOut" }}
            className="relative"
          >
            <div className="w-28 h-28 rounded-full"
              style={{
                background: "radial-gradient(circle at 35% 30%, rgba(112,192,255,0.22) 0%, rgba(43,143,240,0.10) 45%, transparent 70%)",
                border: "1px solid rgba(112,192,255,0.25)",
                boxShadow: "0 0 40px rgba(43,143,240,0.3), 0 0 80px rgba(43,143,240,0.15), inset 0 1px 0 rgba(180,225,255,0.3)",
              }} />
            {/* 달 하이라이트 */}
            <div className="absolute top-[18%] left-[22%] w-8 h-4 rounded-full blur-[6px]"
              style={{ background: "rgba(200,230,255,0.35)" }} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="space-y-4"
          >
            <p className="label-text tracking-[0.3em]">HABIT TRACKER</p>
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-tight"
              style={{ color: "var(--text-1)", fontFamily: "var(--font-en)" }}>
              Vigilia
            </h1>
            <p className="text-lg font-medium" style={{ color: "var(--text-2)" }}>
              달빛 아래, 매일의 루틴을 지켜내는 곳
            </p>
            <p className="text-sm max-w-[440px] mx-auto leading-relaxed" style={{ color: "var(--text-3)" }}>
              작은 습관이 쌓여 큰 변화가 됩니다.<br />
              Vigilia와 함께 나만의 루틴을 만들어가세요.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="flex items-center gap-4"
          >
            <Link href="/dashboard">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(43,143,240,0.4)" }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-7 py-3.5 rounded-2xl text-sm font-semibold"
                style={{
                  background: "var(--blue)",
                  color: "#fff",
                  boxShadow: "0 0 20px rgba(43,143,240,0.35)",
                }}>
                지금 시작하기 <ArrowRight className="w-4 h-4" />
              </motion.button>
            </Link>
          </motion.div>

          {/* 스탯 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex items-center gap-8 pt-4"
          >
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl font-bold tabular-nums"
                  style={{ color: "var(--blue)", fontFamily: "var(--font-en)" }}>{s.value}</p>
                <p className="text-[11px] mt-0.5" style={{ color: "var(--text-3)" }}>{s.label}</p>
              </div>
            ))}
          </motion.div>
        </section>

        {/* ── 앱 미리보기 ── */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
        >
          <div className="dawn-card p-1.5 overflow-hidden">
            {/* 가짜 브라우저 탑바 */}
            <div className="flex items-center gap-1.5 px-4 py-3"
              style={{ borderBottom: "1px solid var(--border-2)" }}>
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(255,100,100,0.4)" }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(255,200,80,0.4)" }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(80,200,120,0.4)" }} />
              <div className="ml-4 px-4 py-0.5 rounded-md text-[11px]"
                style={{ background: "rgba(136,192,224,0.06)", border: "1px solid var(--border-2)", color: "var(--text-3)" }}>
                vigilia.vercel.app/dashboard
              </div>
            </div>
            {/* 미리보기 내용 */}
            <div className="p-6 space-y-3">
              {/* 헤더 바 */}
              <div className="h-12 rounded-xl" style={{ background: "rgba(43,143,240,0.05)", border: "1px solid var(--border-2)" }}>
                <div className="flex items-center justify-between h-full px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--blue)", boxShadow: "0 0 6px var(--blue)" }} />
                    <div className="h-2 w-16 rounded-full" style={{ background: "var(--border-1)" }} />
                  </div>
                  <div className="flex gap-2">
                    <div className="h-6 w-20 rounded-lg" style={{ background: "rgba(43,143,240,0.12)", border: "1px solid rgba(43,143,240,0.2)" }} />
                    <div className="h-6 w-20 rounded-lg" style={{ background: "transparent" }} />
                  </div>
                  <div className="flex gap-3">
                    <div className="h-2 w-10 rounded-full" style={{ background: "var(--border-1)" }} />
                    <div className="h-2 w-10 rounded-full" style={{ background: "var(--blue)", opacity: 0.5 }} />
                  </div>
                </div>
              </div>
              {/* 차트 영역 */}
              <div className="h-28 rounded-xl flex items-end gap-1.5 px-4 pb-4 pt-3"
                style={{ background: "rgba(43,143,240,0.03)", border: "1px solid var(--border-2)" }}>
                <div className="flex-1 h-full flex items-end gap-1">
                  {[55, 70, 48, 82, 65, 90, 74].map((h, i) => (
                    <motion.div key={i}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${h}%` }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05, duration: 0.5, ease: "easeOut" }}
                      className="flex-1 rounded-t-sm"
                      style={{ background: `rgba(43,143,240,${0.15 + h/400})`, minHeight: 4 }} />
                  ))}
                </div>
              </div>
              {/* 루틴 행 */}
              <div className="space-y-1.5">
                {[
                  { name: "🧘 명상", checks: [1,1,1,0,1,1,0] },
                  { name: "📚 독서", checks: [1,0,1,1,1,0,0] },
                  { name: "🏃 운동", checks: [0,1,1,1,0,1,1] },
                ].map((row, ri) => (
                  <div key={ri} className="flex items-center gap-3 px-3 py-2 rounded-lg"
                    style={{ background: "rgba(43,143,240,0.03)", border: "1px solid var(--border-2)" }}>
                    <span className="text-xs w-20 truncate" style={{ color: "var(--text-2)" }}>{row.name}</span>
                    <div className="flex gap-1.5">
                      {row.checks.map((c, ci) => (
                        <div key={ci} className="w-5 h-5 rounded-md flex items-center justify-center"
                          style={{
                            background: c ? "rgba(43,143,240,0.15)" : "transparent",
                            border: c ? "1px solid rgba(43,143,240,0.4)" : "1px solid var(--border-2)",
                          }}>
                          {c ? <Check className="w-2.5 h-2.5" style={{ color: "var(--blue)" }} /> : null}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* ── 기능 소개 ── */}
        <section className="space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            className="text-center space-y-2"
          >
            <p className="label-text tracking-[0.25em]">FEATURES</p>
            <h2 className="text-2xl font-bold" style={{ color: "var(--text-1)" }}>
              루틴을 지키는 데 필요한 모든 것
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map(({ icon: Icon, title, desc, color, bg, border }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.08 }}
                className="dawn-card p-5 space-y-3"
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: bg, border: `1px solid ${border}` }}>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <div>
                  <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-1)" }}>{title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--text-3)" }}>{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── 하단 CTA ── */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="dawn-card p-12 flex flex-col items-center text-center gap-6"
        >
          <div className="w-16 h-16 rounded-full"
            style={{
              background: "radial-gradient(circle at 35% 30%, rgba(112,192,255,0.2) 0%, rgba(43,143,240,0.08) 50%, transparent 70%)",
              border: "1px solid rgba(112,192,255,0.2)",
              boxShadow: "0 0 30px rgba(43,143,240,0.25)",
            }} />
          <div className="space-y-2">
            <h2 className="text-2xl font-bold" style={{ color: "var(--text-1)" }}>
              오늘 첫 루틴을 시작해요
            </h2>
            <p className="text-sm" style={{ color: "var(--text-3)" }}>
              달빛 아래, 조용히 나를 만들어가는 시간
            </p>
          </div>
          <Link href="/dashboard">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(43,143,240,0.45)" }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-semibold"
              style={{
                background: "var(--blue)",
                color: "#fff",
                boxShadow: "0 0 20px rgba(43,143,240,0.3)",
              }}>
              Vigilia 시작하기 <ArrowRight className="w-4 h-4" />
            </motion.button>
          </Link>
        </motion.section>

        {/* ── 푸터 ── */}
        <footer className="flex items-center justify-center pb-8">
          <p className="text-[11px]" style={{ color: "var(--text-4)" }}>
            © 2025 Vigilia — 달빛 아래 루틴을 지키는 곳
          </p>
        </footer>

      </div>
    </div>
  );
}
