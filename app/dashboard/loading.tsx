export default function LoadingDashboard() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="animate-pulse">
        <div className="border-b border-stone-200 pb-8">
          <div className="h-4 w-32 rounded bg-stone-200" />
          <div className="mt-4 h-10 w-72 rounded bg-stone-200" />
          <div className="mt-3 h-5 w-96 rounded bg-stone-200" />
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="h-32 rounded-2xl bg-stone-200" />
          <div className="h-32 rounded-2xl bg-stone-200" />
          <div className="h-32 rounded-2xl bg-stone-200" />
        </div>

        <div className="mt-10 rounded-2xl bg-stone-200 h-80" />
      </div>
    </main>
  );
}