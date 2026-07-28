import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-20">
      <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-red-700">
          Access restricted
        </p>

        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-stone-950">
          Sorry, you don’t have access :/
        </h1>

        <p className="mt-4 text-base leading-7 text-stone-600">
          This dashboard is reserved for editors and administrators.
        </p>

        <p className="mt-3 text-base leading-7 text-stone-600">
          However, we’re always recruiting talented writers. If you’d like to
          contribute to The Counsel Brief, send us an email at{" "}
          <a
            href="mailto:editors@thecounselbrief.com"
            className="font-medium text-red-700 underline decoration-red-200 underline-offset-4"
          >
            editors@thecounselbriefs.com
          </a>
          .
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-red-700"
          >
            Back to home
          </Link>

          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-stone-300 px-5 py-3 text-sm font-medium text-stone-800 transition hover:border-red-300 hover:text-red-700"
          >
            Read articles
          </Link>
        </div>
      </div>
    </main>
  );
}