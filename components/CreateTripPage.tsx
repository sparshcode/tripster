"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import {
  ArrowLeft,
  Calendar,
  FileText,
  Image as ImageIcon,
  Loader2,
  MapPin,
  Paperclip,
  X,
} from "lucide-react";
import type { ExtractPayload } from "@/lib/trip-types";

const COUNTRIES: { name: string; flag: string }[] = [
  { name: "Japan", flag: "🇯🇵" },
  { name: "France", flag: "🇫🇷" },
  { name: "Italy", flag: "🇮🇹" },
  { name: "Spain", flag: "🇪🇸" },
  { name: "Iceland", flag: "🇮🇸" },
  { name: "Greece", flag: "🇬🇷" },
  { name: "United Kingdom", flag: "🇬🇧" },
  { name: "United States", flag: "🇺🇸" },
  { name: "Indonesia", flag: "🇮🇩" },
  { name: "Thailand", flag: "🇹🇭" },
  { name: "Singapore", flag: "🇸🇬" },
  { name: "Portugal", flag: "🇵🇹" },
  { name: "Netherlands", flag: "🇳🇱" },
  { name: "Norway", flag: "🇳🇴" },
  { name: "Switzerland", flag: "🇨🇭" },
  { name: "United Arab Emirates", flag: "🇦🇪" },
  { name: "South Korea", flag: "🇰🇷" },
  { name: "India", flag: "🇮🇳" },
];

export type PendingAttachment = {
  name: string;
  sizeKb: number;
  kind: "pdf" | "image";
  mediaType: string;
  base64: string;
};

