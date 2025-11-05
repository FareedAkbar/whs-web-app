"use client";

import React, { useState } from "react";
import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { Comment } from "@/types/report";
import Button from "./Button";

interface FollowUpsSectionProps {
  followUps: Comment[];
  reportId: string;
  onFollowUpAdded?: () => void;
}

const FollowUpsSection: React.FC<FollowUpsSectionProps> = ({
  followUps,
  reportId,
  onFollowUpAdded,
}) => {
  const { data: session } = useSession();
  const [showInput, setShowInput] = useState(false);
  const [followUpText, setFollowUpText] = useState("");
  const [isPending, setIsPending] = useState(false);

  // ✅ useMutation instead of query
  const addFollowUp = api.incidents.addFollowUp.useMutation();

  // sort (latest first)
  const sortedFollowUps = [...followUps].sort(
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

  const handleAddFollowUp = async () => {
    if (!followUpText.trim() || !session?.user) return;
    try {
      setIsPending(true);
      const res = await addFollowUp.mutateAsync({
        reportId,
        followUpDescription: followUpText,
      });

      if (res?.status) {
        setFollowUpText("");
        setShowInput(false);
        onFollowUpAdded?.();
      } else {
        console.error("Error adding follow-up:", res?.error);
      }
    } catch (error) {
      console.error("Add follow-up error:", error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-gray-200">
        Follow Ups
      </h2>

      {/* Show Follow Ups */}
      <div className="space-y-4">
        {sortedFollowUps.length > 0 ? (
          sortedFollowUps.map((item) => (
            <div
              key={item.id}
              className="border-b border-gray-200 pb-3 dark:border-gray-700"
            >
              <div className="mb-1 flex items-start justify-between">
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
              <p className="text-gray-700 dark:text-gray-300">
                {item.followUpDescription}
              </p>
            </div>
          ))
        ) : (
          <p className="italic text-gray-500 dark:text-gray-400">
            No follow-ups yet.
          </p>
        )}
      </div>

      {/* Add follow-up section */}
      <div className="mt-5">
        {!showInput ? (
          <Button
            title="Add Your Follow-up"
            onClick={() => setShowInput(true)}
          />
        ) : (
          <div className="space-y-3">
            <textarea
              value={followUpText}
              onChange={(e) => setFollowUpText(e.target.value)}
              placeholder="Enter your follow-up..."
              rows={3}
              className="w-full rounded-md border bg-gray-50 p-3 placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-[2px] focus-visible:ring-neutral-400 disabled:cursor-not-allowed disabled:opacity-50 group-hover/input:shadow-none dark:bg-gray-700 dark:text-white dark:autofill:text-white"
            />
            <div className="flex justify-end gap-3">
              <Button
                title={"Cancel"}
                onClick={() => {
                  setShowInput(false);
                  setFollowUpText("");
                }}
                variant="secondary"
              />
              <Button
                title={"Add"}
                onClick={handleAddFollowUp}
                disabled={!followUpText.trim() || isPending}
                loading={isPending}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FollowUpsSection;
