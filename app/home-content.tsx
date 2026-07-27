import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string | null;
  created_at: string;
};

export default async function HomeContent() {
  const supabase = await createClient();

  const { data: articles } = await supabase
    .from("articles")
    .select("id, title, slug, excerpt, category, created_at")
    .eq("published", true)
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="border-b border-stone-200 pb-8">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-red-700">
          Legal publication
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-stone-950">
          The Counsel Brief
        </h1>
        <p className="mt-3 max-w-2xl text-stone-600">
          Clear reporting, commentary, and legal analysis.
        </p>
      </div>

      <section className="mt-10 space-y-6">
        {articles && articles.length > 0 ? (
          articles.map((article: Article) => (
            <article
              key={article.id}
              className="rounded-2xl border border-stone-200 bg-white p-6"
            >
              <p className="text-xs uppercase tracking-[0.16em] text-red-700">
                {article.category || "Legal news"}
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-stone-950">
                <Link href={`/articles/${article.slug}`}>{article.title}</Link>
              </h2>
              <p className="mt-3 text-stone-600">
                {article.excerpt || "No excerpt yet."}
              </p>
            </article>
          ))
        ) : (
          <div className="rounded-2xl border border-stone-200 bg-white p-6">
            <p className="text-stone-600">No published articles yet.</p>
          </div>
        )}
      </section>
    </main>
  );
}