import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="font-mono text-5xl font-bold text-primary">404</span>
      <p className="text-sm text-on-surface-variant max-w-sm">
        This page drifted out of your ledger. Let&apos;s get you back to your money.
      </p>
      <Link href="/dashboard" className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-container transition-all">
        Back to Overview
      </Link>
    </div>
  );
}
