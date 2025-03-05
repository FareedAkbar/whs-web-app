"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Ban,
  Check,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { api } from "@/trpc/react";
import {
  Modal,
  ModalTrigger,
  ModalBody,
  ModalContent,
  ModalFooter,
} from "@/components/ui/animated-modal"; // Adjust the import path as necessary
import { toast } from "react-toastify";
import { stat } from "fs";
import { set } from "zod";

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
    refetch,
  } = api.incidents.getIncidents.useQuery();
  const { data: workers } = api.workers.getWorkers.useQuery();
  const { data: enums } = api.enums.getEnums.useQuery();
  const [comment, setComment] = useState("");

  const assignIncidentToWorker = api.incidents.assignIncident.useMutation();
  const updateIncidentStatus = api.incidents.updateStatus.useMutation();
  const [selectedIncident, setSelectedIncident] = useState<IncidentData | null>(
    null,
  );
  const [selectedStatus, setSelectedStatus] = useState("");
  useEffect(() => {
    setSelectedStatus(selectedIncident?.incidentReport?.status!);
  }, [selectedIncident]);
  console.log("ssssss", selectedStatus);
  const [selectedContractor, setSelectedContractor] = useState("");

  const handleDone = async () => {
    if (!selectedIncident) return;

    // Check if status has changed
    const isStatusChanged =
      selectedStatus &&
      selectedStatus !== selectedIncident.incidentReport.status;

    // Check if worker assignment has changed
    const isWorkerChanged =
      selectedContractor &&
      selectedContractor !== selectedIncident.incidentAssignee?.assignedTo;

    try {
      toast.loading("Updating incident...");

      // Call status update API if status has changed
      if (isStatusChanged) {
        await updateIncidentStatus.mutateAsync({
          incidentReportId: selectedIncident.incidentReport.id,
          status: selectedStatus,
          comments: comment, // Assuming statusComment is stored in state
        });
      }

      // Call assign worker API if worker has changed
      if (isWorkerChanged) {
        await assignIncidentToWorker.mutateAsync({
          incidentReportId: selectedIncident.incidentReport.id,
          assignedTo: selectedContractor,
        });
      }

      toast.dismiss();
      setSelectedIncident(null);
      setSelectedStatus("");
      toast.success("Incident updated successfully");
      refetch();
    } catch (error) {
      toast.dismiss();
      console.error("Failed to update incident:", error);
      // toast.error(error.message ?? "Something went wrong");
    }
  };

  if (isLoading) {
    return (
      <div className="relative flex min-h-screen w-full items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-red-500"></div>
      </div>
    );
  }

  const statusOptions = [
    { label: "INITIATED", color: "bg-blue-500", icon: <Clock size={18} /> },
    {
      label: "IN_PROGRESS",
      color: "bg-yellow-500",
      icon: <AlertTriangle size={18} />,
    },
    {
      label: "COMPLETED",
      color: "bg-green-500",
      icon: <CheckCircle size={18} />,
    },
    { label: "CANCELLED", color: "bg-red-500", icon: <Ban size={18} /> },
  ];
  return (
    <div className="ml-80 mt-20 flex w-full flex-col">
      <h1 className="mb-4 text-3xl font-bold text-gray-900">Incidents</h1>
      <div className="grid max-h-[80vh] grid-cols-1 overflow-y-auto md:grid-cols-2">
        {incidents?.data?.map((item) => (
          <Modal key={item.incidentReport.id}>
            <ModalTrigger>
              <div
                className="mr-3 w-full cursor-pointer rounded-lg border border-gray-300 bg-white p-5 shadow-md transition-all hover:shadow-lg"
                onClick={() => setSelectedIncident(item)}
              >
                <div className="flex items-center justify-between">
                  {/* Incident Info */}
                  <div className="flex flex-col items-start gap-1">
                    <h2 className="truncate text-lg font-semibold capitalize text-gray-800">
                      {item.incident.title}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {item.generalHazard.description}
                    </p>
                  </div>

                  {/* Priority Badge */}
                  <div
                    className={`flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium text-white ${
                      severityMapping[
                        item?.incidentReport
                          ?.priority as keyof typeof severityMapping
                      ] || "bg-gray-400"
                    }`}
                  >
                    {item.incidentReport.priority === "EXTREME" && (
                      <>
                        <XCircle size={18} />
                        <span>Extreme</span>
                      </>
                    )}
                    {item.incidentReport.priority === "HIGH" && (
                      <>
                        <AlertTriangle size={18} />
                        <span>High</span>
                      </>
                    )}
                    {item.incidentReport.priority === "MEDIUM" && (
                      <>
                        <Clock size={18} />
                        <span>Medium</span>
                      </>
                    )}
                    {item.incidentReport.priority === "LOW" && (
                      <>
                        <CheckCircle size={18} />
                        <span>Low</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Assignee Info */}
                {item.incidentAssignee?.assignedToData ? (
                  <div className="mt-3 flex items-center gap-3 border-t pt-3">
                    <p>Assigned to:</p>
                    {/* <img
                    src={
                      item.incidentAssignee.assignedToData.imageUrl ||
                      "https://placehold.co/150x150"
                    }
                    alt={item.incidentAssignee.assignedToData.name}
                    className="h-10 w-10 rounded-full border border-gray-300 object-cover"
                  /> */}
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium text-gray-800">
                        {item.incidentAssignee.assignedToData.name}
                      </span>
                      {/* <span className="text-xs text-gray-600">
                      {item.incidentAssignee.assignedToData.email}
                    </span> */}
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 flex items-center gap-3 border-t pt-3">
                    <p className="text-sm">Not assigned yet</p>
                  </div>
                )}
              </div>
            </ModalTrigger>

            <ModalBody>
              <ModalContent className="custom-scrollbar h-full overflow-y-auto">
                {/* Incident Details */}
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold capitalize text-gray-900">
                    {selectedIncident?.incident.title}
                  </h2>

                  {/* Severity Display */}
                  <div
                    className={`mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium text-white ${
                      severityMapping[
                        selectedIncident?.incidentReport
                          ?.priority as keyof typeof severityMapping
                      ] || "bg-gray-400"
                    }`}
                  >
                    {selectedIncident?.incidentReport.priority ===
                      "EXTREME" && (
                      <>
                        <XCircle size={18} />
                        <span>Extreme</span>
                      </>
                    )}
                    {selectedIncident?.incidentReport.priority === "HIGH" && (
                      <>
                        <AlertTriangle size={18} />
                        <span>High</span>
                      </>
                    )}
                    {selectedIncident?.incidentReport.priority === "MEDIUM" && (
                      <>
                        <Clock size={18} />
                        <span>Medium</span>
                      </>
                    )}
                    {selectedIncident?.incidentReport.priority === "LOW" && (
                      <>
                        <CheckCircle size={18} />
                        <span>Low</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-sm text-gray-700">
                  <p>
                    <span className="font-medium text-red-500">
                      Hazard Description:
                    </span>{" "}
                    {selectedIncident?.generalHazard.description}
                  </p>
                  <p>
                    <span className="font-medium text-red-500">
                      Report Description:
                    </span>{" "}
                    {selectedIncident?.incidentReport.description}
                  </p>
                  <div className="mt-4">
                    {selectedIncident?.incidentAssignee?.assignedTo ? (
                      <p>
                        <span className="text-sm font-medium text-red-500">
                          Assigned to:{" "}
                        </span>
                        {selectedIncident?.incidentAssignee.assignedToData.name}
                      </p>
                    ) : (
                      <p className="text-sm font-medium">No worker assigned.</p>
                    )}
                  </div>
                </div>

                {/* Status Selection */}
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Update Status
                  </h3>
                  <div className="mt-2 flex gap-3">
                    {statusOptions.map((status) => {
                      // Convert Enum Label to Corresponding Status Option
                      const isSelected = status.label === selectedStatus;
                      const colorClass = status.color.replace("bg-", "text-"); // Extract text color class
                      const ringColor = status.color.replace("bg-", "ring-"); // Extract ring color class

                      return (
                        <button
                          key={status.label}
                          className={`relative flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-all ${isSelected ? `${status.color} bg-opacity-20 ${ringColor}-600 ring-2 ring-offset-2` : "bg-gray-200"} `}
                          onClick={() => setSelectedStatus(status.label)}
                        >
                          {/* Status Icon with Proper Color */}
                          <span className={`${colorClass}-600 text-sm`}>
                            {status.icon}
                          </span>

                          {/* Status Label with Proper Color */}
                          <span
                            className={`${colorClass}-600 text-nowrap capitalize`}
                          >
                            {status.label.replace("_", " ")}
                          </span>

                          {/* Check Icon for Selected Status */}
                          {isSelected && (
                            <span className="absolute -right-1 -top-1 rounded-full bg-white p-[2px] shadow">
                              <Check
                                size={12}
                                className={`${colorClass}-600`}
                              />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Comment Input */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Add a Comment:
                  </label>
                  <textarea
                    className="mt-2 w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none focus:ring focus:ring-blue-200"
                    rows={3}
                    placeholder="Enter comments about the status update..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>
                <label className="mt-4 block text-sm font-medium text-gray-700">
                  {selectedIncident?.incidentAssignee?.assignedTo
                    ? "Change Assignee:"
                    : "Assign Worker:"}
                </label>
                <select
                  className="mt-2 w-full rounded-md border border-gray-300 p-2 hover:border-gray-400 focus:outline-none focus:ring focus:ring-blue-200"
                  onChange={(e) => setSelectedContractor(e.target.value)}
                  value={selectedContractor}
                  disabled={workers?.data?.length === 0}
                >
                  <option value="">
                    {workers?.data?.length === 0
                      ? "No workers available"
                      : "Select a Worker"}
                  </option>
                  {workers?.data?.map((worker) => (
                    <option key={worker.id} value={worker.id}>
                      {worker.name}
                    </option>
                  ))}
                </select>
                {/* Incident Images */}
                {selectedIncident?.media?.length ? (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Incident Images
                    </h3>
                    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                      {selectedIncident?.media.map((image, index) => (
                        <img
                          key={index}
                          src={image.url}
                          alt={`Incident Image ${index + 1}`}
                          className="h-32 w-full cursor-pointer rounded-lg object-cover shadow-md transition-transform duration-200 hover:scale-105"
                          onClick={() => window.open(image.url, "_blank")}
                        />
                      ))}
                    </div>
                  </div>
                ) : null}
              </ModalContent>
              {/* Action Buttons */}
              <ModalFooter>
                <div className="flex justify-end gap-2">
                  <button
                    className={`cursor-pointer rounded-md px-4 py-2 text-white transition-all ${
                      selectedStatus || selectedContractor
                        ? "bg-red-500 hover:bg-red-600"
                        : "cursor-not-allowed bg-gray-400"
                    }`}
                    onClick={handleDone}
                    disabled={!selectedStatus}
                  >
                    Update
                  </button>
                </div>
              </ModalFooter>
            </ModalBody>
          </Modal>
        ))}
      </div>
    </div>
  );
}
