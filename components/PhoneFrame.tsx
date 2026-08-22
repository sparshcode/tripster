"use client";

import type { ReactNode } from "react";

// A rounded iPhone-style bezel that scales down gracefully on small viewports.
export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="phone-backdrop flex min-h-screen items-center justify-center p-3 sm:p-8">
      <div className="relative w-full max-w-md rounded-[52px] bg-slate-800 p-3 shadow-2xl shadow-indigo-500/30 ring-2 ring-slate-700/80">
        <main className="relative flex min-h-[720px] w-full flex-col overflow-hidden rounded-[40px] bg-white shadow-inner ring-1 ring-black/10 sm:min-h-[820px]">
          <div className="pointer-events-none absolute left-1/2 top-2.5 z-50 h-6 w-28 -translate-x-1/2 rounded-full bg-slate-900" />
          {children}
          <div className="pointer-events-none absolute inset-x-0 bottom-2 z-50 mx-auto h-1 w-24 rounded-full bg-slate-900/40" />
        </main>
      </div>
    </div>
  );
}