async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function formatShort(iso: string): string {
  if (!iso) return "";
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return "";
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function CreateTripPage({
  onBack,
  onCreate,
}: {
  onBack: () => void;
  onCreate: (input: {
    destination: string;
    attachments: ExtractPayload[];
  }) => void;
}) {
  const [country, setCountry] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
  const [readingFile, setReadingFile] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canCreate = country.trim().length > 1;

  const suggestions = useMemo(() => {
    const q = country.trim().toLowerCase();
    if (!q) return COUNTRIES.slice(0, 6);
    return COUNTRIES.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 6);
  }, [country]);

  const destinationPreview = useMemo(() => {
    const parts: string[] = [];
    if (country.trim()) parts.push(country.trim());
    const s = formatShort(startDate);
    const e = formatShort(endDate);
    const range = s && e ? `${s}–${e}` : s || e;
    if (range) parts.push(range);
    return parts.join(" — ");
  }, [country, startDate, endDate]);

  async function addFile(file: File) {
    setError(null);
    if (attachments.length >= 8) {
      setError("You can attach up to 8 files. Add more from the trip's Add tab.");
      return;
    }
    const isPdf = file.type === "application/pdf";
    const isImage = file.type.startsWith("image/");
    if (!isPdf && !isImage) {
      setError("Only PDFs and images are supported.");
      return;
    }
    setReadingFile(true);
    try {
      const base64 = await fileToBase64(file);
      setAttachments((prev) => [
        ...prev,
        {
          name: file.name,
          sizeKb: Math.max(1, Math.round(file.size / 1024)),
          kind: isPdf ? "pdf" : "image",
          mediaType: file.type,
          base64,
        },
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setReadingFile(false);
    }
  }

  function removeAttachment(index: number) {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }

  function submit() {
    if (!canCreate) return;
    const destination = destinationPreview || country.trim();
    const payloads: ExtractPayload[] = attachments.map((a) =>
      a.kind === "pdf"
        ? { pdf: { base64: a.base64 } }
        : { images: [{ mediaType: a.mediaType, base64: a.base64 }] }
    );
    onCreate({ destination, attachments: payloads });
  }

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-white">
      <div className="flex items-center gap-3 border-b border-slate-100 bg-white px-5 pb-4 pt-14">
        <button
          type="button"
          onClick={onBack}
          className="grid h-9 w-9 place-items-center rounded-full text-slate-700 hover:bg-slate-100"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-slate-900">New trip</h1>
          <p className="text-[11px] text-slate-500">
            Add destination and drop in your bookings.
          </p>
        </div>
      </div>

      <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-40 pt-4">
        <section>
          <Label icon={MapPin}>Destination</Label>
          <input
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="Country or city"
            className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {suggestions.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => setCountry(c.name)}
                className={clsx(
                  "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition",
                  country.toLowerCase() === c.name.toLowerCase()
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                )}
              >
                <span aria-hidden>{c.flag}</span> {c.name}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-6 grid grid-cols-2 gap-3">
          <div>
            <Label icon={Calendar}>Start date</Label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <Label icon={Calendar}>End date</Label>
            <input
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
            />
          </div>
        </section>

        <section className="mt-6">
          <Label icon={Paperclip}>Attachments</Label>
          <p className="mt-1 text-[11px] leading-4 text-slate-500">
            PDFs, screenshots, confirmation emails. Claude will extract the
            details after you create the trip.
          </p>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <UploadTile
              label="PDF"
              hint="Confirmation letter"
              accept="application/pdf"
              tone="from-sky-500 to-indigo-500"
              Icon={FileText}
              onFile={addFile}
              disabled={readingFile}
            />
            <UploadTile
              label="Image"
              hint="Screenshot or photo"
              accept="image/*"
              tone="from-fuchsia-500 to-rose-500"
              Icon={ImageIcon}
              onFile={addFile}
              disabled={readingFile}
            />
          </div>

          {attachments.length > 0 && (
            <ul className="mt-4 space-y-2">
              {attachments.map((a, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <div
                      className={clsx(
                        "grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white",
                        a.kind === "pdf"
                          ? "bg-gradient-to-br from-sky-500 to-indigo-500"
                          : "bg-gradient-to-br from-fuchsia-500 to-rose-500"
                      )}
                    >
                      {a.kind === "pdf" ? (
                        <FileText className="h-4 w-4" />
                      ) : (
                        <ImageIcon className="h-4 w-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-slate-900">
                        {a.name}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {a.kind.toUpperCase()} · {a.sizeKb} KB
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAttachment(i)}
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-slate-400 hover:bg-white hover:text-rose-500"
                    aria-label={`Remove ${a.name}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {readingFile && (
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Reading file…
            </div>
          )}

          {error && (
            <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {error}
            </div>
          )}
        </section>

        {destinationPreview && (
          <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              Preview
            </div>
            <div className="mt-0.5 text-sm font-semibold text-slate-900">
              {destinationPreview}
            </div>
          </div>
        )}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 flex justify-center bg-gradient-to-t from-white via-white/95 to-transparent px-5 pb-6 pt-8">
        <button
          type="button"
          onClick={submit}
          disabled={!canCreate}
          className="pointer-events-auto w-full rounded-full bg-slate-900 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/30 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {attachments.length > 0
            ? `Create trip & extract ${attachments.length} ${attachments.length === 1 ? "file" : "files"}`
            : "Create trip"}
        </button>
      </div>
    </div>
  );
}

function Label({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
      <Icon className="h-3 w-3" /> {children}
    </div>
  );
}

function UploadTile({
  label,
  hint,
  accept,
  tone,
  Icon,
  onFile,
  disabled,
}: {
  label: string;
  hint: string;
  accept: string;
  tone: string;
  Icon: React.ComponentType<{ className?: string }>;
  onFile: (file: File) => void;
  disabled: boolean;
}) {
  return (
    <label
      className={clsx(
        "group flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-center shadow-sm transition hover:border-indigo-400",
        disabled && "cursor-not-allowed opacity-50"
      )}
    >
      <div
        className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${tone} text-white shadow`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="text-sm font-semibold text-slate-900">{label}</div>
      <div className="text-[11px] text-slate-500">{hint}</div>
      <input
        type="file"
        accept={accept}
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = "";
        }}
      />
    </label>
  );
}
