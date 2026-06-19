"use client";

import React, { useState } from "react";
import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";
import { Comment } from "@/types/report";
import Button from "./Button";
import { hasPermission } from "@/lib/auth";
import { toast } from "react-toastify";

interface CommentsSectionProps {
  comments: Comment[];
  reportId: string;
  onCommentAdded?: () => void;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({
  comments,
  reportId,
  onCommentAdded,
}) => {
  const { data: session } = useSession();
  const [showInput, setShowInput] = useState(false);
  const [comment, setComment] = useState("");
  const [showToAll, setShowToAll] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const addComment = api.reports.addComment.useMutation();
  const updateComment = api.reports.updateComment.useMutation();

  const sortedComments = [...comments].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleAddComment = async () => {
    if (!comment.trim() || !session?.user) return;

    addComment.mutate(
      { reportId, comments: comment, showToAll },
      {
        onSuccess: (res) => {
          if (res?.status) {
            setComment("");
            setShowToAll(false);
            setShowInput(false);
            onCommentAdded?.();
          } else {
            console.error("Error:", res?.error);
          }
        },
        onError: (error) => console.error("Add comment error:", error),
      },
    );
  };

  const handleToggleShowToAll = (commentId: string, current: boolean) => {
    setUpdatingId(commentId);
    updateComment.mutate(
      { reportId, commentId, showToAll: !current },
      {
        onSuccess: (res) => {
       onCommentAdded?.();
       toast.success("Comment visibility updated");
        },
        onError: (error) => console.error("Update comment error:", error),
        onSettled: () => setUpdatingId(null),
      },
    );
  };

  return (
    <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-gray-200">
        Comments
      </h2>

      <div className="space-y-4">
        {sortedComments.filter((item) => item.showToAll || item.userId === session?.user.id).length > 0 ? (
          sortedComments.filter((item) => item.showToAll || item.userId === session?.user.id).map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900"
            >
              <div className="mb-1 flex items-start justify-between gap-2">
                <p className="flex flex-col items-start font-medium text-gray-800 dark:text-gray-200 sm:flex-row sm:items-baseline sm:gap-2">
                  {item.name}
                  <span className="text-xs uppercase text-gray-500 dark:text-gray-400">
                    ({item.role.replaceAll("_", " ")})
                  </span>
                </p>
                <p className="shrink-0 text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(item.createdAt)}
                </p>
              </div>

              <p className="mb-3 text-gray-700 dark:text-gray-300">
                {item.comment}
              </p>

              {/* Show to all toggle */}
              {hasPermission(session?.user.role as any, "show/hide:comments") &&item.userId === session?.user.id && (
                
              <div className="flex items-center justify-between border-t border-gray-200 pt-2 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <div
                    role="switch"
                    aria-checked={item.showToAll ?? false}
                    onClick={() =>
                      updatingId !== item.id &&
                      handleToggleShowToAll(item.id, item.showToAll ?? false)
                    }
                    className={`relative h-5 w-9 cursor-pointer rounded-full transition-colors duration-200 ${
                      item.showToAll
                        ? "bg-primary"
                        : "bg-gray-300 dark:bg-gray-600"
                    } ${updatingId === item.id ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <span
                      className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
                        item.showToAll ? "translate-x-4" : "translate-x-0.5"
                      }`}
                    />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {item.showToAll ? "Visible to all" : "Internal only"}
                  </span>
                  {updatingId === item.id && (
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      Saving…
                    </span>
                  )}
                </div>

                {item.showToAll && (
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/40 dark:text-green-300">
                    Public
                  </span>
                )}
              </div>
              )}
            </div>
          ))
        ) : (
          <p className="italic text-gray-500 dark:text-gray-400">
            No comments yet.
          </p>
        )}
      </div>

      {/* Add comment section */}
      <div className="mt-5">
        {!showInput ? (
          <Button title="Add Your Comment" onClick={() => setShowInput(true)} />
        ) : (
          <div className="space-y-3">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Enter your comment..."
              rows={3}
              className="w-full rounded-md border bg-gray-50 p-3 placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-[2px] focus-visible:ring-neutral-400 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:text-white"
            />

            {/* Show to all checkbox */}
          {hasPermission(session?.user.role as any, "show/hide:comments") && (
             <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={showToAll}
                onChange={(e) => setShowToAll(e.target.checked)}
                className="h-4 w-4 cursor-pointer accent-primary"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Show this comment to all users
              </span>
            </label>

         ) }
           
            <div className="flex justify-end gap-3">
              <Button
                title="Cancel"
                onClick={() => {
                  setShowInput(false);
                  setComment("");
                  setShowToAll(false);
                }}
                variant="secondary"
              />
              <Button
                title="Add"
                onClick={handleAddComment}
                disabled={!comment.trim() || addComment.isPending}
                loading={addComment.isPending}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentsSection;