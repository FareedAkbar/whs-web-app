"use client";

import React, { useState } from "react";
import { api } from "@/trpc/react"; // TRPC client
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { Comment } from "@/types/report";
import Button from "./Button";

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

  // ✅ Use mutation instead of query
  const addComment = api.reports.addComment.useMutation();
  const isPending = addComment.isPending;

  // Sort comments (latest first)
  const sortedComments = [...comments].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  // helper: format date
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

  // handle add comment
  const handleAddComment = async () => {
    if (!comment.trim() || !session?.user) return;

    addComment.mutate(
      {
        reportId,
        comments: comment,
      },
      {
        onSuccess: (res) => {
          if (res?.status) {
            setComment("");
            setShowInput(false);
            onCommentAdded?.();
          } else {
            console.error("Error:", res?.error);
          }
        },
        onError: (error) => {
          console.error("Add comment error:", error);
        },
      },
    );
  };

  return (
    <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-gray-200">
        Comments
      </h2>

      {/* Show comments */}
      <div className="space-y-4">
        {sortedComments.length > 0 ? (
          sortedComments.map((item) => (
            <div
              key={item.id}
              className="border-b border-gray-200 pb-3 dark:border-gray-700"
            >
              <div className="mb-1 flex items-center justify-between">
                <p className="flex flex-col items-start font-medium text-gray-800 dark:text-gray-200 sm:flex-row sm:items-baseline sm:gap-2">
                  {item.name}{" "}
                  <span className="text-xs uppercase text-gray-500 dark:text-gray-400">
                    ({item.role.replaceAll("_", " ")})
                  </span>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(item.createdAt)}
                </p>
              </div>
              <p className="text-gray-700 dark:text-gray-300">{item.comment}</p>
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
              className="w-full rounded-md border bg-gray-50 p-3 placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-[2px] focus-visible:ring-neutral-400 disabled:cursor-not-allowed disabled:opacity-50 group-hover/input:shadow-none dark:bg-gray-700 dark:text-white dark:autofill:text-white"
            />
            <div className="flex justify-end gap-3">
              <Button
                title={"Cancel"}
                onClick={() => {
                  setShowInput(false);
                  setComment("");
                }}
                variant="secondary"
              />
              <Button
                title={"Add"}
                onClick={handleAddComment}
                disabled={!comment.trim() || isPending}
                loading={isPending}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentsSection;
