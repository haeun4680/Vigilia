import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "여기에_API_키_입력") {
    return NextResponse.json({ error: "API_KEY_MISSING" }, { status: 400 });
  }

  const body = await req.json();
  const { habits, weeklyStats, monthlyRate, streak } = body;

  const habitSummary = habits
    .map((h: any) => {
      const weekDone = h.checks.filter(Boolean).length;
      const monthDone = h.monthly.filter(Boolean).length;
      const monthRate = Math.round((monthDone / Math.max(body.totalDays, 1)) * 100);
      return `- ${h.icon} ${h.name}: 이번 주 ${weekDone}/7일 완료, 이번 달 달성률 ${monthRate}%`;
    })
    .join("\n");

  const prompt = `당신은 친근하고 따뜻한 루틴 코치입니다. 아래 데이터를 분석해서 사용자에게 인사이트를 제공해주세요.

[이번 주 루틴 현황]
${habitSummary}

[전체 현황]
- 이번 달 전체 달성률: ${monthlyRate}%
- 현재 연속 달성 중: ${streak}일
- 이번 주 평균 달성률: ${weeklyStats}%

아래 JSON 형식으로만 응답해주세요. 다른 텍스트는 절대 포함하지 마세요:
{
  "strength": "잘하고 있는 점 (1~2문장, 구체적인 루틴 이름 포함)",
  "improve": "개선하면 좋을 점 (1~2문장, 구체적인 루틴 이름 포함)",
  "tip": "이번 주 실천 팁 (1~2문장, 작고 실천 가능한 조언)",
  "score": 전체적인 루틴 점수 (0~100 숫자)
}`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // JSON 파싱 — 마크다운 코드블록 제거
    const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
    const json = JSON.parse(cleaned);

    return NextResponse.json(json);
  } catch (e: any) {
    console.error("Gemini error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
