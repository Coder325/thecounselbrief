import { Suspense } from "react";
import ArticlePageContent from "./page-content";

type PageProps = {
  params: Promise<{ slug: string }>;
};

function ArticleFallback() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <div className="animate-pulse">
        <div className="h-4 w-32 rounded bg-stone-200" />
        <div className="mt-4 h-10 w-3/4 rounded bg-stone-200" />
        <div className="mt-3 h-5 w-1/2 rounded bg-stone-200" />
        <div className="mt-10 space-y-3">
          <div className="h-4 w-full rounded bg-stone-200" />
          <div className="h-4 w-full rounded bg-stone-200" />
          <div className="h-4 w-5/6 rounded bg-stone-200" />
        </div>
      </div>
    </main>
  );
}

export default function ArticlePage({ params }: PageProps) {
  return (
    <Suspense fallback={<ArticleFallback />}>
      <ArticlePageContent params={params} />
    </Suspense>
  );
}