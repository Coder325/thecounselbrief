"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import CommentForm from "@/components/comment-form";

type Props = {
  articleId: string;
  commentId: string;
  canDelete: boolean;
  onDeleted?: () => void;
};

export default function CommentActions({
  articleId,
  commentId,
  canDelete,
  onDeleted,
}: Props) {
  const supabase = createClient();
  const [showReply, setShowReply] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [message, setMessage] = useState("");

  async function handleDelete() {
    const confirmed = window.confirm("Delete this comment?");
    if (!confirmed) return;

    setLoadingDelete(true);
    setMessage("");

    const { error } = await supabase.from("comments").delete().eq("id", commentId);

    if (error) {
      setMessage(error.message);
      setLoadingDelete(false);
      return;
    }

    setMessage("Comment deleted.");
    setLoadingDelete(false);
    onDeleted?.();
  }

  return (
    <div className="mt-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setShowReply((value) => !value)}
          className="text-sm font-medium text-stone-600 transition hover:text-red-700"
        >
          {showReply ? "Cancel reply" : "Reply"}
        </button>

        {canDelete ? (
          <button
            type="button"
            onClick={handleDelete}
            disabled={loadingDelete}
            className="text-sm font-medium text-stone-600 transition hover:text-red-700 disabled:opacity-60"
          >
            {loadingDelete ? "Deleting..." : "Delete"}
          </button>
        ) : null}

        {message ? <p className="text-sm text-stone-500">{message}</p> : null}
      </div>

      {showReply ? (
        <div className="mt-4">
          <CommentForm
            articleId={articleId}
            parentId={commentId}
            placeholder="Write a reply"
            buttonLabel="Reply"
          />
        </div>
      ) : null}
    </div>
  );
}