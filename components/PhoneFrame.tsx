"use client";

import type { ReactNode } from "react";

// Renders a rounded iPhone-style bezel on desktop and a full-bleed viewport on real mobile.
export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.35),transparent_55%),radial-gradient(ellipse_at_bottom,_rgba(244,63,94,0.20),transparent_60%),#05060f] flex items-center justify-center p-0 sm:p-8">
      <div className="relative w-full max-w-md sm:rounded-[54px] sm:bg-slate-900 sm:p-2.5 sm:shadow-[0_50px_120px_-30px_rgba(99,102,241,0.55)] sm:ring-1 sm:ring-white/5">
        <main className="relative flex min-h-screen w-full flex-col overflow-hidden bg-white sm:min-h-[820px] sm:rounded-[44px]">
          <div className="pointer-events-none absolute left-1/2 top-2 z-40 hidden h-6 w-28 -translate-x-1/2 rounded-full bg-black sm:block" />
          {children}
          <div className="pointer-events-none absolute inset-x-0 bottom-1 z-40 mx-auto hidden h-1 w-28 rounded-full bg-slate-800/70 sm:block" />
        </main>
      </div>
    </div>
  );
}
