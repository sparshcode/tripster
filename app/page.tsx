"use client";

import { useEffect, useMemo, useState } from "react";
import { AddToTrip } from "@/components/AddToTrip";
import { ApiKeyPrompt } from "@/components/ApiKeyPrompt";
import { AskTripster, type ChatTurn } from "@/components/AskTripster";
import { BottomNav, type Tab } from "@/components/BottomNav";
import { ItineraryPanel } from "@/components/ItineraryPanel";
import { NewTripModal } from "@/components/NewTripModal";
import { Onboarding } from "@/components/Onboarding";
import { OverviewPanel } from "@/components/OverviewPanel";
import { PhoneFrame } from "@/components/PhoneFrame";
import { TripHero } from "@/components/TripHero";
import { TripsHome } from "@/components/TripsHome";
import {
  clearAuth,
  loadAuth,
  saveAuth,
  type AuthMethod,
  type AuthState,
} from "@/lib/auth-store";
import { findConflicts, findGaps } from "@/lib/conflicts";
import { loadTrips, newTrip, saveTrips } from "@/lib/trip-store";
import type { Booking, ExtractPayload, Trip } from "@/lib/trip-types";

type PendingAction =
  | { kind: "extract"; payload: ExtractPayload }
  | { kind: "ask"; question: string }
  | null;

export default function Home() {
  const [hydrated, setHydrated] = useState(false);
  const [auth, setAuth] = useState<AuthState | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [activeTripId, setActiveTripId] = useState<string | null>(null);
  const [showNewTrip, setShowNewTrip] = useState(false);

  const [apiKey, setApiKey] = useState("");
  const [pending, setPending] = useState<PendingAction>(null);
  const [chat, setChat] = useState<ChatTurn[]>([]);
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");

  useEffect(() => {
    setAuth(loadAuth());
    setTrips(loadTrips());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveTrips(trips);
  }, [trips, hydrated]);

  const activeTrip = useMemo(
    () => trips.find((t) => t.id === activeTripId) ?? null,
    [trips, activeTripId]
  );

  const { conflicts, gaps } = useMemo(() => {
    if (!activeTrip) return { conflicts: [], gaps: [] };
    return {
      conflicts: findConflicts(activeTrip.bookings),
      gaps: findGaps(activeTrip.bookings),
    };
  }, [activeTrip]);

  const tripContext = useMemo(() => buildTripContext(activeTrip), [activeTrip]);

  function ensureKey(action: PendingAction): string | null {
    if (apiKey) return apiKey;
    setPending(action);
    return null;
  }

  function updateActiveTrip(update: (t: Trip) => Trip) {
    if (!activeTrip) return;
    const next = update(activeTrip);
    setTrips((prev) => prev.map((t) => (t.id === next.id ? next : t)));
  }

  async function runExtract(key: string, payload: ExtractPayload) {
    if (!activeTrip) return;
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
      updateActiveTrip((t) => ({ ...t, bookings: [...t.bookings, ...added] }));
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

  function handleSignIn(info: { method: AuthMethod; email?: string }) {
    const a: AuthState = {
      email: info.email ?? null,
      method: info.method,
      signedInAt: new Date().toISOString(),
    };
    saveAuth(a);
    setAuth(a);
  }

  function handleSignOut() {
    if (typeof window !== "undefined" && !window.confirm("Sign out of Tripster?")) return;
    clearAuth();
    setAuth(null);
    setActiveTripId(null);
    setChat([]);
    setApiKey("");
    setTab("overview");
  }

  function handleCreateTrip(destination: string) {
    const trip = newTrip(destination);
    setTrips((prev) => [...prev, trip]);
    setActiveTripId(trip.id);
    setShowNewTrip(false);
    setTab("overview");
  }

  function handleDeleteTrip(id: string) {
    setTrips((prev) => prev.filter((t) => t.id !== id));
    if (activeTripId === id) {
      setActiveTripId(null);
      setChat([]);
    }
  }

  function handleBackToHome() {
    setActiveTripId(null);
    setChat([]);
    setTab("overview");
  }

  return (
    <PhoneFrame>
      {!hydrated ? null : !auth ? (
        <Onboarding onSignIn={handleSignIn} />
      ) : !activeTrip ? (
        <TripsHome
          trips={trips}
          auth={auth}
          onOpenTrip={(id) => {
            setActiveTripId(id);
            setTab("overview");
            setChat([]);
          }}
          onCreateTrip={() => setShowNewTrip(true)}
          onDeleteTrip={handleDeleteTrip}
          onSignOut={handleSignOut}
        />
      ) : (
        <>
          <TripHero
            trip={activeTrip}
            onBack={handleBackToHome}
            onDelete={() => {
              if (typeof window !== "undefined" && !window.confirm(`Delete ${activeTrip.destination}?`)) return;
              handleDeleteTrip(activeTrip.id);
            }}
          />
          <div className="flex-1 overflow-y-auto">
            {tab === "overview" && (
              <OverviewPanel
                trip={activeTrip}
                conflicts={conflicts}
                gaps={gaps}
                onGoAdd={() => setTab("add")}
              />
            )}
            {tab === "itinerary" && (
              <ItineraryPanel
                bookings={activeTrip.bookings}
                onRemove={(id) =>
                  updateActiveTrip((t) => ({
                    ...t,
                    bookings: t.bookings.filter((b) => b.id !== id),
                  }))
                }
              />
            )}
            {tab === "ask" && (
              <AskTripster
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

      <NewTripModal
        open={showNewTrip}
        onCancel={() => setShowNewTrip(false)}
        onCreate={handleCreateTrip}
      />

      <ApiKeyPrompt
        open={pending !== null}
        onCancel={() => setPending(null)}
        onSubmit={handleKey}
      />
    </PhoneFrame>
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
