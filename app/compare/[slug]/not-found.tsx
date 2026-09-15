import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">
      <h2 className="text-3xl font-semibold text-slate-900">Comparison not found</h2>
      <p className="mt-4 max-w-md text-slate-600">The comparison you requested could not be found. Return to the compare hub and browse available reviews.</p>
      <Link href="/compare" className="mt-6 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700">
        Back to comparisons
      </Link>
    </div>
  );
}
