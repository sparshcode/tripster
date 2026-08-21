"use client";

import { useState } from "react";

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
      className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="api-key-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <h3 id="api-key-title" className="text-lg font-semibold text-slate-900">
          Enter your Anthropic API key
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Trip Brain calls Claude with your key. It stays in this browser tab, is sent over
          HTTPS, and is never stored by the app.
        </p>
        <label className="mt-5 block text-sm font-medium text-slate-700" htmlFor="key">
          API key
        </label>
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
          className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500"
        />
        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              setKey("");
              onCancel();
            }}
            className="rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!key.trim()}
            className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
