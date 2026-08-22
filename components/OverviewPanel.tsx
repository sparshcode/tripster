"use client";

import { AlertTriangle, CalendarDays, Clock, Sparkles } from "lucide-react";
import { BOOKING_STYLE } from "@/lib/booking-style";
import type { Booking, Trip } from "@/lib/trip-types";
import type { Conflict, Gap } from "@/lib/conflicts";
import { wallTime, wallDayDate } from "@/lib/format";
import { ConflictsPanel } from "./ConflictsPanel";

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
}: {
  trip: Trip;
  conflicts: Conflict[];
  gaps: Gap[];
  onGoAdd: () => void;
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
