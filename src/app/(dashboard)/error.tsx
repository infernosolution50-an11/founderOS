"use client";

export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen bg-os-bg p-8 text-os-text">
      <div className="rounded-3xl border border-os-border bg-os-surface p-6">
        <h1 className="font-display text-2xl font-bold text-os-red">FounderOS hit an error</h1>
        <p className="mt-3 text-os-sub">{error.message}</p>
        <button type="button" onClick={reset} className="mt-5 rounded-xl bg-os-indigo px-4 py-2 font-semibold text-white">
          Try again
        </button>
      </div>
    </div>
  );
}
