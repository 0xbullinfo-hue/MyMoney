'use client';

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="material-symbols-outlined text-4xl text-accent">error</span>
      <p className="text-sm text-on-surface-variant max-w-sm">
        Something glitched while rendering this view. Your data is safe — try again.
      </p>
      <button onClick={reset} className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-container transition-all cursor-pointer">
        Retry
      </button>
    </div>
  );
}
