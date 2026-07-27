import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import slugify from "slugify";

async function createArticle(formData: FormData) {
  "use server";

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["editor", "admin"].includes(profile.role)) {
    redirect("/");
  }

  const title = String(formData.get("title") || "").trim();
  const excerpt = String(formData.get("excerpt") || "").trim();
  const content = String(formData.get("content") || "").trim();
  const category = String(formData.get("category") || "").trim();

  if (!title || !content) {
    redirect("/dashboard/articles/new");
  }

  const slug = slugify(title, { lower: true, strict: true });

  const { error } = await supabase.from("articles").insert({
    title,
    slug,
    excerpt,
    content,
    category,
    published: false,
    author_id: user.id,
  });

  if (error) {
    redirect("/dashboard/articles/new");
  }

  redirect("/dashboard");
}

export default function NewArticlePage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="border-b border-stone-200 pb-6">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-red-700">
          Editor tools
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-stone-950">
          New article
        </h1>
      </div>

      <form action={createArticle} className="mt-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-stone-700">Title</label>
          <input
            name="title"
            required
            className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700">Category</label>
          <input
            name="category"
            className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm"
            placeholder="Criminal law"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700">Excerpt</label>
          <textarea
            name="excerpt"
            rows={3}
            className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700">Content</label>
          <textarea
            name="content"
            rows={14}
            required
            className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm"
          />
        </div>

        <button
          type="submit"
          className="inline-flex rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-red-700"
        >
          Save draft
        </button>
      </form>
    </main>
  );
}