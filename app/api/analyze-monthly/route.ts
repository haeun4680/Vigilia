import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "여기에_API_키_입력") {
    return NextResponse.json({ error: "API_KEY_MISSING" }, { status: 400 });
  }

  const body = await req.json();
  const { habits, avgPct, period, mode, forbidden = [] } = body;

  const habitSummary = habits
    .map((h: any) => `- ${h.icon} ${h.name}: ${period} 동안 ${h.completedDays}/${h.totalDays}일 완료 (${h.pct}%)`)
    .join("\n");

  const forbiddenSummary = forbidden.length > 0
    ? forbidden.map((h: any) =>
        `- ${h.icon} ${h.name}: ${period} 동안 ${h.violatedDays}/${h.totalDays}일 위반 (자제율 ${h.cleanPct}%)`
      ).join("\n")
    : null;

  const forbiddenSection = forbiddenSummary
    ? `\n[금지 목록 현황 - 하면 안 되는 나쁜 습관들]\n${forbiddenSummary}\n`
    : "";

  const forbiddenField = forbiddenSummary
    ? `  "forbidden": "금지 목록(나쁜 습관)에 대한 피드백 (1~2문장, 구체적인 항목 이름 포함, 잘 지켰으면 칭찬)",`
    : `  "forbidden": "",`;

  const contextLine = mode === "year"
    ? `올해 ${period} 루틴 분석입니다.`
    : `${period} 한 달간 루틴 분석입니다.`;

  const prompt = `당신은 친근하고 따뜻한 루틴 코치입니다. ${contextLine} 아래 데이터를 분석해서 사용자에게 인사이트를 제공해주세요.

[루틴 현황]
${habitSummary}

[전체 현황]
- 기간 평균 달성률: ${avgPct}%
${forbiddenSection}
아래 JSON 형식으로만 응답해주세요. 다른 텍스트는 절대 포함하지 마세요:
{
  "strength": "잘하고 있는 점 (1~2문장, 구체적인 루틴 이름 포함)",
  "improve": "개선하면 좋을 점 (1~2문장, 구체적인 루틴 이름 포함)",
  "tip": "앞으로의 실천 팁 (1~2문장, 작고 실천 가능한 조언)",
  ${forbiddenField}
  "score": 루틴 달성률과 금지 목록 자제율을 종합한 점수 (0~100 숫자)
}`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
    const json = JSON.parse(cleaned);
    return NextResponse.json(json);
  } catch (e: any) {
    console.error("Gemini error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
