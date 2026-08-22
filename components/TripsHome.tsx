"use client";

import { LogOut, MapPin, Plus, Trash2 } from "lucide-react";
import clsx from "clsx";
import type { Trip } from "@/lib/trip-types";
import { formatDateRange, wallDayDate } from "@/lib/format";
import { TripsterLogo } from "./TripsterLogo";
import type { AuthState } from "@/lib/auth-store";

const GRADIENTS = [
  "from-indigo-500 via-fuchsia-500 to-rose-500",
  "from-sky-500 via-indigo-500 to-purple-500",
  "from-amber-500 via-rose-500 to-fuchsia-500",
  "from-emerald-500 via-teal-500 to-cyan-500",
  "from-purple-500 via-pink-500 to-rose-500",
  "from-orange-500 via-red-500 to-rose-500",
];

function gradientForTrip(trip: Trip): string {
  const sum = [...trip.id].reduce((a, c) => a + c.charCodeAt(0), 0);
  return GRADIENTS[sum % GRADIENTS.length];
}

type Bucket = "active" | "upcoming" | "past" | "planning";

function bucketFor(trip: Trip, now: Date): Bucket {
  const starts = trip.bookings
    .map((b) => (b.startDatetime ? new Date(b.startDatetime).getTime() : NaN))
    .filter((n) => !Number.isNaN(n));
  const ends = trip.bookings
    .map((b) => (b.endDatetime ?? b.startDatetime ? new Date((b.endDatetime ?? b.startDatetime)!).getTime() : NaN))
    .filter((n) => !Number.isNaN(n));
  if (starts.length === 0) return "planning";
  const start = new Date(Math.min(...starts));
  const end = new Date(Math.max(...ends));
  const t = now.getTime();
  if (t < start.getTime()) return "upcoming";
  if (t > end.getTime()) return "past";
  return "active";
}

function tripDateLabel(trip: Trip): string {
  const dates = trip.bookings
    .flatMap((b) => [b.startDatetime, b.endDatetime])
    .filter((v): v is string => Boolean(v))
    .sort();
  if (dates.length === 0) return "Add bookings to set dates";
  return formatDateRange(dates[0], dates[dates.length - 1]);
}

function daysUntil(trip: Trip, now: Date): number | null {
  const starts = trip.bookings
    .map((b) => wallDayDate(b.startDatetime))
    .filter((d): d is Date => d !== null);
  if (starts.length === 0) return null;
  const start = new Date(Math.min(...starts.map((d) => d.getTime())));
  const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((startDay.getTime() - today.getTime()) / 86_400_000);
}

