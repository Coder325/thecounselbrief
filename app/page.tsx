import { Suspense } from "react";
import HomeContent from "./home-content";

function HomeFallback() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="border-b border-stone-200 pb-8 animate-pulse">
        <div className="h-4 w-36 rounded bg-stone-200" />
        <div className="mt-4 h-12 w-80 rounded bg-stone-200" />
        <div className="mt-3 h-5 w-96 rounded bg-stone-200" />
      </div>

      <section className="mt-10 space-y-6 animate-pulse">
        <div className="h-40 rounded-2xl bg-stone-200" />
        <div className="h-40 rounded-2xl bg-stone-200" />
      </section>
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<HomeFallback />}>
      <HomeContent />
    </Suspense>
  );
}