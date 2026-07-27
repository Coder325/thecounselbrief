import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardContent() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, full_name")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <h1 className="text-2xl font-semibold text-stone-950">
            Dashboard error
          </h1>
          <p className="mt-3 text-sm text-stone-700">
            Profile query error: {profileError.message}
          </p>
        </div>
      </main>
    );
  }

  if (!profile || !["editor", "admin"].includes(profile.role)) {
    redirect("/unauthorized");
  }

  const { data: articles, error: articlesError } = await supabase
    .from("articles")
    .select("id, title, slug, category, status, published, created_at, updated_at")
    .order("updated_at", { ascending: false });

  if (articlesError) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <h1 className="text-2xl font-semibold text-stone-950">
            Dashboard error
          </h1>
          <p className="mt-3 text-sm text-stone-700">
            Articles query error: {articlesError.message}
          </p>
        </div>
      </main>
    );
  }

  const totalArticles = articles?.length ?? 0;
  const publishedArticles =
    articles?.filter((a) => a.published && a.status === "published").length ?? 0;
  const drafts =
    articles?.filter((a) => !a.published || a.status !== "published").length ?? 0;

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="border-b border-stone-200 pb-8">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-red-700">
          Editorial dashboard
        </p>
        <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-stone-950">
              Welcome back{profile.full_name ? `, ${profile.full_name}` : ""}
            </h1>
            <p className="mt-3 text-base text-stone-600">
              Manage legal reporting, drafts, and published analysis.
            </p>
          </div>

          <Link
            href="/dashboard/articles/new"
            className="inline-flex items-center justify-center rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-red-700"
          >
            New article
          </Link>
        </div>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <p className="text-sm text-stone-500">Total articles</p>
          <p className="mt-3 text-3xl font-semibold text-stone-950">
            {totalArticles}
          </p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <p className="text-sm text-stone-500">Published</p>
          <p className="mt-3 text-3xl font-semibold text-stone-950">
            {publishedArticles}
          </p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <p className="text-sm text-stone-500">Drafts / review</p>
          <p className="mt-3 text-3xl font-semibold text-stone-950">{drafts}</p>
        </div>
      </section>

      <section className="mt-10 rounded-2xl border border-stone-200 bg-white">
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-stone-950">Articles</h2>
        </div>

        <div className="divide-y divide-stone-200">
          {articles && articles.length > 0 ? (
            articles.map((article) => (
              <div
                key={article.id}
                className="flex flex-col gap-4 px-5 py-5 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <h3 className="text-base font-semibold text-stone-950">
                    {article.title}
                  </h3>
                  <p className="mt-1 text-sm text-stone-600">
                    {article.category || "Uncategorized"} · {article.status}
                    {article.published ? " · Live" : " · Not live"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/dashboard/articles/${article.id}/edit`}
                    className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-950 hover:text-stone-950"
                  >
                    Edit
                  </Link>

                  <Link
                    href={`/articles/${article.slug}`}
                    className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-950 hover:text-stone-950"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="px-5 py-12">
              <p className="text-sm text-stone-600">No articles yet.</p>
              <Link
                href="/dashboard/articles/new"
                className="mt-4 inline-flex rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-red-700"
              >
                Create your first article
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}