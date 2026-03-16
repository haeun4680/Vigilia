// ── Seeded random (재현 가능한 난수) ─────────────────────────
function seededRand(seed: number) {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return Math.abs(s) / 0x7fffffff; };
}

// ── Week dates (7일) ─────────────────────────────────────────
function getWeekDates() {
  const today = new Date();
  const day = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return {
      date: d.getDate(),
      dayShort: d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(),
      isToday: d.toDateString() === today.toDateString(),
      isPast: d < today && d.toDateString() !== today.toDateString(),
    };
  });
}
export const weekDates = getWeekDates();

// ── Habit types ───────────────────────────────────────────────
export type HabitRow = {
  id: number; icon: string; name: string; goal: string;
  checks: boolean[]; monthly: boolean[];
};

function genMonthly(fillRate: number, seed = 42): boolean[] {
  const rand = seededRand(seed);
  const today = new Date().getDate();
  return Array.from({ length: 30 }, (_, i) =>
    i + 1 < today ? rand() < fillRate : false
  );
}

export const habitRows: HabitRow[] = [
  { id: 1, icon: "🏃", name: "아침 달리기",  goal: "7일", checks: [true,true,true,false,true,true,false],   monthly: genMonthly(0.85, 1) },
  { id: 2, icon: "🧘", name: "명상",          goal: "5일", checks: [true,false,true,true,true,false,false], monthly: genMonthly(0.65, 2) },
  { id: 3, icon: "📚", name: "독서",          goal: "7일", checks: [true,true,false,true,false,true,false], monthly: genMonthly(0.55, 3) },
  { id: 4, icon: "💧", name: "물 마시기",     goal: "7일", checks: [true,true,true,true,true,true,false],   monthly: genMonthly(0.90, 4) },
  { id: 5, icon: "💻", name: "코딩 공부",     goal: "5일", checks: [false,true,true,true,true,false,false], monthly: genMonthly(0.70, 5) },
  { id: 6, icon: "🌙", name: "8시간 수면",    goal: "7일", checks: [true,false,true,false,true,true,false], monthly: genMonthly(0.60, 6) },
];

// ── TopChart: 기간별 데이터 생성 ──────────────────────────────
export type RangeKey = "1M" | "3M" | "6M" | "YTD" | "1Y" | "5Y";

function genDailyData(days: number, seed = 99) {
  const rand = seededRand(seed);
  const today = new Date();
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (days - 1 - i));
    const isPast = i < days - 1;
    const base = 55 + Math.sin(i / 12) * 15;
    return {
      label: days <= 31
        ? `${d.getDate()}일`
        : days <= 92
        ? `${d.getMonth() + 1}/${d.getDate()}`
        : d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      value: isPast ? Math.min(100, Math.max(20, Math.round(base + rand() * 25))) : null,
      date: d.getTime(),
    };
  });
}

function genWeeklyData(weeks: number, seed = 77) {
  const rand = seededRand(seed);
  const today = new Date();
  return Array.from({ length: weeks }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (weeks - 1 - i) * 7);
    const base = 60 + Math.sin(i / 5) * 18;
    return {
      label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      value: i < weeks - 1 ? Math.min(100, Math.max(25, Math.round(base + rand() * 20))) : null,
      date: d.getTime(),
    };
  });
}

const yearStart = new Date(new Date().getFullYear(), 0, 1);
const ytdDays = Math.floor((Date.now() - yearStart.getTime()) / 86400000);

export const chartDataMap: Record<RangeKey, { label: string; value: number | null; date: number }[]> = {
  "1M":  genDailyData(30, 11),
  "3M":  genDailyData(90, 22),
  "6M":  genWeeklyData(26, 33),
  "YTD": genDailyData(Math.max(ytdDays, 7), 44),
  "1Y":  genWeeklyData(52, 55),
  "5Y":  genWeeklyData(260, 66),
};

export const RANGE_OPTIONS: RangeKey[] = ["1M", "3M", "6M", "YTD", "1Y", "5Y"];

// ── MiddleOverview: 주차별 요일별 상세 ───────────────────────
const DAY_LABELS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const today = new Date();
const todayNum = today.getDate();

export const weeklyDetailData = Array.from({ length: 5 }, (_, wk) => {
  const rand = seededRand(wk * 100 + 7);
  return {
    week: `W${wk + 1}`,
    days: Array.from({ length: 7 }, (_, d) => {
      const dayNum = wk * 7 + d + 1;
      const isPast = dayNum < todayNum;
      const isToday = dayNum === todayNum;
      const base = 45 + Math.sin(d / 2) * 20;
      return {
        day: DAY_LABELS[d],
        date: dayNum,
        value: isPast ? Math.min(100, Math.max(10, Math.round(base + rand() * 35))) : isToday ? Math.round(base * 0.6) : null,
        isToday,
        isFuture: dayNum > todayNum,
      };
    }),
  };
});

// ── dailyAchievement (TopChart 1M 기본값) ────────────────────
export const dailyAchievement = chartDataMap["1M"];

// ── weeklyProgress (기존 호환) ───────────────────────────────
export const weeklyProgress = weeklyDetailData.map((w) => ({
  week: w.week,
  value: Math.round(w.days.filter((d) => d.value !== null).reduce((s, d) => s + (d.value ?? 0), 0) / Math.max(w.days.filter((d) => d.value !== null).length, 1)),
  completed: w.days.filter((d) => (d.value ?? 0) >= 70).length,
  total: w.days.filter((d) => d.value !== null).length,
}));

// ── RightSidebar ──────────────────────────────────────────────
export const overallStats = {
  totalDays: todayNum - 1,
  completionRate: 74,
  longestStreak: 9,
  currentStreak: 7,
  bestHabit: "Hydration",
  pieData: [
    { name: "Completed", value: 74, color: "#00FF00" },
    { name: "Missed",    value: 26, color: "#111111" },
  ],
};

// ── Chat ──────────────────────────────────────────────────────
export const initialMessages = [
  { id: 1, role: "assistant" as const, content: "안녕하세요! 오늘의 활동을 기록해드릴게요 🌟", time: "09:00" },
  { id: 2, role: "user"      as const, content: "나 방금 달리기 30분 했어!", time: "09:03" },
  { id: 3, role: "assistant" as const, content: "정말 대단해요! 🏃 Morning Run 100% 달성! 이번 주 4/5 완료 — 꾸준하시네요 💪", time: "09:03" },
];
export const aiSuggestions = ["달리기 30분 완료 ✓", "물 한 잔 마셨어", "명상 10분 했어", "책 읽었어"];
export const statsData = { today: 72, week: 58, month: 81 };
export const weeklyData = [
  { day: "Mon", value: 85 }, { day: "Tue", value: 62 },
  { day: "Wed", value: 90 }, { day: "Thu", value: 45 },
  { day: "Fri", value: 78 }, { day: "Sat", value: 55 },
  { day: "Sun", value: 72 },
];
