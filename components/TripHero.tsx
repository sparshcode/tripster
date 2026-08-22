"use client";

import { ArrowLeft, Sparkles, Trash2 } from "lucide-react";
import type { Trip } from "@/lib/trip-types";
import { formatDateRange } from "@/lib/format";

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
  onBack,
  onDelete,
}: {
  trip: Trip;
  onBack: () => void;
  onDelete: () => void;
}) {
  const label = tripDateRangeLabel(trip);

  return (
    <header className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-fuchsia-600 to-rose-500 px-6 pb-6 pt-12 text-white">
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-white/15 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 bottom-0 h-52 w-52 rounded-full bg-black/10 blur-2xl" />

      <div className="relative flex items-start justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-semibold text-white hover:bg-white/20"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> All trips
        </button>
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-white">
            <Sparkles className="h-3 w-3" /> Tripster
          </div>
          <button
            type="button"
            onClick={onDelete}
            aria-label="Delete trip"
            className="grid h-7 w-7 place-items-center rounded-full border border-white/25 bg-white/10 text-white hover:bg-white/20"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <h1 className="relative mt-4 text-2xl font-bold leading-tight tracking-tight">
        {trip.destination}
      </h1>
      <p className="relative mt-1 text-sm text-white/80">{label}</p>
    </header>
  );
}
