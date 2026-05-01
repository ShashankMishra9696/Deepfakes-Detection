import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  if (!messages || !Array.isArray(messages)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ reply: "API key not configured." });
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `You are a concise assistant for a Deepfake Detector web app.

RULES:
- Max 3 points per answer
- Each point on its own line using a line break
- No markdown: no **, no *, no #
- No bullet symbols or dashes
- Numbered points only: 1. 2. 3.
- One sentence per point, plain English
- No intro phrases like "Sure!" or "Great question!"
- No filler words or closing remarks
- Off-topic questions: reply exactly "I only help with deepfake-related questions."

EXAMPLE OUTPUT:
1. Upload your image using the Detect page.
2. AI scans it for manipulation patterns.
3. You get a real or fake result instantly.

Always follow this exact format. Never deviate.`,
          },
          ...messages.slice(-10).map((m: { role: string; content: string }) => ({
            role: m.role === "assistant" ? "assistant" : "user",
            content: m.content,
          })),
        ],
        max_tokens: 120,
        temperature: 0.3,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Groq API error:", JSON.stringify(data, null, 2));
      return NextResponse.json({ reply: `Error: ${data?.error?.message || "Unknown error"}` });
    }

    const reply = data.choices?.[0]?.message?.content || "I couldn't generate a response.";
    return NextResponse.json({ reply });

  } catch (error) {
    console.error("Fetch error:", error);
    return NextResponse.json({ reply: "Network error. Please try again." });
  }
}