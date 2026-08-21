import type { Booking } from "./trip-types";

export type Conflict = {
  kind: "overlap" | "tight";
  a: Booking;
  b: Booking;
  message: string;
};

export type Gap = {
  date: string;
  from: string;
  to: string;
  hours: number;
  message: string;
};

function toDate(value?: string): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function findConflicts(bookings: Booking[]): Conflict[] {
  const timed = bookings
    .map((b) => ({
      b,
      start: toDate(b.startDatetime),
      end: toDate(b.endDatetime),
    }))
    .filter((x): x is { b: Booking; start: Date; end: Date | null } => x.start !== null);

  timed.sort((x, y) => x.start.getTime() - y.start.getTime());

  const results: Conflict[] = [];
  for (let i = 0; i < timed.length; i += 1) {
    for (let j = i + 1; j < timed.length; j += 1) {
      const a = timed[i];
      const b = timed[j];
      const aEnd = a.end ?? a.start;
      const gapMinutes = (b.start.getTime() - aEnd.getTime()) / 60000;
      if (gapMinutes < 0) {
        results.push({
          kind: "overlap",
          a: a.b,
          b: b.b,
          message: `${a.b.title} overlaps with ${b.b.title}.`,
        });
      } else if (gapMinutes < 30 && isoDate(a.start) === isoDate(b.start)) {
        results.push({
          kind: "tight",
          a: a.b,
          b: b.b,
          message: `Only ${Math.round(gapMinutes)} min between ${a.b.title} and ${b.b.title}.`,
        });
      }
    }
  }
  return results;
}

export function findGaps(bookings: Booking[]): Gap[] {
  const byDay = new Map<string, { b: Booking; start: Date; end: Date }[]>();
  for (const b of bookings) {
    const start = toDate(b.startDatetime);
    if (!start) continue;
    const end = toDate(b.endDatetime) ?? start;
    const day = isoDate(start);
    const list = byDay.get(day) ?? [];
    list.push({ b, start, end });
    byDay.set(day, list);
  }

  const gaps: Gap[] = [];
  for (const [day, items] of byDay) {
    items.sort((x, y) => x.start.getTime() - y.start.getTime());
    for (let i = 0; i < items.length - 1; i += 1) {
      const cur = items[i];
      const next = items[i + 1];
      const hours = (next.start.getTime() - cur.end.getTime()) / 3_600_000;
      if (hours >= 4) {
        gaps.push({
          date: day,
          from: cur.end.toISOString(),
          to: next.start.toISOString(),
          hours: Math.round(hours * 10) / 10,
          message: `${hours.toFixed(1)}h free between ${cur.b.title} and ${next.b.title}.`,
        });
      }
    }
  }
  return gaps;
}
