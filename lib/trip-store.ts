"use client";

import type { Trip } from "./trip-types";

const KEY = "tripster.trip.v1";
const LEGACY_KEY = "tripbrain.trip.v1";

export function loadTrip(): Trip | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Trip;
    const legacy = window.localStorage.getItem(LEGACY_KEY);
    if (!legacy) return null;
    window.localStorage.setItem(KEY, legacy);
    window.localStorage.removeItem(LEGACY_KEY);
    return JSON.parse(legacy) as Trip;
  } catch {
    return null;
  }
}

export function saveTrip(trip: Trip) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(trip));
}

export function clearTrip() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
  window.localStorage.removeItem(LEGACY_KEY);
}

export function newTrip(destination: string): Trip {
  return {
    id: crypto.randomUUID(),
    destination,
    bookings: [],
  };
}
