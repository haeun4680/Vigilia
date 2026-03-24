"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Flame, Brain, Trophy } from "lucide-react";
import { createClient } from "@/lib/supabase";

const SHOWCASE_ANIMALS = [
  { emoji: "🐣", name: "병아리",      rarity: "COMMON",    color: "rgba(180,180,180,0.9)", days: 7   },
  { emoji: "🐱", name: "고양이",      rarity: "UNCOMMON",  color: "rgba(80,200,120,0.9)",  days: 30  },
  { emoji: "🐺", name: "늑대",        rarity: "RARE",      color: "rgba(43,143,240,0.9)",  days: 90  },
  { emoji: "🦅", name: "독수리",      rarity: "EPIC",      color: "rgba(160,80,240,0.9)",  days: 180 },
  { emoji: "🦄", name: "유니콘",      rarity: "LEGENDARY", color: "rgba(255,200,50,0.9)",  days: 365 },
];

const HOW_IT_WORKS = [
  { step: "01", title: "루틴 설정",     desc: "매일 지키고 싶은 루틴을 등록하세요.",            emoji: "📋" },
  { step: "02", title: "동물 선택",     desc: "도전 기간을 정하고 키울 동물을 선택하세요.",      emoji: "🐾" },
  { step: "03", title: "루틴 달성",     desc: "매일 루틴을 완료하며 도전을 이어가세요.",         emoji: "✅" },
  { step: "04", title: "동물 획득!",    desc: "기간을 채우면 선택한 동물이 도감에 추가돼요.",    emoji: "🎉" },
];

const FEATURES = [
  { icon: Trophy, title: "동물 수집 도감",   desc: "챌린지를 완료할 때마다 새로운 동물을 수집해요. 희귀할수록 오래 걸리지만 그만큼 특별해요.", color: "rgba(255,200,50,0.9)",  bg: "rgba(255,200,50,0.06)",  border: "rgba(255,200,50,0.2)"  },
  { icon: Flame,  title: "연속 달성 챌린지", desc: "7일부터 365일까지, 나만의 페이스로 도전하세요. 꾸준함이 희귀 동물로 보답받아요.",         color: "rgba(43,143,240,0.9)",  bg: "rgba(43,143,240,0.06)",  border: "rgba(43,143,240,0.2)"  },
  { icon: Brain,  title: "AI 루틴 코치",     desc: "Gemini AI가 내 루틴 데이터를 분석하고 더 나은 습관 형성을 위한 조언을 드려요.",           color: "rgba(160,80,240,0.9)",  bg: "rgba(160,80,240,0.06)",  border: "rgba(160,80,240,0.2)"  },
];

