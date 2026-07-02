// src/components/ui/LogsSection.tsx
import { type FC } from "react";

type IncidentLog = {
  id: string;
  comment: string;
  status: string;
  createdAt: string;
  incidentId: string | null;
  hazardId: string | null;
  userId: string;
  updatedAt: string;
};

const statusColors: Record<string, string> = {
   INITIATED: "bg-blue-100 dark:bg-blue-900 dark:bg-opacity-50 text-blue-600",
    CLOSED:
      "bg-yellow-100 dark:bg-yellow-900 dark:bg-opacity-50 text-yellow-600",
    COMPLETED:
      "bg-green-100 dark:bg-green-900 dark:bg-opacity-50 text-green-600",
    CANCELLED: "bg-red-100 dark:bg-red-900 dark:bg-opacity-50 text-red-600",
    ASSIGNED:
      "bg-purple-100 dark:bg-purple-900 dark:bg-opacity-50 text-purple-600",
};

const LogsSection: FC<{ logs: IncidentLog[] }> = ({ logs }) => {
  if (!logs?.length) return null;

  return (
    <div className="mt-6">
      <h3 className="mb-3 text-base font-semibold text-gray-800 dark:text-gray-200">
        Activity Log(s)
      </h3>

      <div className="flex flex-col gap-3">
        {[...logs]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .map((log) => (
          <div
            key={log.id}
            className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
          >
            {/* Icon */}
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/30">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    statusColors[log.status] ?? statusColors["INITIATED"]
                  }`}
                >
                  {log.status.replaceAll("_", " ")}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(log.createdAt).toLocaleString(undefined, {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {log.comment}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LogsSection;