export function TripsHome({
  trips,
  auth,
  onOpenTrip,
  onCreateTrip,
  onDeleteTrip,
  onSignOut,
}: {
  trips: Trip[];
  auth: AuthState | null;
  onOpenTrip: (id: string) => void;
  onCreateTrip: () => void;
  onDeleteTrip: (id: string) => void;
  onSignOut: () => void;
}) {
  const now = new Date();
  const buckets: Record<Bucket, Trip[]> = {
    active: [],
    upcoming: [],
    planning: [],
    past: [],
  };
  for (const t of trips) buckets[bucketFor(t, now)].push(t);

  const greetName = auth?.email
    ? auth.email.split("@")[0].split(/[._-]/)[0]
    : "traveler";

  return (
    <div className="relative flex flex-1 flex-col overflow-y-auto bg-slate-50 pb-8 pt-14">
      <header className="flex items-start justify-between px-6">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
            <TripsterLogo size={20} /> Tripster
          </div>
          <h1 className="mt-2 text-2xl font-bold capitalize tracking-tight text-slate-900">
            Hi {greetName}
          </h1>
          <p className="text-xs text-slate-500">
            {trips.length === 0
              ? "Start your first trip below."
              : `${trips.length} ${trips.length === 1 ? "trip" : "trips"} in your brain.`}
          </p>
        </div>
        <button
          type="button"
          onClick={onSignOut}
          className="flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-500 hover:bg-slate-100"
        >
          <LogOut className="h-3 w-3" /> Sign out
        </button>
      </header>

      <div className="mt-5 px-6">
        <button
          type="button"
          onClick={onCreateTrip}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-white py-3 text-sm font-semibold text-slate-700 shadow-sm hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700"
        >
          <Plus className="h-4 w-4" /> New trip
        </button>
      </div>

      {trips.length === 0 ? (
        <div className="mx-6 mt-8 rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-lg">
            <MapPin className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-slate-900">
            Your Tripster is empty.
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Add your first destination and start dropping in bookings.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-6 px-6">
          {buckets.active.length > 0 && (
            <Section title="Active" count={buckets.active.length}>
              <div className="space-y-3">
                {buckets.active.map((t) => (
                  <ActiveTripCard
                    key={t.id}
                    trip={t}
                    now={now}
                    onOpen={onOpenTrip}
                    onDelete={onDeleteTrip}
                  />
                ))}
              </div>
            </Section>
          )}
          {buckets.upcoming.length > 0 && (
            <Section title="Upcoming" count={buckets.upcoming.length}>
              <div className="grid grid-cols-2 gap-3">
                {buckets.upcoming.map((t) => (
                  <TripCard
                    key={t.id}
                    trip={t}
                    now={now}
                    onOpen={onOpenTrip}
                    onDelete={onDeleteTrip}
                  />
                ))}
              </div>
            </Section>
          )}
          {buckets.planning.length > 0 && (
            <Section title="Planning" count={buckets.planning.length}>
              <div className="grid grid-cols-2 gap-3">
                {buckets.planning.map((t) => (
                  <TripCard
                    key={t.id}
                    trip={t}
                    now={now}
                    onOpen={onOpenTrip}
                    onDelete={onDeleteTrip}
                  />
                ))}
              </div>
            </Section>
          )}
          {buckets.past.length > 0 && (
            <Section title="Past" count={buckets.past.length}>
              <div className="grid grid-cols-2 gap-3">
                {buckets.past.map((t) => (
                  <TripCard
                    key={t.id}
                    trip={t}
                    now={now}
                    onOpen={onOpenTrip}
                    onDelete={onDeleteTrip}
                    muted
                  />
                ))}
              </div>
            </Section>
          )}
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-2 flex items-baseline justify-between">
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
          {title}
        </h2>
        <span className="text-[11px] font-medium text-slate-400">
          {count} {count === 1 ? "trip" : "trips"}
        </span>
      </div>
      {children}
    </section>
  );
}

function ActiveTripCard({
  trip,
  now,
  onOpen,
  onDelete,
}: {
  trip: Trip;
  now: Date;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const grad = gradientForTrip(trip);
  const dateLabel = tripDateLabel(trip);
  return (
    <div
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${grad} p-5 text-white shadow-xl`}
    >
      <button
        type="button"
        onClick={() => onOpen(trip.id)}
        className="block w-full text-left"
      >
        <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/80">
          Right now
        </div>
        <div className="mt-2 text-xl font-bold">{trip.destination}</div>
        <div className="mt-1 text-xs text-white/85">{dateLabel}</div>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold backdrop-blur">
          {trip.bookings.length}{" "}
          {trip.bookings.length === 1 ? "booking" : "bookings"}
        </div>
      </button>
      <DeleteButton onDelete={() => onDelete(trip.id)} label={trip.destination} />
    </div>
  );
}

function TripCard({
  trip,
  now,
  onOpen,
  onDelete,
  muted = false,
}: {
  trip: Trip;
  now: Date;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  muted?: boolean;
}) {
  const grad = gradientForTrip(trip);
  const days = daysUntil(trip, now);
  const dateLabel = tripDateLabel(trip);
  return (
    <div
      className={clsx(
        "relative overflow-hidden rounded-2xl bg-gradient-to-br p-4 text-white shadow-md",
        grad,
        muted && "opacity-80 grayscale-[15%]"
      )}
    >
      <button
        type="button"
        onClick={() => onOpen(trip.id)}
        className="block h-full w-full text-left"
      >
        <div className="text-sm font-bold leading-tight">{trip.destination}</div>
        <div className="mt-1 text-[11px] text-white/85">{dateLabel}</div>
        <div className="mt-3 text-[10px] font-semibold uppercase tracking-widest text-white/80">
          {days !== null && days > 0
            ? `In ${days} ${days === 1 ? "day" : "days"}`
            : days !== null && days === 0
            ? "Today"
            : `${trip.bookings.length} ${trip.bookings.length === 1 ? "booking" : "bookings"}`}
        </div>
      </button>
      <DeleteButton onDelete={() => onDelete(trip.id)} label={trip.destination} />
    </div>
  );
}

function DeleteButton({
  onDelete,
  label,
}: {
  onDelete: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        if (typeof window !== "undefined" && !window.confirm(`Delete ${label}?`)) return;
        onDelete();
      }}
      className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-white/20 text-white opacity-70 hover:bg-white/30 hover:opacity-100"
      aria-label={`Delete ${label}`}
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  );
}
