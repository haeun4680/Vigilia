"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Bot } from "lucide-react";
import { initialMessages, aiSuggestions } from "@/lib/mock-data";

type Message = {
  id: number;
  role: "assistant" | "user";
  content: string;
  time: string;
};

const mockAIResponses = [
  "훌륭해요! 기록 완료했습니다 ✨ 오늘의 목표에 한 발 더 가까워졌어요!",
  "잘 하셨어요! 꾸준함이 최고의 전략이에요. 이번 주 달성률이 올라가고 있어요 📈",
  "완벽해요! 작은 습관들이 모여 큰 변화를 만들어요. 오늘도 잘 하고 계세요 💪",
  "기록했습니다! 이 페이스라면 이번 달 목표 달성이 눈앞이에요 🎯",
];

function getTime() {
  return new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
}

export function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async (text?: string) => {
    const content = text || input.trim();
    if (!content) return;

    const userMsg: Message = {
      id: Date.now(),
      role: "user",
      content,
      time: getTime(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    await new Promise((r) => setTimeout(r, 1200));

    const aiMsg: Message = {
      id: Date.now() + 1,
      role: "assistant",
      content: mockAIResponses[Math.floor(Math.random() * mockAIResponses.length)],
      time: getTime(),
    };

    setIsTyping(false);
    setMessages((prev) => [...prev, aiMsg]);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white">AI Coach</h2>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-xs text-muted-foreground">Active now</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500/30 to-indigo-500/30 border border-purple-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-3.5 h-3.5 text-purple-400" />
                </div>
              )}
              <div className={`max-w-[78%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
                <div
                  className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-tr-sm"
                      : "bg-white/5 text-foreground/90 rounded-tl-sm"
                  }`}
                >
                  {msg.content}
                </div>
                <span className="text-[10px] text-muted-foreground px-1">{msg.time}</span>
              </div>
            </motion.div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex gap-3"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500/30 to-indigo-500/30 border border-purple-500/20 flex items-center justify-center">
                <Bot className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <div className="bg-white/5 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 bg-purple-400 rounded-full"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Quick suggestions */}
      <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
        {aiSuggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => sendMessage(s)}
            className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground border border-white/8 transition-all duration-200"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input area */}
      <div className="px-4 pb-4 pt-2">
        <div className="flex items-center gap-2 bg-white/5 rounded-2xl px-4 py-2 border border-white/8 focus-within:border-purple-500/40 focus-within:bg-white/8 transition-all duration-200">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="오늘의 활동을 기록해보세요..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim()}
            className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all duration-150"
          >
            <Send className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
