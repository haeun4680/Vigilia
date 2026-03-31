"use client";

import { useMemo, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flag, ChevronLeft, ChevronRight, Pencil } from "lucide-react";
import { useHabits, toLocalDateStr } from "@/lib/habit-context";
import { useCoins } from "@/lib/coin-context";

type WeekData = {
  weekNum: number;
  startStr: string;
  endStr: string;
  label: string;       // "3월 1일 – 3월 7일"
  pct: number;
  done: number;
  total: number;
  isCurrentWeek: boolean;
  isFuture: boolean;
};

function buildWeeks(startDate: string, habits: { id: string }[], checks: { habit_id: string; checked_date: string }[]): WeekData[] {
  const todayStr = toLocalDateStr(new Date());
  const start = new Date(startDate + "T00:00:00");
  const weeks: WeekData[] = [];
  let cursor = new Date(start);
  let weekNum = 1;

  while (toLocalDateStr(cursor) <= todayStr) {
    const weekEndDate = new Date(cursor);
    weekEndDate.setDate(cursor.getDate() + 6);

    const startStr = toLocalDateStr(cursor);
    const rawEndStr = toLocalDateStr(weekEndDate);
    const endStr = rawEndStr > todayStr ? todayStr : rawEndStr;
    const isFuture = startStr > todayStr;

    // 날짜 범위 라벨
    const s = new Date(startStr + "T00:00:00");
    const e = new Date(endStr + "T00:00:00");
    const fmt = (d: Date) =>
      `${d.getMonth() + 1}월 ${d.getDate()}일`;
    const label = startStr === endStr ? fmt(s) : `${fmt(s)} – ${fmt(e)}`;

    // 이 주 완료 계산
    const dayCount = Math.round((e.getTime() - s.getTime()) / 86400000) + 1;
    const done = checks.filter(c => c.checked_date >= startStr && c.checked_date <= endStr).length;
    const total = habits.length * dayCount;
    const pct = total === 0 ? 0 : Math.round((done / total) * 100);

    // 현재 주 여부
    const isCurrentWeek = startStr <= todayStr && rawEndStr >= todayStr;

    weeks.push({ weekNum, startStr, endStr, label, pct, done, total, isCurrentWeek, isFuture });

    cursor = new Date(weekEndDate);
    cursor.setDate(weekEndDate.getDate() + 1);
    weekNum++;
  }

  return weeks;
}

function pctColor(pct: number) {
  if (pct >= 80) return "var(--blue)";
  if (pct >= 50) return "var(--amber)";
  return "#c87070";
}

function WeekCard({ week, onClick, selected }: { week: WeekData; onClick: () => void; selected: boolean }) {
  const color = pctColor(week.pct);
  const circ = 2 * Math.PI * 18;
  const offset = circ * (1 - week.pct / 100);

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className="flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-xl transition-all"
      style={{
        width: 100,
        background: selected
          ? "rgba(136,192,224,0.1)"
          : week.isCurrentWeek
          ? "rgba(136,192,224,0.06)"
          : "rgba(136,192,224,0.02)",
        border: selected
          ? "1px solid rgba(136,192,224,0.4)"
          : week.isCurrentWeek
          ? "1px solid rgba(136,192,224,0.2)"
          : "1px solid var(--border-2)",
        boxShadow: selected ? "0 0 16px rgba(136,192,224,0.1)" : "none",
      }}
    >
      {/* 주차 뱃지 */}
      <div className="flex items-center gap-1">
        <span className="text-[11px] font-bold tabular-nums"
          style={{ color: week.isCurrentWeek ? "var(--blue)" : "var(--text-2)", fontFamily: "var(--font-en)" }}>
          {week.weekNum}주차
        </span>
        {week.isCurrentWeek && (
          <span className="text-[9px] px-1 py-0.5 rounded-full font-medium"
            style={{ background: "rgba(136,192,224,0.15)", color: "var(--blue)" }}>NOW</span>
        )}
      </div>

      {/* 링 프로그레스 */}
      <div className="relative" style={{ width: 44, height: 44 }}>
        <svg width={44} height={44}>
          <circle cx={22} cy={22} r={18} fill="none" stroke="rgba(136,192,224,0.06)" strokeWidth={3} />
          <motion.circle
            cx={22} cy={22} r={18} fill="none"
            stroke={week.pct === 0 ? "rgba(136,192,224,0.06)" : color}
            strokeWidth={3} strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            transform="rotate(-90 22 22)"
            style={week.pct > 0 ? { filter: `drop-shadow(0 0 3px ${color}55)` } : undefined}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[11px] font-bold tabular-nums"
            style={{ color: week.pct === 0 ? "var(--text-4)" : color, fontFamily: "var(--font-en)" }}>
            {week.pct}%
          </span>
        </div>
      </div>

      {/* 날짜 */}
      <span className="text-[9px] text-center leading-tight" style={{ color: "var(--text-4)" }}>
        {week.label}
      </span>
    </motion.button>
  );
}

