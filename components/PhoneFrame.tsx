"use client";

import type { ReactNode } from "react";

// Renders a rounded iPhone-style bezel on desktop and a full-bleed viewport on real mobile.
export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="phone-backdrop flex min-h-screen items-center justify-center p-0 sm:p-8">
      <div className="relative w-full max-w-md sm:rounded-[54px] sm:bg-slate-800 sm:p-3.5 sm:shadow-2xl sm:shadow-indigo-500/30 sm:ring-2 sm:ring-slate-700/80">
        <main className="relative flex min-h-screen w-full flex-col overflow-hidden bg-white sm:min-h-[820px] sm:rounded-[42px] sm:shadow-inner sm:ring-1 sm:ring-black/10">
          <div className="pointer-events-none absolute left-1/2 top-2.5 z-50 hidden h-7 w-32 -translate-x-1/2 rounded-full bg-slate-900 sm:block" />
          {children}
          <div className="pointer-events-none absolute inset-x-0 bottom-2 z-50 mx-auto hidden h-1 w-28 rounded-full bg-slate-900/40 sm:block" />
        </main>
      </div>
    </div>
  );
}
