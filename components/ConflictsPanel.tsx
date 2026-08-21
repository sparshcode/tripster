"use client";

import type { Conflict, Gap } from "@/lib/conflicts";

export function ConflictsPanel({
  conflicts,
  gaps,
}: {
  conflicts: Conflict[];
  gaps: Gap[];
}) {
  if (conflicts.length === 0 && gaps.length === 0) return null;

  return (
    <section className="space-y-2">
      {conflicts.map((c, i) => (
        <div
          key={`c${i}`}
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900"
        >
          <div className="font-semibold">🔴 Potential conflict</div>
          <div>{c.message}</div>
        </div>
      ))}
      {gaps.map((g, i) => (
        <div
          key={`g${i}`}
          className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          <div className="font-semibold">⚠️ Trip gap</div>
          <div>{g.message}</div>
        </div>
      ))}
    </section>
  );
}