export function JourneyView() {
  const { habits, checks } = useHabits();
  const { journeyStartDate, saveJourneyStartDate, loading } = useCoins();
  const [editing, setEditing] = useState(false);
  const [inputDate, setInputDate] = useState("");
  const [selectedWeek, setSelectedWeek] = useState<WeekData | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const weeks = useMemo(() => {
    if (!journeyStartDate) return [];
    return buildWeeks(journeyStartDate, habits, checks);
  }, [journeyStartDate, habits, checks]);

  // 처음 로드 시 현재 주 자동 선택
  useMemo(() => {
    if (weeks.length > 0 && !selectedWeek) {
      const cur = weeks.find(w => w.isCurrentWeek) ?? weeks[weeks.length - 1];
      setSelectedWeek(cur);
    }
  }, [weeks]);

  const handleSave = async () => {
    if (!inputDate) return;
    await saveJourneyStartDate(inputDate);
    setEditing(false);
    setSelectedWeek(null);
  };

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "left" ? -220 : 220, behavior: "smooth" });
  };

  const totalWeeks = weeks.length;
  const bestWeek = weeks.reduce((b, w) => w.pct > b.pct ? w : b, weeks[0] ?? { pct: 0, weekNum: 0 });
  const avgPct = totalWeeks === 0 ? 0 : Math.round(weeks.reduce((s, w) => s + w.pct, 0) / totalWeeks);

  if (loading) return null;

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flag className="w-4 h-4" style={{ color: "var(--blue)" }} />
          <span className="text-sm font-semibold" style={{ color: "var(--text-1)" }}>나의 루틴 여정</span>
          {journeyStartDate && (
            <span className="text-[10px] px-2 py-0.5 rounded-full"
              style={{ background: "rgba(136,192,224,0.06)", color: "var(--text-4)", border: "1px solid var(--border-2)" }}>
              {journeyStartDate} 시작
            </span>
          )}
        </div>
        <motion.button
          onClick={() => { setEditing(e => !e); setInputDate(journeyStartDate ?? ""); }}
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs"
          style={{ background: "rgba(136,192,224,0.06)", border: "1px solid var(--border-2)", color: "var(--text-3)" }}
        >
          <Pencil className="w-3 h-3" />
          {journeyStartDate ? "시작일 변경" : "시작일 설정"}
        </motion.button>
      </div>

      {/* 날짜 설정 인풋 */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2 p-3 rounded-xl"
              style={{ background: "rgba(136,192,224,0.04)", border: "1px solid var(--border-2)" }}>
              <input
                type="date"
                value={inputDate}
                onChange={e => setInputDate(e.target.value)}
                max={toLocalDateStr(new Date())}
                className="flex-1 bg-transparent text-xs outline-none"
                style={{ color: "var(--text-1)", colorScheme: "dark" }}
              />
              <motion.button
                onClick={handleSave}
                disabled={!inputDate}
                whileTap={{ scale: 0.95 }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                style={{
                  background: inputDate ? "rgba(136,192,224,0.15)" : "rgba(136,192,224,0.04)",
                  border: "1px solid rgba(136,192,224,0.3)",
                  color: inputDate ? "var(--blue)" : "var(--text-4)",
                }}
              >
                저장
              </motion.button>
              <motion.button
                onClick={() => setEditing(false)}
                whileTap={{ scale: 0.95 }}
                className="px-2.5 py-1.5 rounded-lg text-xs"
                style={{ border: "1px solid var(--border-2)", color: "var(--text-4)" }}
              >
                취소
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 시작일 미설정 */}
      {!journeyStartDate && !editing && (
        <div className="py-8 flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: "rgba(136,192,224,0.06)", border: "1px solid var(--border-2)" }}>
            <Flag className="w-5 h-5" style={{ color: "var(--text-4)" }} />
          </div>
          <p className="text-xs text-center" style={{ color: "var(--text-3)" }}>
            시작일을 설정하면 주차별 성과를 볼 수 있어요
          </p>
          <motion.button
            onClick={() => setEditing(true)}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="px-4 py-2 rounded-xl text-xs font-semibold"
            style={{ background: "rgba(136,192,224,0.1)", border: "1px solid rgba(136,192,224,0.25)", color: "var(--blue)" }}
          >
            🗓 시작일 설정하기
          </motion.button>
        </div>
      )}

      {/* 여정 콘텐츠 */}
      {journeyStartDate && weeks.length > 0 && (
        <div className="space-y-4">
          {/* 전체 요약 스탯 */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "총 진행", value: `${totalWeeks}주`, sub: `${totalWeeks * 7}일` },
              { label: "전체 평균", value: `${avgPct}%`, sub: "달성률" },
              { label: "최고 주차", value: bestWeek.weekNum > 0 ? `${bestWeek.weekNum}주차` : "—", sub: bestWeek.weekNum > 0 ? `${bestWeek.pct}%` : "" },
            ].map(s => (
              <div key={s.label} className="p-2.5 rounded-xl text-center"
                style={{ background: "rgba(136,192,224,0.04)", border: "1px solid var(--border-2)" }}>
                <p className="text-[10px] mb-1" style={{ color: "var(--text-4)" }}>{s.label}</p>
                <p className="text-sm font-bold" style={{ color: "var(--text-1)", fontFamily: "var(--font-en)" }}>{s.value}</p>
                <p className="text-[10px]" style={{ color: "var(--text-4)" }}>{s.sub}</p>
              </div>
            ))}
          </div>

          {/* 주차 카드 스크롤 */}
          <div className="relative">
            {weeks.length > 4 && (
              <>
                <button onClick={() => scroll("left")}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: "var(--bg)", border: "1px solid var(--border-2)" }}>
                  <ChevronLeft className="w-3.5 h-3.5" style={{ color: "var(--text-3)" }} />
                </button>
                <button onClick={() => scroll("right")}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: "var(--bg)", border: "1px solid var(--border-2)" }}>
                  <ChevronRight className="w-3.5 h-3.5" style={{ color: "var(--text-3)" }} />
                </button>
              </>
            )}
            <div
              ref={scrollRef}
              className="flex gap-2 overflow-x-auto pb-1"
              style={{ scrollbarWidth: "none", paddingLeft: weeks.length > 4 ? 20 : 0, paddingRight: weeks.length > 4 ? 20 : 0 }}
            >
              {weeks.map(w => (
                <WeekCard
                  key={w.weekNum}
                  week={w}
                  selected={selectedWeek?.weekNum === w.weekNum}
                  onClick={() => setSelectedWeek(prev => prev?.weekNum === w.weekNum ? null : w)}
                />
              ))}
            </div>
          </div>

          {/* 선택된 주차 상세 */}
          <AnimatePresence mode="wait">
            {selectedWeek && (
              <motion.div
                key={selectedWeek.weekNum}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="p-4 rounded-xl space-y-3"
                style={{ background: "rgba(136,192,224,0.03)", border: "1px solid var(--border-2)" }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold" style={{ color: "var(--text-1)" }}>
                      {selectedWeek.weekNum}주차
                    </span>
                    {selectedWeek.isCurrentWeek && (
                      <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full"
                        style={{ background: "rgba(136,192,224,0.1)", color: "var(--blue)" }}>진행 중</span>
                    )}
                  </div>
                  <span className="text-xs" style={{ color: "var(--text-4)" }}>{selectedWeek.label}</span>
                </div>

                {/* 달성률 바 */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px]" style={{ color: "var(--text-3)" }}>달성률</span>
                    <span className="text-sm font-bold tabular-nums"
                      style={{ color: pctColor(selectedWeek.pct), fontFamily: "var(--font-en)" }}>
                      {selectedWeek.pct}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(136,192,224,0.06)" }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: pctColor(selectedWeek.pct) }}
                      initial={{ width: 0 }}
                      animate={{ width: `${selectedWeek.pct}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                  </div>
                </div>

                {/* 수치 */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {[
                    { label: "완료 체크", value: String(selectedWeek.done) },
                    { label: "전체 가능", value: String(selectedWeek.total) },
                    { label: "이전 주 대비", value: (() => {
                      const prev = weeks.find(w => w.weekNum === selectedWeek.weekNum - 1);
                      if (!prev) return "—";
                      const diff = selectedWeek.pct - prev.pct;
                      return diff >= 0 ? `+${diff}%` : `${diff}%`;
                    })() },
                  ].map(s => (
                    <div key={s.label} className="text-center p-2 rounded-lg"
                      style={{ background: "rgba(136,192,224,0.03)", border: "1px solid var(--border-2)" }}>
                      <p className="text-[10px] mb-0.5" style={{ color: "var(--text-4)" }}>{s.label}</p>
                      <p className="text-sm font-bold" style={{ color: "var(--text-1)", fontFamily: "var(--font-en)" }}>{s.value}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
