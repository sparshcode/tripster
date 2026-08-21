"use client";

export function EmptyState({
  onCreate,
}: {
  onCreate: (destination: string) => void;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <div className="text-3xl">🧠✈️</div>
      <h2 className="mt-3 text-xl font-semibold text-slate-900">
        Your trip, in one brain.
      </h2>
      <p className="mt-2 text-sm text-slate-600">
        Trip Brain turns bookings scattered across email, PDFs, and screenshots into a
        single travel assistant that answers questions and spots problems.
      </p>
      <div className="mt-5 flex justify-center">
        <button
          onClick={() => {
            const value = window.prompt("Where are you going? (e.g. Tokyo — Oct 12–19)");
            if (value?.trim()) onCreate(value.trim());
          }}
          className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          Start a trip
        </button>
      </div>
    </section>
  );
}
