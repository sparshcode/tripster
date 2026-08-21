"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";

export type ChatTurn = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "What am I doing tomorrow?",
  "Have I booked airport transport?",
  "Which bookings can I cancel?",
];

export function AskTripBrain({
  turns,
  onAsk,
  disabled,
  busy,
}: {
  turns: ChatTurn[];
  onAsk: (question: string) => Promise<void>;
  disabled: boolean;
  busy: boolean;
}) {
  const [q, setQ] = useState("");

  async function send(question: string) {
    if (!question.trim() || busy) return;
    setQ("");
    await onAsk(question.trim());
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-sm font-semibold text-slate-900">Ask Trip Brain</div>
      <p className="mt-1 text-xs text-slate-500">
        Answers use only the bookings you have added.
      </p>

      {turns.length === 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              disabled={disabled || busy}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {turns.length > 0 && (
        <div className="mt-3 max-h-72 space-y-3 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm">
          {turns.map((t, i) => (
            <div key={i} className={t.role === "user" ? "text-slate-700" : "text-slate-900"}>
              <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                {t.role === "user" ? "You" : "Trip Brain"}
              </div>
              <div className="whitespace-pre-wrap">{t.content}</div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") send(q);
          }}
          placeholder="Ask about your trip…"
          disabled={disabled}
          className="flex-1 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm outline-none focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
        />
        <button
          onClick={() => send(q)}
          disabled={disabled || busy || !q.trim()}
          className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />} Ask
        </button>
      </div>
    </section>
  );
}
