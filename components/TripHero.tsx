"use client";

import clsx from "clsx";
import { Pencil, Sparkles } from "lucide-react";
import type { Trip } from "@/lib/trip-types";
import {
  formatDateChip,
  formatDateRange,
  isSameLocalDay,
  wallDayDate,
} from "@/lib/format";

function tripSpanDays(trip: Trip): Date[] {
  const timestamps = trip.bookings
    .flatMap((b) => [wallDayDate(b.startDatetime), wallDayDate(b.endDatetime)])
    .filter((d): d is Date => d !== null);
  if (timestamps.length === 0) return [];
  const start = new Date(Math.min(...timestamps.map((d) => d.getTime())));
  const end = new Date(Math.max(...timestamps.map((d) => d.getTime())));
  const days: Date[] = [];
  const cur = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const stop = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  while (cur.getTime() <= stop.getTime()) {
    days.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

function tripDateRangeLabel(trip: Trip): string {
  const dates = trip.bookings
    .flatMap((b) => [b.startDatetime, b.endDatetime])
    .filter((v): v is string => Boolean(v))
    .sort();
  if (dates.length === 0) return "Add a booking to set your dates";
  return formatDateRange(dates[0], dates[dates.length - 1]);
}

export function TripHero({
  trip,
  onClear,
}: {
  trip: Trip;
  onClear: () => void;
}) {
  const days = tripSpanDays(trip);
  const today = new Date();
  const label = tripDateRangeLabel(trip);

  return (
    <header className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-fuchsia-600 to-rose-500 px-6 pb-8 pt-6 text-white">
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-white/15 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 bottom-0 h-52 w-52 rounded-full bg-black/10 blur-2xl" />

      <div className="relative flex items-start justify-between">
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/80">
          <Sparkles className="h-3.5 w-3.5" /> Trip Brain
        </div>
        <button
          type="button"
          onClick={onClear}
          className="flex items-center gap-1 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-semibold text-white hover:bg-white/20"
        >
          <Pencil className="h-3 w-3" /> New trip
        </button>
      </div>

      <h1 className="relative mt-4 text-2xl font-bold leading-tight tracking-tight">
        {trip.destination}
      </h1>
      <p className="relative mt-1 text-sm text-white/80">{label}</p>

      {days.length > 0 && (
        <div className="no-scrollbar relative -mx-6 mt-5 overflow-x-auto pl-6">
          <ul className="flex gap-2 pb-1 pr-6">
            {days.map((d) => {
              const active = isSameLocalDay(d, today);
              const { weekday, day } = formatDateChip(d);
              return (
                <li key={d.toISOString()}>
                  <div
                    className={clsx(
                      "flex min-w-[54px] flex-col items-center rounded-2xl border px-3 py-2",
                      active
                        ? "border-white bg-white text-slate-900 shadow-lg shadow-black/10"
                        : "border-white/25 bg-white/10 text-white"
                    )}
                  >
                    <span className="text-[10px] font-semibold tracking-widest">
                      {weekday}
                    </span>
                    <span className="text-lg font-bold leading-tight">{day}</span>
                    {active && (
                      <span className="text-[9px] font-semibold uppercase tracking-wider text-rose-500">
                        Today
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </header>
  );
}
