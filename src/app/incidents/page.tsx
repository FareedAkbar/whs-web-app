"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle, Clock, XCircle } from "lucide-react";
import { api } from "@/trpc/react";

const severityMapping = {
  EXTREME: "bg-red-500",
  HIGH: "bg-orange-500",
  MEDIUM: "bg-yellow-500",
  LOW: "bg-green-500",
};

export default function IncidentsList() {
  const { data: incidents, isLoading } = api.incidents.getIncidents.useQuery();
  const { data: contractors } = api.contractors.getContractors.useQuery();

  const [selectedIncident, setSelectedIncident] = useState<IncidentData | null>(
    null,
  );
  const [selectedContractor, setSelectedContractor] = useState("");

  const handleAssignTask = () => {
    if (!selectedIncident || !selectedContractor) return;
    // api.incidents.assignIncident.mutate({
    //   incidentId: selectedIncident.incidentReport.id,
    //   contractorId: selectedContractor,
    // });
    setSelectedIncident(null);
  };

  if (isLoading) {
    return <p className="text-center text-gray-600">Loading incidents...</p>;
  }

  return (
    <div className="container mx-auto ml-80 p-6">
      <h1 className="mb-6 text-3xl font-bold text-gray-900">Incidents</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {incidents?.data?.map((item) => (
          <div
            key={item.incidentReport.id}
            className="cursor-pointer rounded-lg border border-gray-200 bg-white p-5 shadow-lg transition-all hover:shadow-xl"
            onClick={() => setSelectedIncident(item)}
          >
            <div className="flex items-center justify-between">
              <div
                className={`rounded-full p-2 text-white ${
                  severityMapping[
                    item?.incidentReport
                      ?.priority as keyof typeof severityMapping
                  ] || "bg-gray-400"
                }`}
              >
                {item.incidentReport.priority === "EXTREME" && (
                  <XCircle size={24} />
                )}
                {item.incidentReport.priority === "HIGH" && (
                  <AlertTriangle size={24} />
                )}
                {item.incidentReport.priority === "MEDIUM" && (
                  <Clock size={24} />
                )}
                {item.incidentReport.priority === "LOW" && (
                  <CheckCircle size={24} />
                )}
              </div>
              <h2 className="truncate text-lg font-semibold text-gray-800">
                {item.incident.title}
              </h2>
            </div>
          </div>
        ))}
      </div>

      {/* Simple Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-96 rounded-lg bg-white p-6">
            <h2 className="text-lg font-semibold">
              {selectedIncident.incident.title}
            </h2>
            <p className="text-sm text-gray-600">
              Type: {selectedIncident.incident.incidentType}
            </p>
            <p className="text-sm text-gray-600">
              Status: {selectedIncident.incidentReport.status}
            </p>

            {/* Native Select Dropdown */}
            <select
              className="mt-2 w-full rounded-md border border-gray-300 p-2"
              onChange={(e) => setSelectedContractor(e.target.value)}
              value={selectedContractor}
            >
              <option value="">Select a Contractor</option>
              {contractors?.data?.map((contractor) => (
                <option key={contractor.id} value={contractor.id}>
                  {contractor.name}
                </option>
              ))}
            </select>

            {/* Buttons */}
            <div className="mt-4 flex justify-end gap-2">
              <button
                className="rounded-md border px-4 py-2 text-gray-700 hover:bg-gray-100"
                onClick={() => setSelectedIncident(null)}
              >
                Cancel
              </button>
              <button
                className={`rounded-md px-4 py-2 text-white ${selectedContractor ? "bg-blue-600 hover:bg-blue-700" : "cursor-not-allowed bg-gray-400"}`}
                onClick={handleAssignTask}
                disabled={!selectedContractor}
              >
                Assign Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
