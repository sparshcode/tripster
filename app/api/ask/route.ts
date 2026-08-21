import { NextResponse } from "next/server";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are Trip Brain, a concise travel assistant.
Answer using ONLY the trip context the user provides. If the answer requires information not in the context, say so plainly and suggest what booking the user could add.
Prefer short, direct answers. Cite times, places, and booking titles verbatim from the context. Do not invent details.`;

export async function POST(req: Request) {
  const apiKey = req.headers.get("x-anthropic-api-key")?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: "An Anthropic API key is required." },
      { status: 401 }
    );
  }

  let body: { question?: string; tripContext?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const question = body.question?.trim();
  const tripContext = body.tripContext?.trim() ?? "";
  if (!question) {
    return NextResponse.json({ error: "Missing question." }, { status: 400 });
  }

  const model = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-5";

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: 800,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Trip context:\n${tripContext || "(no bookings yet)"}\n\nQuestion: ${question}`,
        },
      ],
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    return NextResponse.json({ error: errorText }, { status: res.status });
  }

  const data = (await res.json()) as {
    content?: { type: string; text?: string }[];
  };
  const text =
    data.content?.find((block) => block.type === "text")?.text?.trim() ?? "";
  return NextResponse.json({ answer: text });
}
