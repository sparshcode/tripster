"use client";

import { AlertTriangle, Clock } from "lucide-react";
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
    <div className="space-y-2">
      {conflicts.map((c, i) => (
        <div
          key={`c${i}`}
          className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900"
        >
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-rose-500 text-white">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-rose-600">
              Potential conflict
            </div>
            <div className="mt-0.5 font-medium">{c.message}</div>
          </div>
        </div>
      ))}
      {gaps.map((g, i) => (
        <div
          key={`g${i}`}
          className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"
        >
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-amber-500 text-white">
            <Clock className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-amber-700">
              Trip gap
            </div>
            <div className="mt-0.5 font-medium">{g.message}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
