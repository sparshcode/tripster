"use client";

import {
  AlertTriangle,
  CalendarDays,
  Clock,
  Coffee,
  Compass,
  LoaderCircle,
  MapPin,
  RefreshCw,
  Sparkles,
  Utensils,
} from "lucide-react";
import { BOOKING_STYLE } from "@/lib/booking-style";
import type { Booking, Trip } from "@/lib/trip-types";
import type { Conflict, Gap } from "@/lib/conflicts";
import { wallTime, wallDayDate } from "@/lib/format";
import { ConflictsPanel } from "./ConflictsPanel";

export type NearbySuggestion = {
  name: string;
  category: "food" | "coffee" | "sight" | "shop" | "other";
  area: string;
  reason: string;
};

function nextUpcoming(bookings: Booking[]): Booking | null {
  const now = Date.now();
  return (
    [...bookings]
      .filter((b) => b.startDatetime && new Date(b.startDatetime).getTime() >= now)
      .sort(
        (a, b) =>
          new Date(a.startDatetime!).getTime() -
          new Date(b.startDatetime!).getTime()
      )[0] ?? null
  );
}

function countsByType(bookings: Booking[]) {
  const m = new Map<Booking["type"], number>();
  for (const b of bookings) m.set(b.type, (m.get(b.type) ?? 0) + 1);
  return Array.from(m.entries()).sort((a, b) => b[1] - a[1]);
}

