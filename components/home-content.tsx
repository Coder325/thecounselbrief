import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import SubscribeForm from "@/components/subscribe-form";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string | null;
  created_at: string;
};

async function getArticles() {
  "use cache";

  const { data, error } = await supabase
    .from("articles")
    .select("id, title, slug, excerpt, category, created_at")
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(6);

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export default async function HomeContent() {
  const articles = await getArticles();

  const featured = articles[0];
  const latest = articles.slice(1);

  return (
    <>
      <section className="grid gap-10 border-b border-stone-200 pb-10 lg:grid-cols-[1.4fr_0.8fr]">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-red-700">
            The Counsel Brief
          </p>
          <h1 className="mt-4 max-w-3xl text-5xl font-semibold tracking-tight text-stone-950">
            Sharp legal analysis, case updates, and policy commentary.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-600">
            A modern legal publication covering corporate, criminal, public law,
            courts, regulation, and the policy shifts that shape them.
          </p>
        </div>

        <aside className="rounded-2xl border border-stone-200 bg-white p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">
            Subscribe
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-stone-950">
            Get the week’s clearest legal briefing.
          </h2>
          <p className="mt-3 text-sm leading-6 text-stone-600">
            Join readers who want concise legal updates without noise.
          </p>
          <div className="mt-5">
            <SubscribeForm />
          </div>
        </aside>
      </section>

      {featured && (
        <section className="grid gap-8 border-b border-stone-200 py-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-red-700">
              Featured analysis
            </p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight text-stone-950">
              <Link href={`/articles/${featured.slug}`}>{featured.title}</Link>
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-stone-600">
              {featured.excerpt}
            </p>
            <Link
              href={`/articles/${featured.slug}`}
              className="mt-6 inline-flex rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-red-700"
            >
              Read article
            </Link>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-stone-100 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">
              Focus
            </p>
            <ul className="mt-4 space-y-3 text-sm text-stone-700">
              <li>Criminal law and sentencing</li>
              <li>Judicial decisions and appellate developments</li>
              <li>Corporate liability and compliance</li>
              <li>AI, regulation, and legal technology</li>
            </ul>
          </div>
        </section>
      )}

      <section className="py-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-stone-500">
              Latest
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">
              Recent articles
            </h2>
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {latest.map((article: Article) => (
            <article
              key={article.id}
              className="rounded-2xl border border-stone-200 bg-white p-6 transition hover:border-red-300"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-700">
                {article.category ?? "Legal analysis"}
              </p>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight text-stone-950">
                <Link href={`/articles/${article.slug}`}>{article.title}</Link>
              </h3>
              <p className="mt-3 text-sm leading-6 text-stone-600">
                {article.excerpt}
              </p>
              <Link
                href={`/articles/${article.slug}`}
                className="mt-5 inline-flex text-sm font-medium text-stone-950 hover:text-red-700"
              >
                Continue reading
              </Link>
            </article>
          ))}

          {latest.length === 0 && (
            <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-8">
              <h3 className="text-xl font-semibold text-stone-950">
                No published articles yet
              </h3>
              <p className="mt-3 text-sm leading-6 text-stone-600">
                Your homepage is ready. Once you publish your first article, it
                will appear here automatically.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}