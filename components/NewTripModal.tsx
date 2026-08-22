"use client";

import { useState } from "react";
import { MapPin, X } from "lucide-react";

const PRESETS = [
  "Tokyo — Oct 12–19",
  "Paris — Apr 4–10",
  "Iceland — Mar 17–24",
  "Bali — Nov 5–12",
  "Lisbon — May 8–15",
];

export function NewTripModal({
  open,
  onCancel,
  onCreate,
}: {
  open: boolean;
  onCancel: () => void;
  onCreate: (destination: string) => void;
}) {
  const [value, setValue] = useState("");
  if (!open) return null;

  function submit(destination: string) {
    const v = destination.trim();
    if (!v) return;
    onCreate(v);
    setValue("");
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-900/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-trip-title"
    >
      <div className="w-full max-w-sm overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl">
        <div className="flex items-start justify-between bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-rose-500 px-6 py-5 text-white">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/80">
              <MapPin className="h-3.5 w-3.5" /> New trip
            </div>
            <h3 id="new-trip-title" className="mt-2 text-lg font-semibold">
              Where are you going?
            </h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full p-1 text-white/80 hover:bg-white/10"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-6">
          <label
            className="text-[11px] font-semibold uppercase tracking-widest text-slate-500"
            htmlFor="dest"
          >
            Destination & dates
          </label>
          <input
            id="dest"
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit(value);
            }}
            autoFocus
            placeholder="e.g. Tokyo — Oct 12–19"
            className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500"
          />

          <div className="mt-4 flex flex-wrap gap-2">
            {PRESETS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => submit(s)}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600 hover:bg-slate-100"
              >
                {s}
              </button>
            ))}
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => submit(value)}
              disabled={!value.trim()}
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Create trip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
