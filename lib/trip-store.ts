"use client";

import type { Trip } from "./trip-types";

const KEY = "tripbrain.trip.v1";

export function loadTrip(): Trip | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Trip;
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
}

export function newTrip(destination: string): Trip {
  return {
    id: crypto.randomUUID(),
    destination,
    bookings: [],
  };
}
