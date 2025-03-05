"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle, Clock, XCircle } from "lucide-react";
import { api } from "@/trpc/react";
import {
  Modal,
  ModalTrigger,
  ModalBody,
  ModalContent,
  ModalFooter,
} from "@/components/ui/animated-modal"; // Adjust the import path as necessary

const severityMapping = {
  EXTREME: "bg-red-500",
  HIGH: "bg-orange-500",
  MEDIUM: "bg-yellow-500",
  LOW: "bg-green-500",
};

export default function IncidentsList() {
  const { data: incidents, isLoading } = api.incidents.getIncidents.useQuery();
  const { data: workers } = api.workers.getWorkers.useQuery();

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
    <div className="ml-80 mt-20 flex w-full flex-col gap-6">
      <h1 className="mb-6 text-3xl font-bold text-gray-900">Incidents</h1>

      {incidents?.data?.map((item) => (
        <Modal key={item.incidentReport.id}>
          <ModalTrigger>
            <div
              className="w-full cursor-pointer rounded-lg border border-gray-200 bg-white p-5 shadow-lg transition-all hover:shadow-xl"
              onClick={() => setSelectedIncident(item)}
            >
              <div className="flex items-center justify-between">
                <h2 className="truncate text-lg font-semibold text-gray-800">
                  {item.incident.title}
                </h2>
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
              </div>
            </div>
          </ModalTrigger>
          <ModalBody>
            <ModalContent>
              <h2 className="text-lg font-semibold">
                {selectedIncident?.incident.title}
              </h2>
              <p className="text-sm text-gray-600">
                Type: {selectedIncident?.incident.incidentType}
              </p>
              <p className="text-sm text-gray-600">
                Status: {selectedIncident?.incidentReport.status}
              </p>

              <select
                className="mt-2 w-full rounded-md border border-gray-300 p-2"
                onChange={(e) => setSelectedContractor(e.target.value)}
                value={selectedContractor}
              >
                <option value="">Select a Worker</option>
                {workers?.data?.map((worker) => (
                  <option key={worker.id} value={worker.id}>
                    {worker.name}
                  </option>
                ))}
              </select>
            </ModalContent>
            <ModalFooter>
              <div className="flex justify-end gap-2">
                <button
                  className="rounded-md border px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => setSelectedIncident(null)}
                >
                  Cancel
                </button>
                <button
                  className={`rounded-md px-4 py-2 text-white ${
                    selectedContractor
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "cursor-not-allowed bg-gray-400"
                  }`}
                  onClick={handleAssignTask}
                  disabled={!selectedContractor}
                >
                  Assign Task
                </button>
              </div>
            </ModalFooter>
          </ModalBody>
        </Modal>
      ))}
    </div>
  );
}
