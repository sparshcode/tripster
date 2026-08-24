"use client";

import { DEMO_TRIPS } from "./demo-trips";
import type { Trip } from "./trip-types";

const TRIPS_KEY = "tripster.trips.v1";
const LEGACY_SINGLE = "tripster.trip.v1";
const LEGACY_BRAIN = "tripbrain.trip.v1";
const DEMO_SEED_KEY = "tripster.demo-seed.v1";

function addDemoTripsOnce(trips: Trip[]): Trip[] {
  if (window.localStorage.getItem(DEMO_SEED_KEY)) return trips;

  const existingIds = new Set(trips.map((trip) => trip.id));
  const seeded = [
    ...trips,
    ...DEMO_TRIPS.filter((trip) => !existingIds.has(trip.id)),
  ];
  window.localStorage.setItem(TRIPS_KEY, JSON.stringify(seeded));
  window.localStorage.setItem(DEMO_SEED_KEY, "1");
  return seeded;
}

export function loadTrips(): Trip[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(TRIPS_KEY);
    if (raw) return addDemoTripsOnce(JSON.parse(raw) as Trip[]);
    const legacy =
      window.localStorage.getItem(LEGACY_SINGLE) ??
      window.localStorage.getItem(LEGACY_BRAIN);
    if (legacy) {
      const trip = JSON.parse(legacy) as Trip;
      const arr = [trip];
      window.localStorage.setItem(TRIPS_KEY, JSON.stringify(arr));
      window.localStorage.removeItem(LEGACY_SINGLE);
      window.localStorage.removeItem(LEGACY_BRAIN);
      return addDemoTripsOnce(arr);
    }
    return addDemoTripsOnce([]);
  } catch {
    return [];
  }
}

export function saveTrips(trips: Trip[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
}

export function clearAllTrips() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TRIPS_KEY);
  window.localStorage.removeItem(LEGACY_SINGLE);
  window.localStorage.removeItem(LEGACY_BRAIN);
  window.localStorage.removeItem(DEMO_SEED_KEY);
}

export function newTrip(destination: string): Trip {
  return {
    id: crypto.randomUUID(),
    destination,
    bookings: [],
  };
}
