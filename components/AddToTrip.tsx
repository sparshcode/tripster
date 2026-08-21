"use client";

import { useState } from "react";
import {
  FileText,
  Image as ImageIcon,
  Loader2,
  ShieldCheck,
  Upload,
} from "lucide-react";
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
        setError("PDF or image only here. Paste the text below for other formats.");
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
    <div className="px-5 py-5">
      <div className="flex items-center gap-2">
        <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white">
          <Upload className="h-4 w-4" />
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-900">Add to trip</div>
          <div className="text-[11px] text-slate-500">
            Claude reads the details and files them for you.
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <UploadCard
          label="PDF"
          hint="Confirmation letter"
          accept="application/pdf"
          Icon={FileText}
          tone="from-sky-500 to-indigo-500"
          onFile={handleFile}
        />
        <UploadCard
          label="Screenshot"
          hint="Image of a booking"
          accept="image/*"
          Icon={ImageIcon}
          tone="from-fuchsia-500 to-rose-500"
          onFile={handleFile}
        />
      </div>

      <div className="mt-4 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
        <div className="text-xs font-semibold text-slate-500">Paste text</div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          placeholder="Paste a confirmation email, itinerary, or note…"
          className="mt-1 w-full resize-none rounded-xl border border-transparent bg-slate-50 p-3 text-sm outline-none focus:border-indigo-400 focus:bg-white"
        />
        <div className="mt-2 flex items-center justify-between">
          <span className="flex items-center gap-1 text-[10px] font-medium text-slate-400">
            <ShieldCheck className="h-3 w-3" /> Sent over HTTPS with your Claude key.
          </span>
          <button
            type="button"
            onClick={handleText}
            disabled={busy || !text.trim()}
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Extract
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
          {error}
        </div>
      )}
    </div>
  );
}

function UploadCard({
  label,
  hint,
  accept,
  Icon,
  tone,
  onFile,
}: {
  label: string;
  hint: string;
  accept: string;
  Icon: React.ComponentType<{ className?: string }>;
  tone: string;
  onFile: (file: File) => void;
}) {
  return (
    <label className="group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-center shadow-sm transition hover:border-indigo-400">
      <div
        className={`grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br ${tone} text-white shadow`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="text-sm font-semibold text-slate-900">{label}</div>
      <div className="text-[11px] text-slate-500">{hint}</div>
      <input
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = "";
        }}
      />
    </label>
  );
}