export default function Landing() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace("/dashboard");
    });
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: "var(--bg)" }}>

      {/* 배경 앰비언트 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div className="absolute top-[-10%] right-[10%] w-[700px] h-[700px] rounded-full blur-[180px]"
          style={{ background: "rgba(30,110,220,0.30)" }} />
        <div className="absolute bottom-[-10%] left-[10%] w-[600px] h-[500px] rounded-full blur-[160px]"
          style={{ background: "rgba(20,80,200,0.20)" }} />
        <div className="absolute top-[40%] right-[-5%] w-[400px] h-[300px] rounded-full blur-[130px]"
          style={{ background: "rgba(160,80,240,0.12)" }} />
        {[
          { top:"5%",  left:"8%",  dur:"3.2s", delay:"0s"   },
          { top:"12%", left:"45%", dur:"2.8s", delay:"0.8s" },
          { top:"8%",  left:"72%", dur:"4.1s", delay:"1.5s" },
          { top:"20%", left:"88%", dur:"2.5s", delay:"0.3s" },
          { top:"35%", left:"4%",  dur:"3.7s", delay:"2.1s" },
          { top:"60%", left:"94%", dur:"2.9s", delay:"1.0s" },
          { top:"75%", left:"15%", dur:"3.5s", delay:"0.6s" },
          { top:"88%", left:"60%", dur:"4.3s", delay:"1.8s" },
        ].map((s, i) => (
          <div key={i} className="star-twinkle"
            style={{ top: s.top, left: s.left, ["--twinkle-dur" as any]: s.dur, animationDelay: s.delay }} />
        ))}
      </div>

      <div className="relative max-w-[960px] mx-auto px-6 py-10 space-y-28" style={{ zIndex: 1 }}>

        {/* ── Nav ── */}
        <motion.nav
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: "var(--blue)", boxShadow: "0 0 8px var(--blue)" }} />
            <span className="text-base font-semibold tracking-wider" style={{ color: "var(--text-1)", fontFamily: "var(--font-en)" }}>
              Vigilia
            </span>
          </div>
          <Link href="/login">
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
              style={{ background: "rgba(43,143,240,0.1)", border: "1px solid rgba(43,143,240,0.3)", color: "var(--blue)" }}>
              시작하기 <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>
          </Link>
        </motion.nav>

        {/* ── Hero ── */}
        <section className="flex flex-col items-center text-center gap-10 pt-8">

          {/* 동물 쇼케이스 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
            className="flex items-end justify-center gap-3 sm:gap-5"
          >
            {SHOWCASE_ANIMALS.map((a, i) => {
              const sizes = [52, 64, 80, 64, 52];
              const delays = [0.4, 0.25, 0, 0.25, 0.4];
              const floatDelays = [0.4, 0.2, 0, 0.6, 0.8];
              return (
                <motion.div key={a.emoji} className="flex flex-col items-center gap-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: delays[i], duration: 0.6 }}
                >
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 3 + i * 0.3, repeat: Infinity, ease: "easeInOut", delay: floatDelays[i] }}
                    className="flex items-center justify-center rounded-2xl dawn-card"
                    style={{
                      width: sizes[i], height: sizes[i],
                      fontSize: sizes[i] * 0.5,
                      boxShadow: `0 0 20px ${a.color}40, 0 0 40px ${a.color}15`,
                      border: `1px solid ${a.color}30`,
                    }}
                  >
                    {a.emoji}
                  </motion.div>
                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ color: a.color, background: `${a.color}15`, border: `1px solid ${a.color}30` }}>
                    {a.rarity}
                  </span>
                </motion.div>
              );
            })}
          </motion.div>

          {/* 타이틀 */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.7 }}
            className="space-y-4"
          >
            <p className="label-text tracking-[0.3em]">ROUTINE × COMPANION</p>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight"
              style={{ color: "var(--text-1)" }}>
              작은 습관으로<br />
              <span style={{ color: "var(--blue)" }}>특별한 동반자</span>를<br />
              만나보세요
            </h1>
            <p className="text-base font-medium" style={{ color: "var(--text-2)" }}>
              루틴을 지킬수록, 새로운 동반자가 당신 곁에 찾아와요
            </p>
            <p className="text-sm max-w-[420px] mx-auto leading-relaxed" style={{ color: "var(--text-3)" }}>
              7일을 함께하면 병아리, 90일이면 늑대, 365일이면 전설의 유니콘.<br />
              꾸준함이 쌓일수록 더 특별한 동반자가 기다리고 있어요.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.6 }}
          >
            <Link href="/login">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(43,143,240,0.45)" }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-semibold"
                style={{ background: "var(--blue)", color: "#fff", boxShadow: "0 0 20px rgba(43,143,240,0.3)" }}>
                무료로 시작하기 <ArrowRight className="w-4 h-4" />
              </motion.button>
            </Link>
          </motion.div>

          {/* 스탯 */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
            className="flex items-center gap-8 pt-2"
          >
            {[
              { value: "25+", label: "수집 가능한 동물" },
              { value: "5단계", label: "희귀도 등급" },
              { value: "AI", label: "맞춤 루틴 코치" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-xl font-bold tabular-nums" style={{ color: "var(--blue)", fontFamily: "var(--font-en)" }}>{s.value}</p>
                <p className="text-[11px] mt-0.5" style={{ color: "var(--text-3)" }}>{s.label}</p>
              </div>
            ))}
          </motion.div>
        </section>

        {/* ── 이용 방법 ── */}
        <section className="space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }} className="text-center space-y-2"
          >
            <p className="label-text tracking-[0.25em]">HOW IT WORKS</p>
            <h2 className="text-2xl font-bold" style={{ color: "var(--text-1)" }}>4단계로 동반자와 함께하세요</h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }} transition={{ delay: i * 0.1 }}
                className="dawn-card p-5 space-y-3 relative overflow-hidden"
              >
                <div className="absolute top-3 right-4 text-[40px] font-black opacity-[0.04]"
                  style={{ color: "var(--blue)", fontFamily: "var(--font-en)" }}>{step.step}</div>
                <span className="text-3xl">{step.emoji}</span>
                <div>
                  <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-1)" }}>{step.title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--text-3)" }}>{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── 동물 등급 표 ── */}
        <section className="space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }} className="text-center space-y-2"
          >
            <p className="label-text tracking-[0.25em]">COLLECTION</p>
            <h2 className="text-2xl font-bold" style={{ color: "var(--text-1)" }}>꾸준할수록 더 특별한 동반자가 찾아와요</h2>
          </motion.div>

          <div className="space-y-3">
            {SHOWCASE_ANIMALS.map((a, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-30px" }} transition={{ delay: i * 0.08 }}
                className="dawn-card px-5 py-4 flex items-center gap-4"
                style={{ borderColor: `${a.color}20` }}
              >
                <motion.span className="text-3xl"
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 2.5 + i * 0.3, repeat: Infinity, ease: "easeInOut" }}
                  style={{ filter: `drop-shadow(0 0 6px ${a.color})` }}>
                  {a.emoji}
                </motion.span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-bold" style={{ color: "var(--text-1)" }}>{a.name}</span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                      style={{ color: a.color, background: `${a.color}15`, border: `1px solid ${a.color}30` }}>
                      {a.rarity}
                    </span>
                  </div>
                  <p className="text-[11px]" style={{ color: "var(--text-3)" }}>
                    {a.days}일을 함께하면 만날 수 있어요 · 같은 등급에 여러 동반자 수록
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold tabular-nums" style={{ color: a.color, fontFamily: "var(--font-en)" }}>
                    {a.days}일
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── 기능 소개 ── */}
        <section className="space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }} className="text-center space-y-2"
          >
            <p className="label-text tracking-[0.25em]">FEATURES</p>
            <h2 className="text-2xl font-bold" style={{ color: "var(--text-1)" }}>루틴을 지키는 데 필요한 모든 것</h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {FEATURES.map(({ icon: Icon, title, desc, color, bg, border }, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }} transition={{ delay: i * 0.1 }}
                className="dawn-card p-5 space-y-3"
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: bg, border: `1px solid ${border}` }}>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <div>
                  <p className="text-sm font-semibold mb-1.5" style={{ color: "var(--text-1)" }}>{title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--text-3)" }}>{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── 프리미엄 힌트 ── */}
        <motion.section
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.7 }}
          className="dawn-card p-8 flex flex-col sm:flex-row items-center gap-6"
          style={{ borderColor: "rgba(255,200,50,0.2)" }}
        >
          <div className="text-5xl">⚡</div>
          <div className="flex-1 text-center sm:text-left">
            <p className="text-sm font-bold mb-1" style={{ color: "rgba(255,200,50,0.9)" }}>이어달리기 (프리미엄)</p>
            <p className="text-xs leading-relaxed" style={{ color: "var(--text-3)" }}>
              7일 달성 후 초기화 없이 30일로 이어가고 싶다면?<br />
              이어달리기 기능으로 이미 달린 시간을 그대로 연결하세요.
            </p>
          </div>
          <span className="text-[11px] px-3 py-1.5 rounded-full font-bold"
            style={{ background: "rgba(255,200,50,0.1)", color: "rgba(255,200,50,0.8)", border: "1px solid rgba(255,200,50,0.2)" }}>
            Coming Soon
          </span>
        </motion.section>

        {/* ── CTA ── */}
        <motion.section
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.7 }}
          className="dawn-card p-12 flex flex-col items-center text-center gap-6"
        >
          <motion.div className="flex gap-2 text-4xl"
            animate={{ y: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
            🥚🐣🐺🦄
          </motion.div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold" style={{ color: "var(--text-1)" }}>
              첫 번째 동반자를 만나보세요
            </h2>
            <p className="text-sm" style={{ color: "var(--text-3)" }}>
              7일만 함께해도 병아리가 당신 곁에 찾아와요.
            </p>
          </div>
          <Link href="/login">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(43,143,240,0.45)" }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-semibold"
              style={{ background: "var(--blue)", color: "#fff", boxShadow: "0 0 20px rgba(43,143,240,0.3)" }}>
              Vigilia 무료 시작 <ArrowRight className="w-4 h-4" />
            </motion.button>
          </Link>
        </motion.section>

        {/* ── 푸터 ── */}
        <footer className="flex items-center justify-center pb-8">
          <p className="text-[11px]" style={{ color: "var(--text-4)" }}>
            © 2025 Vigilia — 작은 습관으로 특별한 동반자를 만나는 곳
          </p>
        </footer>

      </div>
    </div>
  );
}
