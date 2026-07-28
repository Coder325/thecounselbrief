import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SubscribeForm from "@/components/subscribe-form";

type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string | null;
  created_at: string;
  status: string;
  published: boolean;
};

export default async function HomeContent() {
  const supabase = await createClient();

  const { data: articles, error } = await supabase
    .from("articles")
    .select("id, title, slug, excerpt, category, created_at, status, published")
    .eq("published", true)
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <p className="text-sm text-red-700">Home query error: {error.message}</p>
        </div>
      </main>
    );
  }

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
                <Link href={`/articles/${article.slug}`} className="hover:text-red-700">
                  {article.title}
                </Link>
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

      <section className="mt-12 rounded-2xl border border-stone-200 bg-stone-50 p-8">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-red-700">
          Subscribe now
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-stone-950">
          Get legal updates by email
        </h2>
        <p className="mt-3 max-w-2xl text-stone-600">
          Enter your email to receive regular updates whenever new articles are published.
        </p>

        <div className="mt-6 max-w-md">
          <SubscribeForm />
        </div>
      </section>
    </main>
  );
}