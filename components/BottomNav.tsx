"use client";

import clsx from "clsx";
import { LayoutGrid, List, Sparkles, Plus, type LucideIcon } from "lucide-react";

export type Tab = "overview" | "itinerary" | "ask" | "add";

const TABS: { id: Tab; label: string; Icon: LucideIcon }[] = [
  { id: "overview", label: "Overview", Icon: LayoutGrid },
  { id: "itinerary", label: "Itinerary", Icon: List },
  { id: "ask", label: "Ask", Icon: Sparkles },
  { id: "add", label: "Add", Icon: Plus },
];

export function BottomNav({
  current,
  onChange,
}: {
  current: Tab;
  onChange: (tab: Tab) => void;
}) {
  return (
    <div className="border-t border-slate-100 bg-white/95 p-2 backdrop-blur">
      <ul className="mx-auto grid max-w-md grid-cols-4 gap-1">
        {TABS.map(({ id, label, Icon }) => {
          const active = id === current;
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => onChange(id)}
                className={clsx(
                  "flex w-full flex-col items-center gap-0.5 rounded-2xl py-2 text-[10px] font-semibold transition",
                  active
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-500 hover:bg-slate-100"
                )}
              >
                <Icon
                  className={clsx(
                    "h-4 w-4",
                    active ? "text-white" : "text-slate-500"
                  )}
                />
                {label}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
