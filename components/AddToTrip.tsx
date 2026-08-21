"use client";

import { useState } from "react";
import { Upload, FileText, Image as ImageIcon, Loader2 } from "lucide-react";
import type { ExtractPayload } from "@/lib/trip-types";

async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function AddToTrip({
  onExtract,
}: {
  onExtract: (payload: ExtractPayload) => Promise<void>;
}) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    setBusy(true);
    try {
      const base64 = await fileToBase64(file);
      if (file.type === "application/pdf") {
        await onExtract({ pdf: { base64 } });
      } else if (file.type.startsWith("image/")) {
        await onExtract({ images: [{ mediaType: file.type, base64 }] });
      } else {
        setError("Only PDFs and images are supported here. Paste text below for other formats.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function handleText() {
    const trimmed = text.trim();
    if (!trimmed) return;
    setError(null);
    setBusy(true);
    try {
      await onExtract({ text: trimmed });
      setText("");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
        <Upload className="h-4 w-4" /> Add to trip
      </div>
      <p className="mt-1 text-xs text-slate-500">
        Upload a PDF, screenshot, or paste a booking email. Claude will pull out the details.
      </p>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-600 hover:border-indigo-400">
          <FileText className="h-4 w-4" /> PDF
          <input
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = "";
            }}
          />
        </label>
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-600 hover:border-indigo-400">
          <ImageIcon className="h-4 w-4" /> Screenshot
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = "";
            }}
          />
        </label>
      </div>

      <div className="mt-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          placeholder="Or paste a confirmation email…"
          className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm outline-none focus:border-indigo-500"
        />
        <div className="mt-2 flex items-center justify-between">
          {error ? (
            <p className="text-xs text-rose-600">{error}</p>
          ) : (
            <span className="text-xs text-slate-400">Sent over HTTPS with your Claude key.</span>
          )}
          <button
            onClick={handleText}
            disabled={busy || !text.trim()}
            className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Add booking
          </button>
        </div>
      </div>
    </section>
  );
}
