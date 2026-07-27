import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CommentList from "@/components/comment-list";
import ReactionBar from "@/components/reaction-bar";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ArticlePageContent({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: article } = await supabase
    .from("articles")
    .select("id, title, excerpt, content, category, created_at, slug, published, status")
    .eq("slug", slug)
    .eq("published", true)
    .eq("status", "published")
    .maybeSingle();

  if (!article) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <p className="text-sm font-medium uppercase tracking-[0.18em] text-red-700">
        {article.category || "Legal analysis"}
      </p>

      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-stone-950">
        {article.title}
      </h1>

      {article.excerpt ? (
        <p className="mt-4 text-lg text-stone-600">{article.excerpt}</p>
      ) : null}

      <article className="prose prose-stone mt-10 max-w-none">
        <div className="whitespace-pre-wrap text-base leading-8 text-stone-800">
          {article.content}
        </div>
      </article>

      <div className="mt-10">
        <ReactionBar articleId={article.id} />
      </div>

      <div className="mt-10">
        <CommentList articleId={article.id} />
      </div>
    </main>
  );
}