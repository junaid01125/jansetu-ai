import { NextResponse } from "next/server";

const destinations = ["/", "/report", "/dashboard", "/policymaker", "/profile", "/login"] as const;
type Destination = (typeof destinations)[number];
type ChatMessage = { role: "user" | "assistant"; content: string };

function isDestination(value: unknown): value is Destination {
  return typeof value === "string" && destinations.includes(value as Destination);
}

export async function POST(request: Request) {
  let payload: { messages?: unknown };
  try {
    payload = await request.json() as { messages?: unknown };
  } catch {
    return NextResponse.json({ error: "Send a valid chat message." }, { status: 400 });
  }

  if (!Array.isArray(payload.messages) || payload.messages.length === 0 || payload.messages.length > 12) {
    return NextResponse.json({ error: "Send between 1 and 12 recent messages." }, { status: 400 });
  }

  const messages: ChatMessage[] = [];
  for (const item of payload.messages) {
    if (!item || typeof item !== "object") return NextResponse.json({ error: "Invalid chat message." }, { status: 400 });
    const message = item as { role?: unknown; content?: unknown };
    if ((message.role !== "user" && message.role !== "assistant") || typeof message.content !== "string" || !message.content.trim() || message.content.length > 1000) {
      return NextResponse.json({ error: "Messages must contain up to 1,000 characters of text." }, { status: 400 });
    }
    messages.push({ role: message.role, content: message.content.trim() });
  }

  const latestUserMessage = [...messages].reverse().find((message) => message.role === "user");
  if (!latestUserMessage) return NextResponse.json({ error: "A user message is required." }, { status: 400 });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "The AI assistant is not configured. Add GEMINI_API_KEY to the server environment and restart the app." }, { status: 503 });
  }
  const model = process.env.GEMINI_CHAT_MODEL || "gemini-3.8-flash";

  try {
    let response: Response | undefined;
    for (let attempt = 0; attempt < 4; attempt += 1) {
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: "You are JanSetu AI, a concise, friendly guide to this civic issue reporting website. Explain workflows clearly: citizens can submit text or media reports, review AI category/severity/priority analysis, submit reports, and track their own reports from Profile. The Government dashboard shows reports and a map. The Policymaker page summarizes demand and policy insights. Priority is a triage aid based on severity, people affected, immediate safety/urgency, and repeated local reports; a human should review urgent or uncertain issues. Do not claim you can see a user's account, private report, live status, or perform actions. Never ask for passwords, verification codes, or API keys. Reply in the user's language when clear. Return JSON with an answer and a destination chosen only from /, /report, /dashboard, /policymaker, /profile, /login, or the string none. Choose the most useful destination only when relevant; use none otherwise." }],
          },
          contents: messages.map((message) => ({ role: message.role === "assistant" ? "model" : "user", parts: [{ text: message.content }] })),
          generationConfig: {
            temperature: 0.35,
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                answer: { type: "STRING" },
                destination: { type: "STRING", enum: [...destinations, "none"] },
              },
              required: ["answer", "destination"],
            },
          },
        }),
        cache: "no-store",
        }
      );
      if (response.ok || ![429, 500, 502, 503, 504].includes(response.status) || attempt === 3) break;
      const retryAfter = response.headers.get("retry-after");
      const retryAfterSeconds = retryAfter ? Number(retryAfter) : Number.NaN;
      const retryAfterDate = retryAfter && !Number.isFinite(retryAfterSeconds) ? Date.parse(retryAfter) - Date.now() : 0;
      const retryAfterMs = Number.isFinite(retryAfterSeconds) ? retryAfterSeconds * 1000 : retryAfterDate;
      const delay = retryAfterMs > 0 ? Math.min(retryAfterMs, 3000) : Math.min(500 * 2 ** attempt, 3000);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
    if (!response) throw new Error("Gemini request did not return a response");
    if (!response.ok) {
      console.error("Gemini chat request failed with status:", response.status);
      if (response.status === 429 || response.status >= 500) {
        return NextResponse.json({ error: `Gemini is temporarily unavailable (HTTP ${response.status}). Please try again shortly.` }, { status: 502 });
      }
      return NextResponse.json({ error: `Gemini rejected the request (HTTP ${response.status}). Verify that the API key is active and the model is available to your project.` }, { status: 502 });
    }
    const data = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const result = text ? JSON.parse(text) as { answer?: unknown; destination?: unknown } : null;
    if (!result || typeof result.answer !== "string" || !result.answer.trim()) {
      console.error("Gemini chat response was empty or invalid");
      return NextResponse.json({ error: "Gemini did not return a usable reply. Please try again." }, { status: 502 });
    }
    return NextResponse.json({ answer: result.answer.trim().slice(0, 2000), destination: isDestination(result.destination) ? result.destination : null });
  } catch {
    return NextResponse.json({ error: "Unable to connect to Gemini right now. Check the server connection and try again." }, { status: 502 });
  }
}