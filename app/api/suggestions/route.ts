import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Suggestion = {
  name: string;
  category: "food" | "coffee" | "sight" | "shop" | "other";
  area: string;
  reason: string;
  durationMinutes: number;
};

type SlotContext = {
  from: string;
  to: string;
  durationMinutes: number;
  previousTitle: string;
  nextTitle: string;
};

const SYSTEM_PROMPT = `You are Tripster, a careful local travel planner.
Suggest three distinct places that fit the traveler's full trip and itinerary. Use the hotel as a location anchor, account for the locations and timing of every booking, and do not suggest anything already booked. Prefer well-known, established places that complement the itinerary with a useful mix of food, coffee, sights, or shops. Never invent precise distances, opening hours, prices, or availability. Keep each reason under 18 words and explain why the place fits these plans. Use the return_nearby_suggestions tool.`;

export async function POST(req: Request) {
  const apiKey = req.headers.get("x-anthropic-api-key")?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: "An Anthropic API key is required." },
      { status: 401 }
    );
  }

  let body: { tripContext?: string; slot?: SlotContext };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const tripContext = body.tripContext?.trim();
  if (!tripContext) {
    return NextResponse.json({ error: "Missing trip context." }, { status: 400 });
  }
  const slot = body.slot;

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
          description: "Return three place suggestions that complement the traveler's trip and itinerary.",
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
                    durationMinutes: {
                      type: "integer",
                      minimum: 30,
                      maximum: 180,
                    },
                  },
                  required: [
                    "name",
                    "category",
                    "area",
                    "reason",
                    "durationMinutes",
                  ],
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
          content: slot
            ? `Use this complete booking context to suggest places for one open itinerary slot.\n${tripContext}\n\nOpen slot: ${slot.from} to ${slot.to} (${slot.durationMinutes} minutes), after ${slot.previousTitle}, before ${slot.nextTitle}. Every suggestion must fit comfortably inside this window and help the traveler reach the next plan on time.`
            : `Use this complete booking context to suggest places that fit the trip and itinerary:\n${tripContext}`,
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