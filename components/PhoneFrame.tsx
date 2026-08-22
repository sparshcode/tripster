"use client";

import type { ReactNode } from "react";

// iPhone-shaped bezel: tall 9:19.5 aspect, visible dynamic island and home indicator.
export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="phone-backdrop flex min-h-screen items-center justify-center p-4">
      <div className="relative w-full max-w-[380px] rounded-[54px] bg-slate-950 p-[14px] shadow-2xl shadow-indigo-500/40 ring-1 ring-slate-800">
        <div className="pointer-events-none absolute -left-[3px] top-24 h-14 w-[3px] rounded-l-full bg-slate-800" />
        <div className="pointer-events-none absolute -left-[3px] top-44 h-20 w-[3px] rounded-l-full bg-slate-800" />
        <div className="pointer-events-none absolute -right-[3px] top-32 h-24 w-[3px] rounded-r-full bg-slate-800" />
        <main className="relative flex h-[780px] w-full flex-col overflow-hidden rounded-[42px] bg-white">
          <div className="pointer-events-none absolute left-1/2 top-3 z-50 flex h-7 w-32 -translate-x-1/2 items-center justify-end gap-1.5 rounded-full bg-slate-950 pr-2">
            <div className="h-1.5 w-1.5 rounded-full bg-slate-700" />
          </div>
          {children}
          <div className="pointer-events-none absolute inset-x-0 bottom-2 z-50 mx-auto h-1 w-32 rounded-full bg-slate-900/60" />
        </main>
      </div>
    </div>
  );
}
