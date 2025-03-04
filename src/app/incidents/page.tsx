"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle, Clock, XCircle } from "lucide-react";
import { api } from "@/trpc/react";

const severityMapping = {
  EXTREME: "bg-red-500",
  HIGH: "bg-orange-500",
  MEDIUM: "bg-yellow-500",
  LOW: "bg-green-500",
};

export default function IncidentsList() {
  const {
    data: incidents,
    isLoading,
    isError,
  } = api.incidents.getIncidents.useQuery();

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="container mx-auto flex items-center justify-center p-4">
      <h1 className="mb-4 text-2xl font-bold text-gray-800">Incidents</h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {incidents?.data?.map((item, index) => (
          <div
            key={index}
            className="rounded-lg border border-gray-200 bg-white p-4 shadow-md transition hover:shadow-lg"
          >
            <div className="mb-2 flex items-center gap-3">
              <div
                className={`rounded-full p-2 text-white ${
                  severityMapping[
                    item?.incidentReport
                      ?.priority as keyof typeof severityMapping
                  ] || "bg-gray-400"
                }`}
              >
                {item?.incidentReport?.priority === "EXTREME" && (
                  <XCircle size={24} />
                )}
                {item?.incidentReport?.priority === "HIGH" && (
                  <AlertTriangle size={24} />
                )}
                {item?.incidentReport?.priority === "MEDIUM" && (
                  <Clock size={24} />
                )}
                {item?.incidentReport?.priority === "LOW" && (
                  <CheckCircle size={24} />
                )}
              </div>
              <h2 className="text-lg font-semibold text-gray-800">
                {item.incident.title}
              </h2>
            </div>
            <p className="text-sm text-gray-700">
              Type: {item.incident.incidentType}
            </p>
            <p className="text-sm text-gray-700">
              Status: {item.incidentReport.status}
            </p>
            <Link
              href={`/incident-detail/${item.incidentReport.id}`}
              className="mt-2 inline-block text-sm font-semibold text-blue-500 hover:underline"
            >
              View Details
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
