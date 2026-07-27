"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  commentId: string;
};

type ReactionType = "like" | "dislike";

type Counts = Record<ReactionType, number>;

const reactionMeta: Record<
  ReactionType,
  {
    label: string;
    icon: string;
    idleClass: string;
    activeClass: string;
  }
> = {
  like: {
    label: "Like",
    icon: "👍",
    idleClass: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
    activeClass: "border-emerald-500 bg-emerald-500 text-white shadow-sm shadow-emerald-200",
  },
  dislike: {
    label: "Dislike",
    icon: "👎",
    idleClass: "border-stone-200 bg-stone-100 text-stone-700 hover:bg-stone-200",
    activeClass: "border-stone-700 bg-stone-700 text-white shadow-sm",
  },
};

export default function CommentReactionBar({ commentId }: Props) {
  const supabase = createClient();
  const [counts, setCounts] = useState<Counts>({ like: 0, dislike: 0 });
  const [activeReaction, setActiveReaction] = useState<ReactionType | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function loadReactions() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("comment_reactions")
      .select("id, user_id, type")
      .eq("comment_id", commentId);

    if (error || !data) return;

    const next: Counts = { like: 0, dislike: 0 };
    let nextActive: ReactionType | null = null;

    for (const row of data) {
      if (row.type === "like") next.like += 1;
      if (row.type === "dislike") next.dislike += 1;
      if (user && row.user_id === user.id) {
        nextActive = row.type as ReactionType;
      }
    }

    setCounts(next);
    setActiveReaction(nextActive);
  }

  async function handleReact(type: ReactionType) {
    setLoading(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Sign in to react.");
      setLoading(false);
      return;
    }

    const { data: existing, error: existingError } = await supabase
      .from("comment_reactions")
      .select("id, type")
      .eq("comment_id", commentId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingError) {
      setMessage(existingError.message);
      setLoading(false);
      return;
    }

    if (!existing) {
      const { error } = await supabase.from("comment_reactions").insert({
        comment_id: commentId,
        user_id: user.id,
        type,
      });

      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }
    } else if (existing.type === type) {
      const { error } = await supabase.from("comment_reactions").delete().eq("id", existing.id);

      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }
    } else {
      const { error } = await supabase
        .from("comment_reactions")
        .update({ type })
        .eq("id", existing.id);

      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }
    }

    await loadReactions();
    setLoading(false);
  }

  useEffect(() => {
    loadReactions();
  }, [commentId]);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(reactionMeta) as ReactionType[]).map((type) => {
          const meta = reactionMeta[type];
          const isActive = activeReaction === type;

          return (
            <button
              key={type}
              onClick={() => handleReact(type)}
              disabled={loading}
              className={[
                "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition",
                "disabled:cursor-not-allowed disabled:opacity-60",
                isActive ? meta.activeClass : meta.idleClass,
              ].join(" ")}
            >
              <span aria-hidden="true">{meta.icon}</span>
              <span>{meta.label}</span>
              <span className="rounded-full bg-white/70 px-2 py-0.5 text-[11px] text-current">
                {counts[type]}
              </span>
            </button>
          );
        })}
      </div>

      {message ? <p className="mt-2 text-xs text-stone-500">{message}</p> : null}
    </div>
  );
}