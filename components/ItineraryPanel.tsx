"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import {
  Loader2,
  Navigation,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { BOOKING_STYLE } from "@/lib/booking-style";
import type { Booking, PlaceSuggestion } from "@/lib/trip-types";
import {
  formatDayHeading,
  todayDayKey,
  wallDayKey,
  wallTime,
} from "@/lib/format";
import { TripsterLogo, TripsterMark } from "./TripsterLogo";

export type OpenSlot = {
  id: string;
  day: string;
  from: string;
  to: string;
  durationMinutes: number;
  previousTitle: string;
  nextTitle: string;
};

const MIN_OPEN_SLOT_MINUTES = 90;

function findOpenSlots(bookings: Booking[]): OpenSlot[] {
  const timed = bookings.filter(
    (booking) => booking.type !== "hotel" && booking.startDatetime
  );
  const slots: OpenSlot[] = [];

  for (let index = 0; index < timed.length - 1; index += 1) {
    const previous = timed[index];
    const next = timed[index + 1];
    const from = previous.endDatetime ?? previous.startDatetime!;
    const to = next.startDatetime!;
    if (wallDayKey(from) !== wallDayKey(to)) continue;

    const durationMinutes = Math.round(
      (new Date(to).getTime() - new Date(from).getTime()) / 60_000
    );
    if (durationMinutes < MIN_OPEN_SLOT_MINUTES) continue;

    slots.push({
      id: `${previous.id}:${next.id}`,
      day: wallDayKey(from),
      from,
      to,
      durationMinutes,
      previousTitle: previous.title,
      nextTitle: next.title,
    });
  }

  return slots;
}

function dayChipLabel(dayKey: string): { weekday: string; day: string } {
  const m = dayKey.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return { weekday: "—", day: "—" };
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return {
    weekday: d.toLocaleDateString(undefined, { weekday: "short" }).toUpperCase(),
    day: String(d.getDate()),
  };
}

