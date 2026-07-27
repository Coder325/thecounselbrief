import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import slugify from "slugify";

async function updateArticle(formData: FormData) {
  "use server";

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["editor", "admin"].includes(profile.role)) {
    redirect("/");
  }

  const id = String(formData.get("id") || "");
  const title = String(formData.get("title") || "").trim();
  const excerpt = String(formData.get("excerpt") || "").trim();
  const content = String(formData.get("content") || "").trim();
  const category = String(formData.get("category") || "").trim();
  const published = formData.get("published") === "on";

  if (!id || !title || !content) {
    redirect(`/dashboard/articles/${id}/edit`);
  }

  const slug = slugify(title, { lower: true, strict: true });
  const status = published ? "published" : "draft";

  const updateData: {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    category: string;
    published: boolean;
    status: string;
    updated_at: string;
    approved_by?: string;
    approved_at?: string;
  } = {
    title,
    slug,
    excerpt,
    content,
    category,
    published,
    status,
    updated_at: new Date().toISOString(),
  };

  if (published && profile.role === "admin") {
    updateData.approved_by = user.id;
    updateData.approved_at = new Date().toISOString();
  }

  if (!published) {
    updateData.approved_by = undefined;
    updateData.approved_at = undefined;
  }

  const { error } = await supabase
    .from("articles")
    .update(updateData)
    .eq("id", id);

  if (error) {
    redirect(`/dashboard/articles/${id}/edit`);
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/articles/${id}/edit`);
  revalidatePath("/");
  revalidatePath(`/articles/${slug}`);

  redirect("/dashboard");
}

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["editor", "admin"].includes(profile.role)) {
    redirect("/");
  }

  const { data: article } = await supabase
    .from("articles")
    .select("*")
    .eq("id", id)
    .single();

  if (!article) redirect("/dashboard");

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="border-b border-stone-200 pb-6">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-red-700">
          Editor tools
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-stone-950">
          Edit article
        </h1>
      </div>

      <form action={updateArticle} className="mt-8 space-y-6">
        <input type="hidden" name="id" value={article.id} />

        <div>
          <label className="block text-sm font-medium text-stone-700">Title</label>
          <input
            name="title"
            defaultValue={article.title}
            required
            className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700">Category</label>
          <input
            name="category"
            defaultValue={article.category ?? ""}
            className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700">Excerpt</label>
          <textarea
            name="excerpt"
            rows={3}
            defaultValue={article.excerpt ?? ""}
            className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700">Content</label>
          <textarea
            name="content"
            rows={14}
            defaultValue={article.content}
            required
            className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm"
          />
        </div>

        <label className="flex items-center gap-3 text-sm text-stone-700">
          <input
            type="checkbox"
            name="published"
            defaultChecked={article.published}
          />
          Publish this article
        </label>

        <button
          type="submit"
          className="inline-flex rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-red-700"
        >
          Save changes
        </button>
      </form>
    </main>
  );
}