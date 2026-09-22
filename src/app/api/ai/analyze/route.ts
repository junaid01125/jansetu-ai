import { NextResponse } from "next/server";
import { simulateAIAnalysis } from "@/lib/services/aiMock";
import type { AIAnalysis, Report } from "@/lib/types";

const fallbackAnalysis = async (reportText: string, mediaType: string, existingReports: Report[]) =>
  simulateAIAnalysis(reportText, mediaType, existingReports);

function parseAnalysis(value: unknown): AIAnalysis | null {
  if (!value || typeof value !== "object") return null;
  const analysis = value as Partial<AIAnalysis>;
  const severity = analysis.severity;
  if (
    typeof analysis.issueCategory !== "string" ||
    typeof analysis.issueSubcategory !== "string" ||
    (severity !== "Low" && severity !== "Medium" && severity !== "High" && severity !== "Critical") ||
    typeof analysis.confidence !== "number" ||
    typeof analysis.assignedDepartmentId !== "string" ||
    typeof analysis.priorityScore !== "number" ||
    typeof analysis.affectedPopulation !== "number" ||
    typeof analysis.reasoning !== "string" ||
    !Array.isArray(analysis.priorityFactors)
  ) return null;

  return {
    issueCategory: analysis.issueCategory,
    issueSubcategory: analysis.issueSubcategory,
    severity,
    confidence: Math.max(0, Math.min(1, analysis.confidence)),
    assignedDepartmentId: analysis.assignedDepartmentId,
    priorityScore: Math.max(0, Math.min(100, Math.round(analysis.priorityScore))),
    affectedPopulation: Math.max(0, Math.round(analysis.affectedPopulation)),
    reasoning: analysis.reasoning,
    priorityFactors: analysis.priorityFactors.filter((factor): factor is { factor: string; score: number; max: number } =>
      !!factor && typeof factor === "object" && typeof factor.factor === "string" && typeof factor.score === "number" && typeof factor.max === "number"
    ),
  };
}

export async function POST(request: Request) {
  let body: { reportText?: string; mediaType?: string; existingReports?: Report[] } = {};
  try {
    body = await request.json() as { reportText?: string; mediaType?: string; existingReports?: Report[] };
    const reportText = typeof body.reportText === "string" ? body.reportText.trim() : "";
    const mediaType = typeof body.mediaType === "string" ? body.mediaType : "text";
    const existingReports = Array.isArray(body.existingReports) ? body.existingReports : [];
    if (!reportText) return NextResponse.json({ error: "A report description is required." }, { status: 400 });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ analysis: await fallbackAnalysis(reportText, mediaType, existingReports), provider: "fallback" });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: "You classify civic issue reports for Hyderabad municipal services. Return only valid JSON matching the requested schema." }] },
          contents: [{ parts: [{ text: `Analyze this civic report: ${reportText}\nMedia type: ${mediaType}\nSimilar reports: ${existingReports.slice(0, 20).map((report) => report.aiAnalysis?.issueCategory).filter(Boolean).join(", ") || "none"}` }] }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                issueCategory: { type: "STRING" }, issueSubcategory: { type: "STRING" }, severity: { type: "STRING", enum: ["Low", "Medium", "High", "Critical"] }, confidence: { type: "NUMBER" }, assignedDepartmentId: { type: "STRING" }, priorityScore: { type: "INTEGER" }, affectedPopulation: { type: "INTEGER" }, reasoning: { type: "STRING" }, priorityFactors: { type: "ARRAY", items: { type: "OBJECT", properties: { factor: { type: "STRING" }, score: { type: "NUMBER" }, max: { type: "NUMBER" } }, required: ["factor", "score", "max"] } },
              },
              required: ["issueCategory", "issueSubcategory", "severity", "confidence", "assignedDepartmentId", "priorityScore", "affectedPopulation", "reasoning", "priorityFactors"],
            },
          },
        }),
        cache: "no-store",
      }
    );
    if (!response.ok) throw new Error("Gemini request failed");
    const data = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const analysis = text ? parseAnalysis(JSON.parse(text)) : null;
    if (!analysis) throw new Error("Gemini returned an invalid analysis");
    return NextResponse.json({ analysis, provider: "gemini" });
  } catch {
    return NextResponse.json({ analysis: await fallbackAnalysis(body.reportText || "General issue reported", body.mediaType || "text", Array.isArray(body.existingReports) ? body.existingReports : []), provider: "fallback" });
  }
}