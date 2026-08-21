// Format helpers that treat a booking's ISO wall-clock time as-is, ignoring the viewer's timezone,
// so a Tokyo trip shows Tokyo hours even when opened from Delhi.

export function wallTime(iso?: string): string {
  if (!iso) return "";
  const m = iso.match(/T(\d{2}):(\d{2})/);
  if (!m) return "";
  const h = Number(m[1]);
  const mi = m[2];
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${mi} ${ampm}`;
}

export function wallDayKey(iso?: string): string {
  if (!iso) return "unknown";
  const m = iso.match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : "unknown";
}

export function wallDayDate(iso?: string): Date | null {
  if (!iso) return null;
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

export function formatDayHeading(dayKey: string): string {
  const m = dayKey.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return "Unscheduled";
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function formatDateChip(d: Date): { weekday: string; day: string } {
  return {
    weekday: d.toLocaleDateString(undefined, { weekday: "short" }).toUpperCase(),
    day: String(d.getDate()),
  };
}

export function formatDateRange(startISO?: string, endISO?: string): string {
  const s = wallDayDate(startISO);
  const e = wallDayDate(endISO);
  if (!s && !e) return "";
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  if (s && e) return `${s.toLocaleDateString(undefined, opts)} — ${e.toLocaleDateString(undefined, opts)}`;
  if (s) return s.toLocaleDateString(undefined, opts);
  return e!.toLocaleDateString(undefined, opts);
}

export function isSameLocalDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function todayDayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