export function ItineraryPanel({
  bookings,
  onRemove,
  slotSuggestions,
  slotBusyId,
  slotErrors,
  onSuggestSlot,
  onAddSuggestion,
}: {
  bookings: Booking[];
  onRemove: (id: string) => void;
  slotSuggestions: Record<string, PlaceSuggestion[]>;
  slotBusyId: string | null;
  slotErrors: Record<string, string>;
  onSuggestSlot: (slot: OpenSlot) => void;
  onAddSuggestion: (slot: OpenSlot, suggestion: PlaceSuggestion) => void;
}) {
  const [query, setQuery] = useState("");
  const today = todayDayKey();

  const days = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? bookings.filter(
          (b) =>
            b.title.toLowerCase().includes(q) ||
            (b.location ?? "").toLowerCase().includes(q) ||
            b.type.toLowerCase().includes(q)
        )
      : bookings;

    const byDay = new Map<string, Booking[]>();
    for (const b of filtered) {
      const day = wallDayKey(b.startDatetime);
      const list = byDay.get(day) ?? [];
      list.push(b);
      byDay.set(day, list);
    }
    return Array.from(byDay.entries())
      .map(([day, list]) => ({
        day,
        list: list.sort((a, b) => {
          const av = a.startDatetime
            ? new Date(a.startDatetime).getTime()
            : Number.MAX_SAFE_INTEGER;
          const bv = b.startDatetime
            ? new Date(b.startDatetime).getTime()
            : Number.MAX_SAFE_INTEGER;
          return av - bv;
        }),
      }))
      .sort((a, b) => a.day.localeCompare(b.day));
  }, [bookings, query]);

  const dayKeys = days.map((d) => d.day);
  const initialDay = dayKeys.includes(today) ? today : dayKeys[0] ?? null;
  const [selectedDay, setSelectedDay] = useState<string | "all" | null>(
    initialDay
  );

  useEffect(() => {
    if (selectedDay === "all") return;
    if (selectedDay && dayKeys.includes(selectedDay)) return;
    setSelectedDay(initialDay);
  }, [dayKeys.join("|")]); // eslint-disable-line react-hooks/exhaustive-deps

  const visibleDays =
    selectedDay === "all" || selectedDay === null
      ? days
      : days.filter((d) => d.day === selectedDay);

  if (bookings.length === 0) {
    return (
      <div className="px-5 py-6">
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
          Your timeline is empty. Add a booking to see it here.
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 pb-5">
      <div className="sticky top-0 z-30 -mx-5 border-b border-slate-100 bg-white/95 px-5 pb-3 pt-5 shadow-[0_6px_16px_-14px_rgba(15,23,42,0.5)] backdrop-blur">
        {days.length > 1 && (
          <div className="no-scrollbar -mx-5 mb-3 overflow-x-auto px-5">
          <ul className="flex gap-2 pb-1">
            <li>
              <button
                type="button"
                onClick={() => setSelectedDay("all")}
                className={clsx(
                  "flex h-[62px] min-w-[52px] flex-col items-center justify-center rounded-2xl border px-3 transition",
                  selectedDay === "all"
                    ? "border-slate-900 bg-slate-900 text-white shadow-md"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                )}
              >
                <span className="text-[9px] font-semibold tracking-widest">
                  ALL
                </span>
                <span className="text-base font-bold leading-tight">
                  {days.length}
                </span>
                <span className="text-[8px] font-semibold uppercase tracking-widest text-slate-400">
                  days
                </span>
              </button>
            </li>
            {days.map(({ day }) => {
              const isActive = day === selectedDay;
              const isToday = day === today;
              const { weekday, day: dayNum } = dayChipLabel(day);
              return (
                <li key={day}>
                  <button
                    type="button"
                    onClick={() => setSelectedDay(day)}
                    className={clsx(
                      "flex h-[62px] min-w-[52px] flex-col items-center justify-center rounded-2xl border px-2.5 transition",
                      isActive
                        ? "border-slate-900 bg-slate-900 text-white shadow-md"
                        : isToday
                        ? "border-rose-200 bg-rose-50 text-rose-700"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    <span className="text-[9px] font-semibold tracking-widest">
                      {weekday}
                    </span>
                    <span className="text-base font-bold leading-tight">
                      {dayNum}
                    </span>
                    {isToday && !isActive && (
                      <span className="text-[8px] font-semibold uppercase tracking-widest">
                        Today
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
          </div>
        )}

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search itinerary"
            className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-indigo-400"
          />
        </div>
      </div>

      {visibleDays.length === 0 && (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
          Nothing on this day. Pick another day or clear your search.
        </div>
      )}

      <div className="mt-5 space-y-6">
        {visibleDays.map(({ day, list }) => (
          <section key={day}>
            {(() => {
              const openSlots = findOpenSlots(list);
              const slotsByPreviousId = new Map(
                openSlots.map((slot) => [slot.id.split(":")[0], slot])
              );
              return (
                <>
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-2">
                <div className="text-sm font-semibold text-slate-900">
                  {formatDayHeading(day)}
                </div>
                {day === today && (
                  <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-rose-700">
                    Today
                  </span>
                )}
              </div>
              <div className="text-[11px] font-medium text-slate-400">
                {list.length} {list.length === 1 ? "plan" : "plans"}
                {openSlots.length > 0 &&
                  ` · ${openSlots.length} open ${
                    openSlots.length === 1 ? "slot" : "slots"
                  }`}
              </div>
            </div>
            <ol className="mt-3 space-y-3">
              {list.map((b, i) => {
                const slot = slotsByPreviousId.get(b.id);
                return (
                  <Fragment key={b.id}>
                    <TimelineRow
                      b={b}
                      isLast={i === list.length - 1 && !slot}
                      onRemove={onRemove}
                    />
                    {slot && (
                      <OpenSlotRow
                        slot={slot}
                        suggestions={slotSuggestions[slot.id] ?? []}
                        busy={slotBusyId === slot.id}
                        error={slotErrors[slot.id]}
                        onSuggest={() => onSuggestSlot(slot)}
                        onAdd={(suggestion) =>
                          onAddSuggestion(slot, suggestion)
                        }
                      />
                    )}
                  </Fragment>
                );
              })}
            </ol>
                </>
              );
            })()}
          </section>
        ))}
      </div>
    </div>
  );
}

function OpenSlotRow({
  slot,
  suggestions,
  busy,
  error,
  onSuggest,
  onAdd,
}: {
  slot: OpenSlot;
  suggestions: PlaceSuggestion[];
  busy: boolean;
  error?: string;
  onSuggest: () => void;
  onAdd: (suggestion: PlaceSuggestion) => void;
}) {
  const hours = Math.floor(slot.durationMinutes / 60);
  const minutes = slot.durationMinutes % 60;
  const duration = [hours ? `${hours}h` : "", minutes ? `${minutes}m` : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <li className="relative flex gap-3">
      <div className="flex w-14 shrink-0 justify-end pt-3 text-[10px] font-semibold text-indigo-600">
        {duration}
      </div>
      <div className="relative flex flex-col items-center">
        <TripsterLogo size={36} className="rounded-xl ring-4 ring-white" />
        <div className="mt-1 flex-1 border-l-2 border-dashed border-slate-200" />
      </div>
      <div className="min-w-0 flex-1 rounded-2xl border border-dashed border-indigo-300 bg-gradient-to-br from-indigo-50 to-fuchsia-50 p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="text-[9px] font-bold uppercase tracking-widest text-indigo-600">
            Open slot
          </div>
          <div className="rounded-full bg-white px-2 py-1 text-[9px] font-semibold text-violet-600">
            {wallTime(slot.from)}–{wallTime(slot.to)}
          </div>
        </div>
        <div className="mt-1 text-sm font-semibold text-slate-900">
          Make this time count
        </div>
        <div className="mt-1 text-[11px] leading-4 text-slate-600">
          Find something nearby that matches your trip vibe and gets you to {slot.nextTitle} on time.
        </div>

        {suggestions.length === 0 ? (
          <button
            type="button"
            onClick={onSuggest}
            disabled={busy}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2 text-[11px] font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {busy ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Plus className="h-3.5 w-3.5" />
            )}
            {busy ? "Finding ideas..." : "Fill this slot with Tripster AI"}
          </button>
        ) : (
          <div className="mt-3 space-y-2">
            {suggestions.map((suggestion) => (
              <button
                key={`${suggestion.name}-${suggestion.category}`}
                type="button"
                onClick={() => onAdd(suggestion)}
                className="w-full rounded-xl border border-white bg-white/90 p-2.5 text-left shadow-sm hover:border-indigo-200"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="text-xs font-semibold text-slate-900">
                    {suggestion.name}
                  </div>
                  <Plus className="h-3.5 w-3.5 shrink-0 text-indigo-600" />
                </div>
                <div className="mt-0.5 text-[10px] text-slate-500">
                  {suggestion.area}
                  {suggestion.durationMinutes
                    ? ` · ${suggestion.durationMinutes} min`
                    : ""}
                </div>
                <div className="mt-1 text-[10px] leading-4 text-slate-600">
                  {suggestion.reason}
                </div>
              </button>
            ))}
            <div className="flex items-center gap-1 text-[9px] text-slate-400">
              <TripsterMark className="h-3 w-3" /> Tap an idea to add it to this slot.
            </div>
          </div>
        )}

        {error && (
          <div className="mt-2 rounded-lg bg-rose-50 px-2 py-1.5 text-[10px] text-rose-700">
            {error}
          </div>
        )}
      </div>
    </li>
  );
}

function TimelineRow({
  b,
  isLast,
  onRemove,
}: {
  b: Booking;
  isLast: boolean;
  onRemove: (id: string) => void;
}) {
  const s = BOOKING_STYLE[b.type];
  const directionsQuery = b.address ?? b.location;
  return (
    <li className="relative flex gap-3">
      <div className="flex w-14 shrink-0 flex-col items-end pt-2.5">
        <div className="text-xs font-semibold text-slate-700">
          {wallTime(b.startDatetime) || "—"}
        </div>
        {b.endDatetime && (
          <div className="mt-0.5 text-[10px] text-slate-400">
            {wallTime(b.endDatetime)}
          </div>
        )}
      </div>
      <div className="relative flex flex-col items-center">
        <div
          className={`grid h-10 w-10 place-items-center rounded-full ${s.bg} ${s.fg} ring-4 ring-white shadow-sm`}
        >
          <s.Icon className="h-4 w-4" />
        </div>
        {!isLast && (
          <div className="mt-1 flex-1 border-l-2 border-dashed border-slate-200" />
        )}
      </div>
      <div className="min-w-0 flex-1 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              {s.label}
            </div>
            <div className="mt-0.5 truncate text-sm font-semibold text-slate-900">
              {b.title}
            </div>
            {b.location && (
              <div className="text-xs text-slate-500">{b.location}</div>
            )}
          </div>
          <button
            type="button"
            onClick={() => onRemove(b.id)}
            className="shrink-0 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-rose-500"
            aria-label={`Remove ${b.title}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
        {b.actionsRequired && b.actionsRequired.length > 0 && (
          <div className="mt-2 rounded-lg bg-amber-50 px-2 py-1 text-xs text-amber-800">
            ⚠️ {b.actionsRequired.join(" · ")}
          </div>
        )}
        {b.cancellationPolicy && (
          <div className="mt-2 text-[11px] text-slate-500">
            <span className="font-semibold text-slate-600">Cancellation:</span>{" "}
            {b.cancellationPolicy}
          </div>
        )}
        {directionsQuery && (
          <div className="mt-3 border-t border-slate-100 pt-2.5">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                directionsQuery
              )}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1.5 text-[11px] font-semibold text-indigo-600 hover:bg-indigo-100"
            >
              <Navigation className="h-3 w-3" /> Get directions
            </a>
          </div>
        )}
      </div>
    </li>
  );
}
