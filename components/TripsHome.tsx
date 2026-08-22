"use client";

import { useState } from "react";
import clsx from "clsx";
import Image from "next/image";
import {
  LogOut,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  User,
  Globe2,
} from "lucide-react";
import type { Trip } from "@/lib/trip-types";
import { formatDateRange, wallDayDate } from "@/lib/format";
import { photoForDestination } from "@/lib/destination-photos";
import type { AuthState } from "@/lib/auth-store";

type Bucket = "active" | "upcoming" | "planning" | "past";

function bucketFor(trip: Trip, now: Date): Bucket {
  const starts = trip.bookings
    .map((b) => (b.startDatetime ? new Date(b.startDatetime).getTime() : NaN))
    .filter((n) => !Number.isNaN(n));
  const endTimes = trip.bookings
    .map((b) => {
      const source = b.endDatetime ?? b.startDatetime;
      return source ? new Date(source).getTime() : NaN;
    })
    .filter((n) => !Number.isNaN(n));
  if (starts.length === 0) return "planning";
  const start = new Date(Math.min(...starts));
  const end = new Date(Math.max(...endTimes));
  const t = now.getTime();
  if (t < start.getTime()) return "upcoming";
  if (t > end.getTime()) return "past";
  return "active";
}

function shortName(destination: string): string {
  return destination.split(/[—–-]/)[0].trim();
}

function tripDateLabel(trip: Trip): string {
  const dates = trip.bookings
    .flatMap((b) => [b.startDatetime, b.endDatetime])
    .filter((v): v is string => Boolean(v))
    .sort();
  if (dates.length === 0) {
    const parts = trip.destination.split(/[—–-]/);
    return parts.length > 1 ? parts.slice(1).join(" – ").trim() : "";
  }
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
  const [editMode, setEditMode] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const now = new Date();

  const buckets: Record<Bucket, Trip[]> = {
    active: [],
    upcoming: [],
    planning: [],
    past: [],
  };
  for (const t of trips) buckets[bucketFor(t, now)].push(t);

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-white">
      <div className="no-scrollbar flex-1 overflow-y-auto pb-28 pt-14">
        <header className="flex items-center justify-between px-6 pt-2">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Trips</h1>
          <button
            type="button"
            onClick={() => setEditMode((v) => !v)}
            className={clsx(
              "grid h-9 w-9 place-items-center rounded-full transition",
              editMode
                ? "bg-indigo-600 text-white"
                : "text-indigo-600 hover:bg-indigo-50"
            )}
            aria-label={editMode ? "Done editing" : "Edit trips"}
          >
            <Pencil className="h-4 w-4" />
          </button>
        </header>

        {trips.length === 0 ? (
          <EmptyTrips onCreate={onCreateTrip} />
        ) : (
          <div className="mt-6 space-y-6 px-6">
            {buckets.active.length > 0 && (
              <Section title="Active" count={buckets.active.length}>
                <div className="space-y-3">
                  {buckets.active.map((t) => (
                    <ActiveCard
                      key={t.id}
                      trip={t}
                      editMode={editMode}
                      onOpen={onOpenTrip}
                      onDelete={onDeleteTrip}
                    />
                  ))}
                </div>
              </Section>
            )}

            {(buckets.past.length > 0 || buckets.upcoming.length > 0) && (
              <div className="grid grid-cols-2 gap-4">
                {buckets.past.length > 0 && (
                  <MiniSection title="Past" count={buckets.past.length}>
                    {buckets.past.map((t) => (
                      <MiniCard
                        key={t.id}
                        trip={t}
                        now={now}
                        editMode={editMode}
                        onOpen={onOpenTrip}
                        onDelete={onDeleteTrip}
                        muted
                      />
                    ))}
                  </MiniSection>
                )}
                {buckets.upcoming.length > 0 && (
                  <MiniSection title="Upcoming" count={buckets.upcoming.length}>
                    {buckets.upcoming.map((t) => (
                      <MiniCard
                        key={t.id}
                        trip={t}
                        now={now}
                        editMode={editMode}
                        onOpen={onOpenTrip}
                        onDelete={onDeleteTrip}
                      />
                    ))}
                  </MiniSection>
                )}
              </div>
            )}

            {buckets.planning.length > 0 && (
              <Section title="Planning" count={buckets.planning.length}>
                <div className="grid grid-cols-2 gap-3">
                  {buckets.planning.map((t) => (
                    <MiniCard
                      key={t.id}
                      trip={t}
                      now={now}
                      editMode={editMode}
                      onOpen={onOpenTrip}
                      onDelete={onDeleteTrip}
                    />
                  ))}
                </div>
              </Section>
            )}
          </div>
        )}
      </div>

      <HomeNav
        onCreate={onCreateTrip}
        onProfile={() => setShowProfile(true)}
      />

      <ProfileSheet
        open={showProfile}
        auth={auth}
        onClose={() => setShowProfile(false)}
        onSignOut={() => {
          setShowProfile(false);
          onSignOut();
        }}
      />
    </div>
  );
}

