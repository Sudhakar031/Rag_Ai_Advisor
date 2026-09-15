import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function RootNotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
          404 Error
        </span>
        <h1 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
          Page Not Found
        </h1>
        <p className="mt-3 max-w-md text-sm sm:text-base text-slate-600 leading-relaxed">
          The page you are looking for might have been moved, renamed, or does not exist. Explore our comparison directory or return home.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
          >
            Go to Homepage
          </Link>
          <Link
            href="/compare"
            className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
          >
            Browse 16 Competitor Comparisons
          </Link>
          <Link
            href="/contact"
            className="rounded-xl border border-slate-200 bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Contact Support
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
