"use client";

import { BOOKING_ICON, type Booking, type Trip } from "@/lib/trip-types";

function formatDatetime(value?: string): string {
  if (!value) return "TBD";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function TripAtAGlance({
  trip,
  onRemove,
}: {
  trip: Trip;
  onRemove: (id: string) => void;
}) {
  const sorted = [...trip.bookings].sort((a, b) => {
    const av = a.startDatetime ? new Date(a.startDatetime).getTime() : Infinity;
    const bv = b.startDatetime ? new Date(b.startDatetime).getTime() : Infinity;
    return av - bv;
  });

  if (sorted.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-6 text-sm text-slate-500">
        Nothing added yet. Upload a booking below and it will appear here.
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-sm font-semibold text-slate-900">Your trip at a glance</div>
      <ul className="mt-3 space-y-2">
        {sorted.map((b) => (
          <BookingRow key={b.id} b={b} onRemove={onRemove} />
        ))}
      </ul>
    </section>
  );
}

function BookingRow({
  b,
  onRemove,
}: {
  b: Booking;
  onRemove: (id: string) => void;
}) {
  return (
    <li className="flex items-start justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
          <span aria-hidden>{BOOKING_ICON[b.type]}</span>
          <span className="truncate">{b.title}</span>
        </div>
        <div className="text-xs text-slate-500">
          {formatDatetime(b.startDatetime)}
          {b.endDatetime ? ` → ${formatDatetime(b.endDatetime)}` : ""}
          {b.location ? ` · ${b.location}` : ""}
        </div>
        {b.actionsRequired && b.actionsRequired.length > 0 && (
          <div className="mt-1 text-xs text-amber-700">
            ⚠️ {b.actionsRequired.join(" · ")}
          </div>
        )}
      </div>
      <button
        onClick={() => onRemove(b.id)}
        className="shrink-0 rounded-full border border-slate-200 px-2 py-1 text-xs text-slate-500 hover:bg-white"
        aria-label={`Remove ${b.title}`}
      >
        Remove
      </button>
    </li>
  );
}
