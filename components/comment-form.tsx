"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  articleId: string;
  parentId?: string | null;
  onPosted?: () => void;
  placeholder?: string;
  buttonLabel?: string;
};

export default function CommentForm({
  articleId,
  parentId = null,
  onPosted,
  placeholder = "Add your comment",
  buttonLabel = "Post comment",
}: Props) {
  const supabase = createClient();
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setStatus("error");
      setMessage("Sign in to comment.");
      return;
    }

    const payload: {
      article_id: string;
      user_id: string;
      body: string;
      parent_id?: string;
    } = {
      article_id: articleId,
      user_id: user.id,
      body: body.trim(),
    };

    if (parentId) {
      payload.parent_id = parentId;
    }

    const { error } = await supabase.from("comments").insert(payload);

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    setStatus("success");
    setMessage("Comment posted.");
    setBody("");
    onPosted?.();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        required
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 shadow-sm outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100"
      />

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={status === "loading" || !body.trim()}
          className="inline-flex rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "loading" ? "Posting..." : buttonLabel}
        </button>

        {message ? (
          <p className={`text-sm ${status === "success" ? "text-green-700" : "text-red-700"}`}>
            {message}
          </p>
        ) : null}
      </div>
    </form>
  );
}