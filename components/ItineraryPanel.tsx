"use client";

import { useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { Search, Trash2 } from "lucide-react";
import { BOOKING_STYLE } from "@/lib/booking-style";
import type { Booking } from "@/lib/trip-types";
import {
  formatDayHeading,
  todayDayKey,
  wallDayKey,
  wallTime,
} from "@/lib/format";

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
}: {
  bookings: Booking[];
  onRemove: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const today = todayDayKey();
  const dayRefs = useRef<Record<string, HTMLElement | null>>({});

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

  function jumpToDay(day: string) {
    setSelectedDay(day);
    const el = dayRefs.current[day];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (bookings.length === 0) {
    return (
      <div className="px-5 py-6">
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
          Your timeline is empty. Add a booking to see it here.
        </div>
      </div>
    );
  }

  const activeChip = selectedDay ?? (days.some((d) => d.day === today) ? today : days[0]?.day);

  return (
    <div className="px-5 py-5">
      {days.length > 1 && (
        <div className="no-scrollbar -mx-5 mb-3 overflow-x-auto px-5">
          <ul className="flex gap-2 pb-1">
            {days.map(({ day }) => {
              const isActive = day === activeChip;
              const isToday = day === today;
              const { weekday, day: dayNum } = dayChipLabel(day);
              return (
                <li key={day}>
                  <button
                    type="button"
                    onClick={() => jumpToDay(day)}
                    className={clsx(
                      "flex min-w-[52px] flex-col items-center rounded-2xl border px-2.5 py-2 transition",
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

      {days.length === 0 && (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
          Nothing matches. Clear your search or add a booking.
        </div>
      )}

      <div className="mt-5 space-y-6">
        {days.map(({ day, list }) => (
          <section
            key={day}
            ref={(el) => {
              dayRefs.current[day] = el;
            }}
            className="scroll-mt-3"
          >
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
                {list.length} {list.length === 1 ? "item" : "items"}
              </div>
            </div>
            <ol className="mt-3 space-y-3">
              {list.map((b, i) => (
                <TimelineRow
                  key={b.id}
                  b={b}
                  isLast={i === list.length - 1}
                  onRemove={onRemove}
                />
              ))}
            </ol>
          </section>
        ))}
      </div>
    </div>
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
      </div>
    </li>
  );
}
