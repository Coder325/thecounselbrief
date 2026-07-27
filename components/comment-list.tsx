import { createClient } from "@/lib/supabase/server";
import CommentForm from "@/components/comment-form";
import CommentReactionBar from "@/components/comment-reaction-bar";
import CommentActions from "@/components/comment-actions";

type Props = {
  articleId: string;
};

type CommentRow = {
  id: string;
  body: string;
  created_at: string;
  parent_id: string | null;
  user_id: string;
  profiles: {
    full_name: string | null;
  }[];
};

function timeAgo(dateString: string) {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) {
    const mins = Math.floor(seconds / 60);
    return `${mins} min${mins === 1 ? "" : "s"} ago`;
  }
  if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }
  if (seconds < 604800) {
    const days = Math.floor(seconds / 86400);
    return `${days} day${days === 1 ? "" : "s"} ago`;
  }

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateString));
}

function CommentNode({
  comment,
  childrenByParent,
  articleId,
  viewerId,
  viewerRole,
}: {
  comment: CommentRow;
  childrenByParent: Map<string, CommentRow[]>;
  articleId: string;
  viewerId: string | null;
  viewerRole: string | null;
}) {
  const authorName = comment.profiles?.[0]?.full_name || "Reader";
  const children = childrenByParent.get(comment.id) || [];
  const canDelete =
    viewerId === comment.user_id || viewerRole === "editor" || viewerRole === "admin";

  return (
    <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-stone-950">{authorName}</p>
        <p className="text-xs text-stone-500">{timeAgo(comment.created_at)}</p>
      </div>

      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-stone-700">
        {comment.body}
      </p>

      <div className="mt-4">
        <CommentReactionBar commentId={comment.id} />
      </div>

      <CommentActions
        articleId={articleId}
        commentId={comment.id}
        canDelete={canDelete}
      />

      {children.length > 0 ? (
        <div className="mt-4 space-y-3 border-l border-stone-200 pl-4">
          {children.map((child) => (
            <CommentNode
              key={child.id}
              comment={child}
              childrenByParent={childrenByParent}
              articleId={articleId}
              viewerId={viewerId}
              viewerRole={viewerRole}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default async function CommentList({ articleId }: Props) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let viewerRole: string | null = null;

  if (user) {
    const { data: viewerProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    viewerRole = viewerProfile?.role ?? null;
  }

  const { data } = await supabase
    .from("comments")
    .select(`
      id,
      body,
      created_at,
      parent_id,
      user_id,
      profiles:user_id (
        full_name
      )
    `)
    .eq("article_id", articleId)
    .order("created_at", { ascending: true });

  const rows: CommentRow[] = (data ?? []).map((row: any) => ({
    id: row.id,
    body: row.body,
    created_at: row.created_at,
    parent_id: row.parent_id,
    user_id: row.user_id,
    profiles: Array.isArray(row.profiles) ? row.profiles : row.profiles ? [row.profiles] : [],
  }));

  const topLevel = rows.filter((comment) => !comment.parent_id);
  const childrenByParent = new Map<string, CommentRow[]>();

  for (const row of rows) {
    if (!row.parent_id) continue;
    const existing = childrenByParent.get(row.parent_id) || [];
    existing.push(row);
    childrenByParent.set(row.parent_id, existing);
  }

  return (
    <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
      <h2 className="text-2xl font-semibold tracking-tight text-stone-950">Comments</h2>

      <div className="mt-5">
        <CommentForm articleId={articleId} />
      </div>

      <div className="mt-8 space-y-4">
        {topLevel.length > 0 ? (
          topLevel.map((comment) => (
            <CommentNode
              key={comment.id}
              comment={comment}
              childrenByParent={childrenByParent}
              articleId={articleId}
              viewerId={user?.id ?? null}
              viewerRole={viewerRole}
            />
          ))
        ) : (
          <p className="text-sm text-stone-600">No comments yet.</p>
        )}
      </div>
    </div>
  );
}