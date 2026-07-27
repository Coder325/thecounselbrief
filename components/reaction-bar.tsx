"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  articleId: string;
};

type ReactionType = "like" | "insightful" | "important";

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
    icon: "♥",
    idleClass: "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100",
    activeClass: "border-rose-500 bg-rose-500 text-white shadow-md shadow-rose-200",
  },
  insightful: {
    label: "Insightful",
    icon: "💡",
    idleClass: "border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100",
    activeClass: "border-sky-500 bg-sky-500 text-white shadow-md shadow-sky-200",
  },
  important: {
    label: "Important",
    icon: "★",
    idleClass: "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100",
    activeClass: "border-amber-500 bg-amber-500 text-white shadow-md shadow-amber-200",
  },
};

export default function ReactionBar({ articleId }: Props) {
  const supabase = createClient();
  const [counts, setCounts] = useState<Counts>({
    like: 0,
    insightful: 0,
    important: 0,
  });
  const [activeReaction, setActiveReaction] = useState<ReactionType | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function loadReactions() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("reactions")
      .select("id, user_id, type")
      .eq("article_id", articleId);

    if (error || !data) return;

    const next: Counts = { like: 0, insightful: 0, important: 0 };
    let nextActive: ReactionType | null = null;

    for (const row of data) {
      if (row.type === "like") next.like += 1;
      if (row.type === "insightful") next.insightful += 1;
      if (row.type === "important") next.important += 1;
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
      .from("reactions")
      .select("id, type")
      .eq("article_id", articleId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingError) {
      setMessage(existingError.message);
      setLoading(false);
      return;
    }

    if (!existing) {
      const { error } = await supabase.from("reactions").insert({
        article_id: articleId,
        user_id: user.id,
        type,
      });

      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }
    } else if (existing.type === type) {
      const { error } = await supabase.from("reactions").delete().eq("id", existing.id);

      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }
    } else {
      const { error } = await supabase
        .from("reactions")
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
  }, [articleId]);

  return (
    <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-base font-semibold text-stone-900">Reactions</p>
        {activeReaction ? (
          <p className="text-xs font-medium text-stone-500">
            Your reaction: {reactionMeta[activeReaction].label}
          </p>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        {(Object.keys(reactionMeta) as ReactionType[]).map((type) => {
          const meta = reactionMeta[type];
          const isActive = activeReaction === type;

          return (
            <button
              key={type}
              onClick={() => handleReact(type)}
              disabled={loading}
              className={[
                "inline-flex items-center gap-2 rounded-full border px-4 py-3 text-sm font-semibold transition",
                "disabled:cursor-not-allowed disabled:opacity-60",
                isActive ? meta.activeClass : meta.idleClass,
              ].join(" ")}
            >
              <span aria-hidden="true" className="text-base leading-none">
                {meta.icon}
              </span>
              <span>{meta.label}</span>
              <span className="rounded-full bg-white/70 px-2 py-0.5 text-xs text-current">
                {counts[type]}
              </span>
            </button>
          );
        })}
      </div>

      {message ? <p className="mt-3 text-sm text-stone-600">{message}</p> : null}
    </div>
  );
}