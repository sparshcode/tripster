"use client";

import { useState } from "react";
import { KeyRound, ShieldCheck } from "lucide-react";

export function ApiKeyPrompt({
  open,
  onCancel,
  onSubmit,
}: {
  open: boolean;
  onCancel: () => void;
  onSubmit: (key: string) => void;
}) {
  const [key, setKey] = useState("");
  if (!open) return null;

  function submit() {
    const trimmed = key.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setKey("");
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-900/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="api-key-title"
    >
      <div className="w-full max-w-sm overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl">
        <div className="bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-rose-500 px-6 py-5 text-white">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/80">
            <ShieldCheck className="h-3.5 w-3.5" /> Bring-your-own-key
          </div>
          <h3 id="api-key-title" className="mt-2 text-lg font-semibold">
            Enter your Anthropic API key
          </h3>
          <p className="mt-1 text-xs leading-5 text-white/85">
            Kept in this browser tab only. Sent over HTTPS to Claude. Never stored by Tripster.
          </p>
        </div>
        <div className="p-6">
          <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500" htmlFor="key">
            API key
          </label>
          <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-indigo-500 focus-within:bg-white">
            <KeyRound className="h-4 w-4 text-slate-400" />
            <input
              id="key"
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
              }}
              autoComplete="off"
              autoFocus
              spellCheck={false}
              placeholder="sk-ant-..."
              className="w-full bg-transparent text-sm text-slate-900 outline-none"
            />
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setKey("");
                onCancel();
              }}
              className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={!key.trim()}
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
