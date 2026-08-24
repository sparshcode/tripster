import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Suggestion = {
  name: string;
  category: "food" | "coffee" | "sight" | "shop" | "other";
  area: string;
  reason: string;
};

const SYSTEM_PROMPT = `You are Tripster, a careful local travel planner.
Suggest three distinct places plausibly near the traveler's hotel or accommodation. Prefer well-known, established places and a useful mix of food, coffee, sights, or shops. Never invent precise distances, opening hours, prices, or availability. Keep each reason under 18 words. Use the return_nearby_suggestions tool.`;

export async function POST(req: Request) {
  const apiKey = req.headers.get("x-anthropic-api-key")?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: "An Anthropic API key is required." },
      { status: 401 }
    );
  }

  let body: { tripContext?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const tripContext = body.tripContext?.trim();
  if (!tripContext) {
    return NextResponse.json({ error: "Missing trip context." }, { status: 400 });
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
      max_tokens: 700,
      system: SYSTEM_PROMPT,
      tools: [
        {
          name: "return_nearby_suggestions",
          description: "Return three nearby place suggestions for the traveler.",
          input_schema: {
            type: "object",
            properties: {
              suggestions: {
                type: "array",
                minItems: 3,
                maxItems: 3,
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    category: {
                      type: "string",
                      enum: ["food", "coffee", "sight", "shop", "other"],
                    },
                    area: { type: "string" },
                    reason: { type: "string" },
                  },
                  required: ["name", "category", "area", "reason"],
                  additionalProperties: false,
                },
              },
            },
            required: ["suggestions"],
            additionalProperties: false,
          },
        },
      ],
      tool_choice: { type: "tool", name: "return_nearby_suggestions" },
      messages: [
        {
          role: "user",
          content: `Use this booking context to find ideas near the hotel:\n${tripContext}`,
        },
      ],
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    return NextResponse.json({ error: errorText }, { status: res.status });
  }

  const data = (await res.json()) as {
    content?: { type: string; name?: string; input?: unknown }[];
  };
  const toolUse = data.content?.find(
    (block) => block.type === "tool_use" && block.name === "return_nearby_suggestions"
  );
  const input = toolUse?.input as { suggestions?: Suggestion[] } | undefined;
  const suggestions = input?.suggestions?.slice(0, 3) ?? [];

  if (suggestions.length === 0) {
    return NextResponse.json(
      { error: "Tripster could not generate nearby suggestions." },
      { status: 502 }
    );
  }

  return NextResponse.json({ suggestions });
}