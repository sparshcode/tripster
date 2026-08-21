"use client";

import { BOOKING_ICON, type Booking } from "@/lib/trip-types";

function isoDay(value?: string): string {
  if (!value) return "unknown";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "unknown";
  return d.toISOString().slice(0, 10);
}

function formatTime(value?: string): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

function formatDayHeading(day: string): string {
  if (day === "unknown") return "Unscheduled";
  const d = new Date(`${day}T00:00:00`);
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function Timeline({ bookings }: { bookings: Booking[] }) {
  const byDay = new Map<string, Booking[]>();
  for (const b of bookings) {
    const day = isoDay(b.startDatetime);
    const list = byDay.get(day) ?? [];
    list.push(b);
    byDay.set(day, list);
  }

  const days = Array.from(byDay.entries())
    .map(([day, list]) => ({
      day,
      list: list.sort((a, b) => {
        const av = a.startDatetime ? new Date(a.startDatetime).getTime() : 0;
        const bv = b.startDatetime ? new Date(b.startDatetime).getTime() : 0;
        return av - bv;
      }),
    }))
    .sort((a, b) => a.day.localeCompare(b.day));

  if (days.length === 0) return null;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-sm font-semibold text-slate-900">Timeline</div>
      <div className="mt-4 space-y-6">
        {days.map(({ day, list }) => (
          <div key={day}>
            <div className="text-xs font-semibold uppercase tracking-widest text-indigo-600">
              {formatDayHeading(day)}
            </div>
            <ol className="mt-2 space-y-2 border-l-2 border-slate-200 pl-4">
              {list.map((b) => (
                <li key={b.id} className="relative">
                  <span className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-indigo-500" />
                  <div className="text-sm text-slate-900">
                    <span className="mr-2 text-slate-500">{formatTime(b.startDatetime)}</span>
                    <span aria-hidden className="mr-1">
                      {BOOKING_ICON[b.type]}
                    </span>
                    {b.title}
                  </div>
                  {b.location && <div className="text-xs text-slate-500">{b.location}</div>}
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </section>
  );
}
