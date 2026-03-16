"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError("이메일 또는 비밀번호가 올바르지 않아요.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else {
        setMessage("확인 이메일을 보냈어요! 메일함을 확인해주세요.");
      }
    }
    setLoading(false);
  };

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
        className="relative w-full max-w-sm"
      >
        {/* 뒤로가기 */}
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
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full"
                style={{
                  background: "radial-gradient(circle at 35% 30%, rgba(200,235,255,0.8) 0%, rgba(80,145,230,0.5) 40%, rgba(20,60,160,0.3) 70%, transparent 100%)",
                  border: "1px solid rgba(160,215,255,0.3)",
                  boxShadow: "0 0 30px rgba(43,143,240,0.3)",
                }} />
            </div>
            <h1 className="text-xl font-bold" style={{ color: "var(--text-1)", fontFamily: "var(--font-en)" }}>
              Vigilia
            </h1>
            <p className="text-xs" style={{ color: "var(--text-3)" }}>
              {mode === "login" ? "루틴을 이어가세요" : "새로운 루틴을 시작하세요"}
            </p>
          </div>

          {/* 탭 */}
          <div className="flex p-1 rounded-xl gap-1"
            style={{ background: "rgba(136,192,224,0.04)", border: "1px solid var(--border-2)" }}>
            {(["login", "signup"] as const).map((m) => (
              <button key={m} onClick={() => { setMode(m); setError(""); setMessage(""); }}
                className="flex-1 py-2 rounded-lg text-xs font-medium transition-all duration-200"
                style={{
                  background: mode === m ? "rgba(43,143,240,0.12)" : "transparent",
                  color: mode === m ? "var(--blue)" : "var(--text-3)",
                  border: mode === m ? "1px solid rgba(43,143,240,0.2)" : "1px solid transparent",
                }}>
                {m === "login" ? "로그인" : "회원가입"}
              </button>
            ))}
          </div>

          {/* 폼 */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "var(--text-3)" }} />
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일"
                required
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-transparent"
                style={{
                  border: "1px solid var(--border-1)",
                  color: "var(--text-1)",
                  outline: "none",
                }}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "var(--text-3)" }} />
              <input
                type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호 (6자 이상)"
                required minLength={6}
                className="w-full pl-9 pr-10 py-2.5 rounded-xl text-sm bg-transparent"
                style={{
                  border: "1px solid var(--border-1)",
                  color: "var(--text-1)",
                  outline: "none",
                }}
              />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--text-3)" }}>
                {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>

            {error && (
              <p className="text-xs text-center" style={{ color: "#c87070" }}>{error}</p>
            )}
            {message && (
              <p className="text-xs text-center" style={{ color: "var(--blue)" }}>{message}</p>
            )}

            <motion.button
              type="submit" disabled={loading}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-xl text-sm font-semibold mt-2"
              style={{
                background: loading ? "rgba(43,143,240,0.4)" : "var(--blue)",
                color: "#fff",
                boxShadow: loading ? "none" : "0 0 20px rgba(43,143,240,0.3)",
              }}>
              {loading ? "처리 중..." : mode === "login" ? "로그인" : "가입하기"}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
