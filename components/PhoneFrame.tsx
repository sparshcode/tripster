"use client";

import type { ReactNode } from "react";

// iPhone-shaped bezel with an iOS-style status bar (time, notch, signal/wifi/battery).
export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="phone-backdrop flex min-h-screen items-center justify-center p-4">
      <div className="relative w-full max-w-[380px] rounded-[54px] bg-slate-950 p-[14px] shadow-2xl shadow-indigo-500/40 ring-1 ring-slate-800">
        <div className="pointer-events-none absolute -left-[3px] top-24 h-14 w-[3px] rounded-l-full bg-slate-800" />
        <div className="pointer-events-none absolute -left-[3px] top-44 h-20 w-[3px] rounded-l-full bg-slate-800" />
        <div className="pointer-events-none absolute -right-[3px] top-32 h-24 w-[3px] rounded-r-full bg-slate-800" />
        <main className="relative flex h-[780px] w-full flex-col overflow-hidden rounded-[42px] bg-white">
          <StatusBar />
          {children}
          <div className="pointer-events-none absolute inset-x-0 bottom-2 z-50 mx-auto h-1 w-32 rounded-full bg-slate-900/60" />
        </main>
      </div>
    </div>
  );
}

function StatusBar() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-50 flex h-11 items-center justify-between px-6 text-[13px] font-semibold text-slate-900">
      <span className="tabular-nums">9:41</span>
      <div className="h-6 w-24 rounded-full bg-slate-950" />
      <div className="flex items-center gap-1 text-slate-900">
        <SignalIcon />
        <WifiIcon />
        <BatteryIcon />
      </div>
    </div>
  );
}

function SignalIcon() {
  return (
    <svg viewBox="0 0 18 12" fill="currentColor" className="h-3">
      <rect x="0" y="8" width="3" height="4" rx="0.5" />
      <rect x="5" y="5" width="3" height="7" rx="0.5" />
      <rect x="10" y="2" width="3" height="10" rx="0.5" />
      <rect x="15" y="0" width="3" height="12" rx="0.5" />
    </svg>
  );
}

function WifiIcon() {
  return (
    <svg viewBox="0 0 16 12" fill="currentColor" className="h-3">
      <path d="M8 12l2-2a2.83 2.83 0 00-4 0l2 2z" />
      <path d="M8 8.5l3.5-3.5a4.95 4.95 0 00-7 0L8 8.5z" opacity="0.85" />
      <path d="M8 5.5l6-6a8.5 8.5 0 00-12 0l6 6z" opacity="0.6" />
    </svg>
  );
}

function BatteryIcon() {
  return (
    <svg viewBox="0 0 26 12" fill="none" className="h-3">
      <rect x="0.5" y="0.5" width="22" height="11" rx="2.5" stroke="currentColor" strokeOpacity="0.5" />
      <rect x="2" y="2" width="19" height="8" rx="1.5" fill="currentColor" />
      <rect x="23.5" y="4" width="2" height="4" rx="1" fill="currentColor" opacity="0.5" />
    </svg>
  );
}