function EmptyTrips({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="mx-6 mt-10 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-lg">
        <MapPin className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-900">
        No trips yet
      </h3>
      <p className="mt-1 text-xs text-slate-500">
        Tap the plus button below to start your first trip.
      </p>
      <button
        type="button"
        onClick={onCreate}
        className="mt-4 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
      >
        Create trip
      </button>
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
      <div className="mb-3">
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        <p className="text-xs text-slate-500">
          {count} {count === 1 ? "trip" : "trips"}
        </p>
      </div>
      {children}
    </section>
  );
}

function MiniSection({
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
      <div className="mb-2">
        <h2 className="text-base font-bold text-slate-900">{title}</h2>
        <p className="text-[11px] text-slate-500">
          {count} {count === 1 ? "trip" : "trips"}
        </p>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function ActiveCard({
  trip,
  editMode,
  onOpen,
  onDelete,
}: {
  trip: Trip;
  editMode: boolean;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const photo = photoForDestination(trip.destination);
  const label = tripDateLabel(trip);
  const name = shortName(trip.destination);
  return (
    <div className="relative overflow-hidden rounded-3xl shadow-lg">
      <button
        type="button"
        onClick={() => onOpen(trip.id)}
        className="block w-full text-left"
      >
        <div className="relative aspect-[4/3] w-full bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-rose-500">
          <Image
            src={photo}
            alt={name}
            fill
            sizes="400px"
            className="object-cover"
            loading="lazy"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5">
            <div className="text-2xl font-bold text-white drop-shadow">{name}</div>
            <div className="mt-1 text-sm text-white/85">{label}</div>
          </div>
        </div>
      </button>
      {editMode && (
        <DeleteChip
          onDelete={() => onDelete(trip.id)}
          label={trip.destination}
        />
      )}
    </div>
  );
}

function MiniCard({
  trip,
  now,
  editMode,
  onOpen,
  onDelete,
  muted = false,
}: {
  trip: Trip;
  now: Date;
  editMode: boolean;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  muted?: boolean;
}) {
  const photo = photoForDestination(trip.destination);
  const label = tripDateLabel(trip);
  const name = shortName(trip.destination);
  const days = daysUntil(trip, now);
  return (
    <div
      className={clsx(
        "relative overflow-hidden rounded-2xl shadow-md",
        muted && "opacity-90"
      )}
    >
      <button
        type="button"
        onClick={() => onOpen(trip.id)}
        className="block w-full text-left"
      >
        <div className="relative aspect-square w-full bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-rose-500">
          <Image
            src={photo}
            alt={name}
            fill
            sizes="200px"
            className={clsx("object-cover", muted && "grayscale-[15%]")}
            loading="lazy"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-3">
            <div className="text-sm font-bold text-white drop-shadow">{name}</div>
            <div className="text-[10px] text-white/85">
              {days !== null && days > 0
                ? `In ${days} ${days === 1 ? "day" : "days"}`
                : label}
            </div>
          </div>
        </div>
      </button>
      {editMode && (
        <DeleteChip
          onDelete={() => onDelete(trip.id)}
          label={trip.destination}
        />
      )}
    </div>
  );
}

function DeleteChip({
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
      className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-rose-600 shadow ring-1 ring-black/5 hover:bg-white"
      aria-label={`Delete ${label}`}
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}

function HomeNav({
  onCreate,
  onProfile,
}: {
  onCreate: () => void;
  onProfile: () => void;
}) {
  return (
    <nav className="absolute inset-x-0 bottom-0 z-40 flex items-center justify-between border-t border-slate-100 bg-white/95 px-10 pb-4 pt-3 backdrop-blur">
      <button
        type="button"
        className="grid h-11 w-11 place-items-center rounded-full text-indigo-600"
        aria-label="Trips"
      >
        <Globe2 className="h-6 w-6" />
      </button>
      <button
        type="button"
        onClick={onCreate}
        className="grid h-14 w-14 -translate-y-3 place-items-center rounded-full bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-rose-500 text-white shadow-lg shadow-indigo-500/40 transition hover:scale-105"
        aria-label="New trip"
      >
        <Plus className="h-6 w-6" />
      </button>
      <button
        type="button"
        onClick={onProfile}
        className="grid h-11 w-11 place-items-center rounded-full text-slate-400 hover:text-slate-700"
        aria-label="Profile"
      >
        <User className="h-6 w-6" />
      </button>
    </nav>
  );
}

function ProfileSheet({
  open,
  auth,
  onClose,
  onSignOut,
}: {
  open: boolean;
  auth: AuthState | null;
  onClose: () => void;
  onSignOut: () => void;
}) {
  if (!open) return null;
  const email = auth?.email ?? "you@example.com";
  const name = email.split("@")[0].split(/[._-]/)[0];
  return (
    <div
      className="absolute inset-0 z-50 flex items-end bg-slate-900/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full rounded-t-3xl bg-white p-6 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-300" />
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-lg font-bold text-white">
            {name.slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold capitalize text-slate-900">
              {name}
            </div>
            <div className="truncate text-xs text-slate-500">{email}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={onSignOut}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 py-3 text-sm font-semibold text-rose-600 hover:bg-rose-50"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </div>
  );
}
