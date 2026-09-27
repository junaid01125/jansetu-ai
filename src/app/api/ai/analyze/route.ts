import { NextResponse } from "next/server";
import { simulateAIAnalysis } from "@/lib/services/aiMock";
import type { AIAnalysis, Report } from "@/lib/types";

const priorityRubric = [
  { factor: "Severity", max: 40 },
  { factor: "People affected", max: 25 },
  { factor: "Immediate safety/urgency", max: 20 },
  { factor: "Repeated local reports", max: 15 },
] as const;

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
    typeof analysis.affectedPopulation !== "number" ||
    typeof analysis.reasoning !== "string" ||
    !Array.isArray(analysis.priorityFactors)
  ) return null;

  const factors = priorityRubric.map((rubricFactor) => {
    const factor = analysis.priorityFactors?.find((candidate) =>
      !!candidate && typeof candidate === "object" && candidate.factor === rubricFactor.factor
    );
    if (!factor || typeof factor.score !== "number" || !Number.isFinite(factor.score)) return null;
    return { factor: rubricFactor.factor, score: Math.max(0, Math.min(rubricFactor.max, Math.round(factor.score))), max: rubricFactor.max };
  });
  if (factors.some((factor) => factor === null)) return null;
  const priorityFactors = factors.filter((factor): factor is NonNullable<typeof factor> => factor !== null);

  return {
    issueCategory: analysis.issueCategory,
    issueSubcategory: analysis.issueSubcategory,
    severity,
    confidence: Math.max(0, Math.min(1, analysis.confidence)),
    assignedDepartmentId: analysis.assignedDepartmentId,
    priorityScore: priorityFactors.reduce((total, factor) => total + factor.score, 0),
    affectedPopulation: Math.max(0, Math.round(analysis.affectedPopulation)),
    reasoning: analysis.reasoning,
    priorityFactors,
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
          system_instruction: { parts: [{ text: "You classify civic issue reports for Hyderabad municipal services. Return only valid JSON matching the requested schema. Score each priority factor using the rubric: Severity (0-40), People affected (0-25), Immediate safety/urgency (0-20), Repeated local reports (0-15). Use exactly these factor names and max values. Assess People affected from the report; assess urgency from explicit immediate danger or time sensitivity; assess repeated reports only from the provided similar reports. The priority score is the sum of the four factor scores, so do not invent a separate total." }] },
          contents: [{ parts: [{ text: `Analyze this civic report: ${reportText}\nMedia type: ${mediaType}\nSimilar reports: ${existingReports.slice(0, 20).map((report) => report.aiAnalysis?.issueCategory).filter(Boolean).join(", ") || "none"}` }] }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                issueCategory: { type: "STRING" }, issueSubcategory: { type: "STRING" }, severity: { type: "STRING", enum: ["Low", "Medium", "High", "Critical"] }, confidence: { type: "NUMBER" }, assignedDepartmentId: { type: "STRING" }, affectedPopulation: { type: "INTEGER" }, reasoning: { type: "STRING" }, priorityFactors: { type: "ARRAY", items: { type: "OBJECT", properties: { factor: { type: "STRING" }, score: { type: "NUMBER" }, max: { type: "NUMBER" } }, required: ["factor", "score", "max"] } },
              },
              required: ["issueCategory", "issueSubcategory", "severity", "confidence", "assignedDepartmentId", "affectedPopulation", "reasoning", "priorityFactors"],
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