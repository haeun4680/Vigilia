import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "여기에_API_키_입력") {
    return NextResponse.json({ error: "API_KEY_MISSING" }, { status: 400 });
  }

  const body = await req.json();
  const { habits, weeklyStats, forbidden = [] } = body;

  const habitSummary = habits
    .map((h: any) => {
      const weekDone = h.checks.filter(Boolean).length;
      return `- ${h.icon} ${h.name}: 이번 주 ${weekDone}/7일 완료`;
    })
    .join("\n");

  const forbiddenSummary = forbidden.length > 0
    ? forbidden.map((h: any) =>
        `- ${h.icon} ${h.name}: 이번 주 ${h.violatedDays}/7일 위반`
      ).join("\n")
    : null;

  const forbiddenSection = forbiddenSummary
    ? `\n[금지 목록 현황 - 하면 안 되는 나쁜 습관들]\n${forbiddenSummary}\n- 전체 자제율: ${Math.round(((forbidden.reduce((s: number, h: any) => s + (7 - h.violatedDays), 0)) / (forbidden.length * 7)) * 100)}%\n`
    : "";

  const forbiddenField = forbiddenSummary
    ? `  "forbidden": "금지 목록(나쁜 습관)에 대한 피드백 (1~2문장, 구체적인 항목 이름 포함, 위반이 없으면 칭찬)",`
    : `  "forbidden": "",`;

  const prompt = `당신은 친근하고 따뜻한 루틴 코치입니다. 아래 데이터를 분석해서 사용자에게 인사이트를 제공해주세요.

[이번 주 루틴 현황]
${habitSummary}

[전체 현황]
- 이번 주 평균 달성률: ${weeklyStats}%
${forbiddenSection}
아래 JSON 형식으로만 응답해주세요. 다른 텍스트는 절대 포함하지 마세요:
{
  "strength": "잘하고 있는 점 (1~2문장, 구체적인 루틴 이름 포함)",
  "improve": "개선하면 좋을 점 (1~2문장, 구체적인 루틴 이름 포함)",
  "tip": "이번 주 실천 팁 (1~2문장, 작고 실천 가능한 조언)",
  ${forbiddenField}
  "score": 전체적인 루틴 점수와 금지 목록 자제율을 종합한 점수 (0~100 숫자)
}`;

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

  // 503 대비 최대 2회 재시도
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
      const json = JSON.parse(cleaned);
      return NextResponse.json(json);
    } catch (e: any) {
      const is503 = e.message?.includes("503") || e.message?.includes("Service Unavailable");
      if (is503 && attempt < 2) {
        await new Promise(r => setTimeout(r, 2000)); // 2초 대기 후 재시도
        continue;
      }
      console.error("Gemini error:", e);
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }
}
