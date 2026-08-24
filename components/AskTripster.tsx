"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Send } from "lucide-react";
import clsx from "clsx";
import { TripsterLogo } from "./TripsterLogo";

export type ChatTurn = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "What am I doing tomorrow?",
  "Have I booked airport transport?",
  "Which bookings can I cancel?",
  "How much free time on Oct 13?",
];

export function AskTripster({
  turns,
  onAsk,
  busy,
}: {
  turns: ChatTurn[];
  onAsk: (question: string) => Promise<void>;
  busy: boolean;
}) {
  const [q, setQ] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [turns.length]);

  async function send(question: string) {
    if (!question.trim() || busy) return;
    setQ("");
    await onAsk(question.trim());
  }

  return (
    <div className="flex h-full min-h-0 flex-col px-5 pb-3 pt-5">
      <div className="flex shrink-0 items-center gap-2">
        <TripsterLogo size={32} className="rounded-lg" />
        <div>
          <div className="text-sm font-semibold text-slate-900">Ask Tripster</div>
          <div className="text-[11px] text-slate-500">
            Answers only from bookings you&apos;ve added.
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className={clsx(
          "no-scrollbar mt-4 min-h-0 flex-1 overflow-y-auto",
          turns.length > 0 &&
            "space-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-3"
        )}
      >
        {turns.length === 0 ? (
          <div className="space-y-2">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
            Try asking
          </div>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => send(s)}
              disabled={busy}
              className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm text-slate-700 shadow-sm hover:border-indigo-300 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span>{s}</span>
              <Send className="h-3.5 w-3.5 text-slate-400" />
            </button>
          ))}
          </div>
        ) : (
          <>
          {turns.map((t, i) => (
            <div
              key={i}
              className={clsx(
                "max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow-sm",
                t.role === "user"
                  ? "ml-auto bg-slate-900 text-white"
                  : "mr-auto bg-white text-slate-800"
              )}
            >
              <div className="whitespace-pre-wrap">{t.content}</div>
            </div>
          ))}
          {busy && (
            <div className="mr-auto flex max-w-[85%] items-center gap-2 rounded-2xl bg-white px-3 py-2 text-xs text-slate-500 shadow-sm">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking…
            </div>
          )}
          </>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2 pt-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") send(q);
          }}
          placeholder="Ask about your trip…"
          className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500"
        />
        <button
          type="button"
          onClick={() => send(q)}
          disabled={busy || !q.trim()}
          className="grid h-10 w-10 place-items-center rounded-full bg-slate-900 text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Send"
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}
