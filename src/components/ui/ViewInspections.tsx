"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import parseToArray from "@/utils/parseToArray";

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
                  <p className="font-semibold capitalize text-gray-800 dark:text-gray-200">
                    Assigned To: {insp.assignedTo?.name}
                  </p>
                )}

                {insp.answers?.length > 0 && (
                  <p className="text-gray-600 dark:text-gray-300">
                    Submission Date: {insp.updatedAt?.split("T")[0]}
                  </p>
                )}

                <p className="font-medium text-red-500">
                  Due Date: {insp.dueDate?.split("T")[0]}
                </p>
              </div>

              {/* Right column: status badge + chevron */}
              <div className="flex flex-col items-end gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                    insp.status === "COMPLETED"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                  }`}
                >
                  {insp.status}
                </span>

                {!(!isUserAdmin && insp?.answers?.length === 0) && (
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
            </div>

            {/* Expandable Answers */}
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isExpanded
                  ? "mt-4 max-h-[2000px] opacity-100"
                  : "max-h-0 opacity-0"
              }`}
            >
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
                            {(() => {
                              const rawAnswer = ans.answer;
                              const questionType = question?.type;

                              // Parse the answer (could be array or JSON string)
                              let parsed: string | string[] = Array.isArray(
                                rawAnswer,
                              )
                                ? rawAnswer
                                : typeof rawAnswer === "string"
                                  ? (() => {
                                      try {
                                        const p = JSON.parse(rawAnswer);
                                        return Array.isArray(p) ? p : rawAnswer;
                                      } catch {
                                        return rawAnswer;
                                      }
                                    })()
                                  : String(rawAnswer ?? "");

                              // Handle DATE_RANGE specifically
                              if (
                                questionType === "DATE_RANGE" &&
                                Array.isArray(parsed) &&
                                parsed.length === 2
                              ) {
                                return `From ${parsed[0]} to ${parsed[1]}`;
                              }

                              // Default: join arrays with comma, or return string as-is
                              return Array.isArray(parsed)
                                ? parsed.join(", ")
                                : parsed;
                            })()}
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
            </div>
          </div>
        );
      })}
    </div>
  );
}
