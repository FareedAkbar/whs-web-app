"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface ViewInspectionsProps {
  inspections: InspectionItem[];
  questions: Question[];
  isUserAdmin: boolean;
}
export default function ViewInspections({
  inspections,
  questions,
  isUserAdmin,
}: ViewInspectionsProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const getQuestionById = (id: string) => questions?.find((q) => q.id === id);

  return (
    <div className="gap-4">
      {inspections?.map((insp, inspIndex) => {
        const isExpanded = expandedIndex === inspIndex;

        return (
          <div
            key={insp.id}
            className="mb-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900"
          >
            {/* Top Row */}
            <div className="flex items-start justify-between">
              <div>
                {isUserAdmin && (
                  <p className="font-semibold text-gray-800 dark:text-gray-200">
                    Assigned To: {insp.assignedTo?.name}
                  </p>
                )}

                <p className="text-gray-600 dark:text-gray-300">
                  Status: {insp.status}
                </p>

                {insp.answers?.length > 0 && (
                  <p className="text-gray-600 dark:text-gray-300">
                    Submission Date: {insp.updatedAt?.split("T")[0]}
                  </p>
                )}

                <p className="font-medium text-red-500">
                  Due Date: {insp.dueDate?.split("T")[0]}
                </p>
              </div>

              {/* Expand button */}
              {!(!isUserAdmin && insp.answers && insp.answers.length === 0) && (
                <button
                  onClick={() =>
                    setExpandedIndex(isExpanded ? null : inspIndex)
                  }
                  className="rounded-full border border-gray-200 bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-800"
                >
                  {isExpanded ? (
                    <ChevronUp className="text-primary" size={22} />
                  ) : (
                    <ChevronDown className="text-primary" size={22} />
                  )}
                </button>
              )}
            </div>

            {/* Expandable Answers */}
            {isExpanded && (
              <div className="mt-4 space-y-2">
                <p className="font-semibold text-gray-800 dark:text-gray-200">
                  Answers:
                </p>

                {insp.answers?.length > 0
                  ? insp.answers
                      .map((ans) => ({
                        ans,
                        question: getQuestionById(ans?.questionId!),
                      }))
                      .sort(
                        (a, b) =>
                          (a.question?.questionNumber ?? 0) -
                          (b.question?.questionNumber ?? 0),
                      )
                      .map(({ ans, question }, ansIndex) => (
                        <div
                          key={ansIndex}
                          className="rounded-xl border border-gray-200 bg-gray-50 p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                        >
                          <p className="font-bold text-gray-900 dark:text-gray-100">
                            {question?.questionNumber}. {question?.title}
                          </p>

                          <p className="mt-2 text-gray-700 dark:text-gray-300">
                            {Array.isArray(ans.answer)
                              ? ans.answer.join(", ")
                              : typeof ans.answer === "string" &&
                                  ans.answer.startsWith("[")
                                ? JSON.parse(ans.answer).join(", ")
                                : ans.answer}
                          </p>
                        </div>
                      ))
                  : isUserAdmin && (
                      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <p className="font-bold text-gray-900 dark:text-gray-100">
                          No answers found
                        </p>
                      </div>
                    )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
