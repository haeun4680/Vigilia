"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

function KakaoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#3C1E1E" d="M12 3C6.477 3 2 6.477 2 10.8c0 2.7 1.617 5.076 4.077 6.523L5.1 20.4a.3.3 0 0 0 .432.323l4.05-2.7A11.6 11.6 0 0 0 12 18.6c5.523 0 10-3.477 10-7.8S17.523 3 12 3z"/>
    </svg>
  );
}

function NaverIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#03C75A" d="M16.273 12.845 7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727z"/>
    </svg>
  );
}

export default function LoginPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const supabase = createClient();

  const signInWith = async (provider: "google" | "kakao") => {
    setLoading(provider);
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    setLoading(null);
  };

  const signInWithNaver = async () => {
    setLoading("naver");
    // Naver는 Supabase custom OIDC — 설정 필요 시 활성화
    alert("네이버 로그인은 현재 준비 중이에요.");
    setLoading(null);
  };

  const socialButtons = [
    {
      key: "google" as const,
      label: "Google로 계속하기",
      icon: <GoogleIcon />,
      bg: "#fff",
      color: "#3c4043",
      border: "rgba(0,0,0,0.12)",
      onClick: () => signInWith("google"),
    },
    {
      key: "kakao" as const,
      label: "카카오로 계속하기",
      icon: <KakaoIcon />,
      bg: "#FEE500",
      color: "#3C1E1E",
      border: "transparent",
      onClick: () => signInWith("kakao"),
    },
    {
      key: "naver" as const,
      label: "네이버로 계속하기",
      icon: <NaverIcon />,
      bg: "#03C75A",
      color: "#fff",
      border: "transparent",
      onClick: signInWithNaver,
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--bg)" }}>
      {/* 배경 글로우 */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[15%] w-[500px] h-[500px] rounded-full blur-[140px]"
          style={{ background: "rgba(30,110,220,0.30)" }} />
        <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[400px] rounded-full blur-[160px]"
          style={{ background: "rgba(20,80,200,0.20)" }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-xs"
      >
        <Link href="/">
          <motion.div whileHover={{ x: -3 }}
            className="flex items-center gap-1.5 mb-6 text-xs"
            style={{ color: "var(--text-3)" }}>
            <ArrowLeft className="w-3.5 h-3.5" />
            돌아가기
          </motion.div>
        </Link>

        <div className="dawn-card p-8 space-y-6">
          {/* 헤더 */}
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="w-14 h-14 rounded-full"
                style={{
                  background: `
                    radial-gradient(circle at 32% 28%, rgba(220,240,255,0.9) 0%, rgba(160,210,255,0.7) 15%, transparent 38%),
                    radial-gradient(circle at 50% 50%, rgba(130,190,250,0.85) 0%, rgba(70,135,225,0.6) 40%, rgba(25,70,170,0.35) 70%, transparent 100%)
                  `,
                  border: "1px solid rgba(160,215,255,0.3)",
                  boxShadow: "0 0 30px rgba(43,143,240,0.35), inset 0 1px 0 rgba(200,235,255,0.4)",
                }} />
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: "var(--text-1)", fontFamily: "var(--font-en)" }}>
                Vigilia
              </h1>
              <p className="text-xs mt-1" style={{ color: "var(--text-3)" }}>
                달빛 아래, 루틴을 시작하세요
              </p>
            </div>
          </div>

          {/* 소셜 로그인 버튼 */}
          <div className="space-y-3">
            {socialButtons.map(({ key, label, icon, bg, color, border, onClick }, i) => (
              <motion.button
                key={key}
                onClick={onClick}
                disabled={!!loading}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-opacity"
                style={{
                  background: bg,
                  color,
                  border: `1px solid ${border}`,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  opacity: loading && loading !== key ? 0.5 : 1,
                }}
              >
                <span className="flex-shrink-0">{icon}</span>
                <span className="flex-1 text-center">
                  {loading === key ? "연결 중..." : label}
                </span>
              </motion.button>
            ))}
          </div>

          <p className="text-center text-[11px]" style={{ color: "var(--text-4)" }}>
            로그인 시 서비스 이용약관에 동의하게 됩니다
          </p>
        </div>
      </motion.div>
    </div>
  );
}
