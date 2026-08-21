"use client";

import { useEffect, useMemo, useState } from "react";
import { AddToTrip } from "@/components/AddToTrip";
import { ApiKeyPrompt } from "@/components/ApiKeyPrompt";
import { AskTripBrain, type ChatTurn } from "@/components/AskTripBrain";
import { BottomNav, type Tab } from "@/components/BottomNav";
import { EmptyState } from "@/components/EmptyState";
import { ItineraryPanel } from "@/components/ItineraryPanel";
import { OverviewPanel } from "@/components/OverviewPanel";
import { TripHero } from "@/components/TripHero";
import { findConflicts, findGaps } from "@/lib/conflicts";
import { clearTrip, loadTrip, newTrip, saveTrip } from "@/lib/trip-store";
import type { Booking, ExtractPayload, Trip } from "@/lib/trip-types";

type PendingAction =
  | { kind: "extract"; payload: ExtractPayload }
  | { kind: "ask"; question: string }
  | null;

export default function Home() {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [pending, setPending] = useState<PendingAction>(null);
  const [chat, setChat] = useState<ChatTurn[]>([]);
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");

  useEffect(() => {
    setTrip(loadTrip());
  }, []);

  useEffect(() => {
    if (trip) saveTrip(trip);
  }, [trip]);

  const { conflicts, gaps } = useMemo(() => {
    if (!trip) return { conflicts: [], gaps: [] };
    return {
      conflicts: findConflicts(trip.bookings),
      gaps: findGaps(trip.bookings),
    };
  }, [trip]);

  const tripContext = useMemo(() => buildTripContext(trip), [trip]);

  function ensureKey(action: PendingAction): string | null {
    if (apiKey) return apiKey;
    setPending(action);
    return null;
  }

  async function runExtract(key: string, payload: ExtractPayload) {
    if (!trip) return;
    setBusy(true);
    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Anthropic-API-Key": key,
        },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as {
        bookings?: Partial<Booking>[];
        error?: string;
      };
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      const added: Booking[] = (data.bookings ?? []).map((raw) => ({
        id: crypto.randomUUID(),
        type: (raw.type as Booking["type"]) ?? "other",
        title: raw.title ?? "Untitled booking",
        provider: raw.provider ?? undefined,
        confirmationNumber: raw.confirmationNumber ?? undefined,
        startDatetime: raw.startDatetime ?? undefined,
        endDatetime: raw.endDatetime ?? undefined,
        location: raw.location ?? undefined,
        address: raw.address ?? undefined,
        cancellationPolicy: raw.cancellationPolicy ?? undefined,
        paymentStatus: raw.paymentStatus ?? undefined,
        people: raw.people ?? undefined,
        actionsRequired: raw.actionsRequired ?? undefined,
        notes: raw.notes ?? undefined,
        createdAt: new Date().toISOString(),
      }));
      setTrip({ ...trip, bookings: [...trip.bookings, ...added] });
      setTab("itinerary");
    } finally {
      setBusy(false);
    }
  }

  async function runAsk(key: string, question: string) {
    setChat((prev) => [...prev, { role: "user", content: question }]);
    setBusy(true);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Anthropic-API-Key": key,
        },
        body: JSON.stringify({ question, tripContext }),
      });
      const data = (await res.json()) as { answer?: string; error?: string };
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setChat((prev) => [
        ...prev,
        { role: "assistant", content: data.answer ?? "(no answer)" },
      ]);
    } catch (e) {
      setChat((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Error: ${e instanceof Error ? e.message : String(e)}`,
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  async function handleKey(key: string) {
    setApiKey(key);
    const p = pending;
    setPending(null);
    if (!p) return;
    if (p.kind === "extract") await runExtract(key, p.payload);
    if (p.kind === "ask") await runAsk(key, p.question);
  }

  function clearAll() {
    if (typeof window !== "undefined" && !window.confirm("Clear this trip and start over?")) return;
    clearTrip();
    setTrip(null);
    setChat([]);
    setApiKey("");
    setTab("overview");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col overflow-hidden bg-white shadow-2xl sm:my-8 sm:min-h-[760px] sm:rounded-[36px] sm:border sm:border-white/60 sm:shadow-[0_40px_80px_-20px_rgba(15,23,42,0.35)]">
      {!trip ? (
        <EmptyState onCreate={(d) => setTrip(newTrip(d))} />
      ) : (
        <>
          <TripHero trip={trip} onClear={clearAll} />
          <div className="flex-1 overflow-y-auto">
            {tab === "overview" && (
              <OverviewPanel
                trip={trip}
                conflicts={conflicts}
                gaps={gaps}
                onGoAdd={() => setTab("add")}
              />
            )}
            {tab === "itinerary" && (
              <ItineraryPanel
                bookings={trip.bookings}
                onRemove={(id) =>
                  setTrip({
                    ...trip,
                    bookings: trip.bookings.filter((b) => b.id !== id),
                  })
                }
              />
            )}
            {tab === "ask" && (
              <AskTripBrain
                turns={chat}
                busy={busy}
                onAsk={async (question) => {
                  const key = ensureKey({ kind: "ask", question });
                  if (key) await runAsk(key, question);
                }}
              />
            )}
            {tab === "add" && (
              <AddToTrip
                onExtract={async (payload) => {
                  const key = ensureKey({ kind: "extract", payload });
                  if (key) await runExtract(key, payload);
                }}
              />
            )}
          </div>
          <BottomNav current={tab} onChange={setTab} />
        </>
      )}

      <ApiKeyPrompt
        open={pending !== null}
        onCancel={() => setPending(null)}
        onSubmit={handleKey}
      />
    </main>
  );
}

function buildTripContext(trip: Trip | null): string {
  if (!trip) return "";
  const lines = [`Trip: ${trip.destination}`];
  const sorted = [...trip.bookings].sort((a, b) => {
    const av = a.startDatetime
      ? new Date(a.startDatetime).getTime()
      : Number.MAX_SAFE_INTEGER;
    const bv = b.startDatetime
      ? new Date(b.startDatetime).getTime()
      : Number.MAX_SAFE_INTEGER;
    return av - bv;
  });
  for (const b of sorted) {
    const parts = [
      `- ${b.type.toUpperCase()}: ${b.title}`,
      b.startDatetime ? `start=${b.startDatetime}` : null,
      b.endDatetime ? `end=${b.endDatetime}` : null,
      b.location ? `location=${b.location}` : null,
      b.provider ? `provider=${b.provider}` : null,
      b.confirmationNumber ? `confirmation=${b.confirmationNumber}` : null,
      b.cancellationPolicy ? `cancellation=${b.cancellationPolicy}` : null,
    ].filter(Boolean);
    lines.push(parts.join(" | "));
    if (b.actionsRequired?.length) {
      lines.push(`  actions_required: ${b.actionsRequired.join("; ")}`);
    }
  }
  return lines.join("\n");
}
