import { NextResponse } from "next/server";
import { EXTRACTION_SYSTEM_PROMPT } from "@/lib/extraction-prompt";

export const runtime = "nodejs";

type IncomingImage = { mediaType: string; base64: string };
type IncomingPdf = { base64: string };

export async function POST(req: Request) {
  const apiKey = req.headers.get("x-anthropic-api-key")?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: "An Anthropic API key is required." },
      { status: 401 }
    );
  }

  let body: { text?: string; images?: IncomingImage[]; pdf?: IncomingPdf };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { text, images, pdf } = body;
  if (!text && !images?.length && !pdf) {
    return NextResponse.json(
      { error: "Provide text, images, or a PDF." },
      { status: 400 }
    );
  }

  const content: unknown[] = [];
  if (pdf?.base64) {
    content.push({
      type: "document",
      source: { type: "base64", media_type: "application/pdf", data: pdf.base64 },
    });
  }
  if (images?.length) {
    for (const img of images) {
      content.push({
        type: "image",
        source: { type: "base64", media_type: img.mediaType, data: img.base64 },
      });
    }
  }
  if (text) {
    content.push({ type: "text", text });
  }
  content.push({
    type: "text",
    text: "Extract every booking you can find. Reply with JSON only.",
  });

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
      max_tokens: 2048,
      system: EXTRACTION_SYSTEM_PROMPT,
      messages: [{ role: "user", content }],
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    return NextResponse.json({ error: errorText }, { status: res.status });
  }

  const data = (await res.json()) as {
    content?: { type: string; text?: string }[];
  };
  const raw =
    data.content?.find((block) => block.type === "text")?.text?.trim() ?? "";
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return NextResponse.json(
      { error: "Model did not return JSON.", raw },
      { status: 502 }
    );
  }
  try {
    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json(
      { error: "Failed to parse model JSON.", raw },
      { status: 502 }
    );
  }
}
