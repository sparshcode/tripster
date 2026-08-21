"use client";

import { useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";

const SUGGESTIONS = [
  "Tokyo — Oct 12–19",
  "Paris — Apr 4–10",
  "Iceland — Mar 17–24",
];

export function EmptyState({
  onCreate,
}: {
  onCreate: (destination: string) => void;
}) {
  const [value, setValue] = useState("");

  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    const v = value.trim();
    if (!v) return;
    onCreate(v);
  }

  return (
    <div className="flex flex-1 flex-col items-center px-6 pb-10 pt-12 text-center">
      <div className="grid h-24 w-24 place-items-center rounded-3xl bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-rose-500 text-4xl shadow-xl shadow-indigo-500/30">
        🧠
      </div>
      <div className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-indigo-600">
        <Sparkles className="h-3 w-3" /> Trip Brain
      </div>
      <h2 className="mt-3 text-2xl font-bold leading-tight text-slate-900">
        Your trip, in one brain.
      </h2>
      <p className="mt-3 max-w-xs text-sm leading-6 text-slate-600">
        Drop in bookings, PDFs, and screenshots. Get one assistant that knows what
        you booked, spots conflicts, and answers questions.
      </p>

      <form onSubmit={submit} className="mt-8 w-full max-w-xs">
        <label className="text-left text-xs font-semibold uppercase tracking-widest text-slate-500">
          Where to?
        </label>
        <div className="mt-1 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 focus-within:border-indigo-500">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="e.g. Tokyo — Oct 12–19"
            className="w-full bg-transparent text-sm text-slate-900 outline-none"
          />
          <button
            type="submit"
            disabled={!value.trim()}
            className="grid h-8 w-8 place-items-center rounded-full bg-slate-900 text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Start trip"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </form>

      <div className="mt-6 flex w-full max-w-xs flex-wrap justify-center gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onCreate(s)}
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 hover:bg-slate-100"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