export function OverviewPanel({
  trip,
  conflicts,
  gaps,
  onGoAdd,
  suggestions,
  suggestionsBusy,
  suggestionsError,
  onGetSuggestions,
}: {
  trip: Trip;
  conflicts: Conflict[];
  gaps: Gap[];
  onGoAdd: () => void;
  suggestions: NearbySuggestion[];
  suggestionsBusy: boolean;
  suggestionsError: string | null;
  onGetSuggestions: () => void;
}) {
  const total = trip.bookings.length;
  const alerts = conflicts.length + gaps.length;
  const upcoming = nextUpcoming(trip.bookings);
  const counts = countsByType(trip.bookings);

  if (total === 0) {
    return (
      <div className="px-5 py-6">
        <div className="rounded-3xl border border-dashed border-indigo-200 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white">
            <Sparkles className="h-5 w-5" />
          </div>
          <h3 className="mt-3 text-base font-semibold text-slate-900">
            Add your first booking
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Drop in a PDF, screenshot, or pasted email and Tripster will fill in
            the rest.
          </p>
          <button
            type="button"
            onClick={onGoAdd}
            className="mt-4 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
          >
            Add to trip
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-5 py-5">
      <div className="grid grid-cols-3 gap-2">
        <StatCard
          icon={<CalendarDays className="h-3.5 w-3.5" />}
          label="Bookings"
          value={String(total)}
        />
        <StatCard
          icon={<AlertTriangle className="h-3.5 w-3.5" />}
          label="Alerts"
          value={String(alerts)}
          tone={alerts > 0 ? "warn" : "ok"}
        />
        <StatCard
          icon={<Clock className="h-3.5 w-3.5" />}
          label="Next up"
          value={upcoming ? shortDate(upcoming.startDatetime) : "—"}
        />
      </div>

      {upcoming && <UpNext booking={upcoming} />}

      <NearbySuggestions
        trip={trip}
        suggestions={suggestions}
        busy={suggestionsBusy}
        error={suggestionsError}
        onGetSuggestions={onGetSuggestions}
      />

      {(conflicts.length > 0 || gaps.length > 0) && (
        <div>
          <SectionLabel>Needs your attention</SectionLabel>
          <div className="mt-2">
            <ConflictsPanel conflicts={conflicts} gaps={gaps} />
          </div>
        </div>
      )}

      {counts.length > 0 && (
        <div>
          <SectionLabel>What&apos;s booked</SectionLabel>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {counts.map(([type, n]) => {
              const s = BOOKING_STYLE[type];
              return (
                <div
                  key={type}
                  className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm"
                >
                  <div
                    className={`grid h-9 w-9 place-items-center rounded-full ${s.bg} ${s.fg}`}
                  >
                    <s.Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 text-sm">
                    <div className="truncate font-semibold text-slate-900">
                      {s.label}
                    </div>
                    <div className="text-xs text-slate-500">
                      {n} {n === 1 ? "item" : "items"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function NearbySuggestions({
  trip,
  suggestions,
  busy,
  error,
  onGetSuggestions,
}: {
  trip: Trip;
  suggestions: NearbySuggestion[];
  busy: boolean;
  error: string | null;
  onGetSuggestions: () => void;
}) {
  const hotel = trip.bookings.find(
    (booking) => booking.type === "hotel" && (booking.address || booking.location)
  );
  const hotelArea = hotel?.address ?? hotel?.location;

  if (!hotel || !hotelArea) {
    return (
      <div>
        <SectionLabel>Near your stay</SectionLabel>
        <div className="mt-2 flex items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white p-4">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-indigo-50 text-indigo-600">
            <MapPin className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">
              Add your hotel to get local ideas
            </div>
            <div className="mt-0.5 text-xs text-slate-500">
              Tripster uses its location as the starting point.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section>
      <div className="flex items-end justify-between gap-3">
        <div>
          <SectionLabel>Near your stay</SectionLabel>
          <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">Around {hotel.title}</span>
          </div>
        </div>
        {suggestions.length > 0 && (
          <button
            type="button"
            onClick={onGetSuggestions}
            disabled={busy}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm disabled:opacity-50"
            aria-label="Refresh nearby suggestions"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${busy ? "animate-spin" : ""}`} />
          </button>
        )}
      </div>

      {suggestions.length === 0 ? (
        <button
          type="button"
          onClick={onGetSuggestions}
          disabled={busy}
          className="mt-2 flex w-full items-center gap-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 p-4 text-left text-white shadow-sm disabled:opacity-70"
        >
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/15">
            {busy ? (
              <LoaderCircle className="h-5 w-5 animate-spin" />
            ) : (
              <Sparkles className="h-5 w-5" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold">
              {busy ? "Finding local picks..." : "Discover places nearby"}
            </div>
            <div className="mt-0.5 text-xs text-white/75">
              AI ideas for food, coffee, and things to do
            </div>
          </div>
          {!busy && <Compass className="h-5 w-5 shrink-0" />}
        </button>
      ) : (
        <div className="mt-2 space-y-2">
          {suggestions.map((suggestion) => (
            <SuggestionCard
              key={`${suggestion.name}-${suggestion.category}`}
              suggestion={suggestion}
            />
          ))}
          <p className="px-1 text-[10px] leading-4 text-slate-400">
            AI suggestions are not live listings. Verify distance, hours, and availability.
          </p>
        </div>
      )}

      {error && (
        <div className="mt-2 rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {error}
        </div>
      )}
    </section>
  );
}

function SuggestionCard({ suggestion }: { suggestion: NearbySuggestion }) {
  const Icon =
    suggestion.category === "food"
      ? Utensils
      : suggestion.category === "coffee"
      ? Coffee
      : Compass;

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-600">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="truncate text-sm font-semibold text-slate-900">
            {suggestion.name}
          </div>
          <div className="shrink-0 rounded-full bg-indigo-50 px-2 py-0.5 text-[9px] font-semibold uppercase text-indigo-600">
            AI pick
          </div>
        </div>
        <div className="mt-0.5 text-[11px] text-slate-500">{suggestion.area}</div>
        <div className="mt-1 text-xs leading-4 text-slate-600">{suggestion.reason}</div>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
      {children}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone = "neutral",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: "neutral" | "ok" | "warn";
}) {
  const toneClass =
    tone === "warn"
      ? "text-rose-600"
      : tone === "ok"
      ? "text-emerald-600"
      : "text-slate-900";
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
        {icon} {label}
      </div>
      <div className={`mt-1 text-base font-bold ${toneClass}`}>{value}</div>
    </div>
  );
}

function UpNext({ booking }: { booking: Booking }) {
  const s = BOOKING_STYLE[booking.type];
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-white/80">
        Up next
      </div>
      <div className="flex items-start gap-3 px-4 py-4">
        <div
          className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${s.bg} ${s.fg}`}
        >
          <s.Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            {s.label}
          </div>
          <div className="mt-0.5 truncate text-sm font-semibold text-slate-900">
            {booking.title}
          </div>
          <div className="text-xs text-slate-500">
            {longDate(booking.startDatetime)}
            {booking.location ? ` · ${booking.location}` : ""}
          </div>
          {booking.actionsRequired && booking.actionsRequired.length > 0 && (
            <div className="mt-2 rounded-lg bg-amber-50 px-2 py-1 text-xs text-amber-700">
              ⚠️ {booking.actionsRequired.join(" · ")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function shortDate(iso?: string): string {
  const d = wallDayDate(iso);
  if (!d) return "—";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function longDate(iso?: string): string {
  const d = wallDayDate(iso);
  if (!d) return "";
  const day = d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const time = wallTime(iso);
  return time ? `${day} · ${time}` : day;
}
