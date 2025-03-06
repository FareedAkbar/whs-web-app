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
  useModal,
} from "@/components/ui/animated-modal";
import { toast } from "react-toastify";

export default function IncidentsList() {
  const {
    data: incidents,
    isLoading,
    refetch,
  } = api.incidents.getIncidents.useQuery();
  const { data: workers } = api.workers.getWorkers.useQuery();
  const assignIncidentToWorker = api.incidents.assignIncident.useMutation();
  const updateIncidentStatus = api.incidents.updateStatus.useMutation();

  const [selectedIncident, setSelectedIncident] = useState<IncidentData | null>(
    null,
  );
  const [selectedContractor, setSelectedContractor] = useState("");
  const [comment, setComment] = useState("");
  const { setOpen } = useModal();
  const [decision, setDecision] = useState<"accept" | "reject" | null>(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const severityMapping = {
    EXTREME: "bg-red-500",
    HIGH: "bg-orange-500",
    MEDIUM: "bg-yellow-500",
    LOW: "bg-green-500",
  };

  const statusMapping = {
    INITIATED: "bg-blue-100 text-blue-600",
    IN_PROGRESS: "bg-yellow-100 text-yellow-600",
    COMPLETED: "bg-green-100 text-green-600",
    CANCELLED: "bg-red-100 text-red-600",
    ASSIGNED: "bg-purple-100 text-purple-600", // Explicitly define the class
  };
  const filteredIncidents = incidents?.data?.filter(
    (item) =>
      statusFilter === "ALL" || item.incidentReport.status === statusFilter,
  );
  const handleDone = async () => {
    if (!selectedIncident) return;

    try {
      // Call status update API if status has changed
      if (decision === "reject") {
        try {
          await updateIncidentStatus.mutateAsync({
            incidentReportId: selectedIncident.incidentReport.id,
            status: "CANCELLED",
            comments: comment,
          });
          toast.dismiss();
          toast.success("Incident cancelled successfully");
          refetch();
          setOpen(false);
          setDecision(null);
        } catch (error) {
          toast.dismiss();
          toast.error("Failed to update status");
        }
      }

      // Call assign worker API if worker has changed
      else if (
        decision === "accept" ||
        selectedIncident?.incidentAssignee?.filter(
          (assignee) => assignee.acceptanceStatus === false,
        ).length === selectedIncident?.incidentAssignee.length
      ) {
        try {
          await assignIncidentToWorker.mutateAsync({
            incidentReportId: selectedIncident.incidentReport.id,
            assignedTo: selectedContractor,
          });
          toast.dismiss();
          toast.success("Contractor assigned successfully");
          refetch();
          setOpen(false);
          setDecision(null);
        } catch (error) {
          toast.dismiss();
          toast.error("Failed to assign Contractor");
        }
      }

      setSelectedIncident(null);
      refetch();
    } catch (error) {
      toast.dismiss();
      console.error("Failed to update incident:", error);
      // toast.error(error.message ?? "Something went wrong");
    }
  };
  const statusOrder = [
    "INITIATED",
    "ASSIGNED",
    "IN_PROGRESS",
    "COMPLETED",
    "CANCELLED",
  ];
  if (isLoading) {
    return (
      <div className="relative flex h-[90vh] w-[80vw] items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-red-500"></div>
      </div>
    );
  }
  // Group images by status
  const groupedImages = statusOrder.map((status) => ({
    status,
    images:
      selectedIncident?.media?.filter((image) => image.status === status) || [], // Ensure it's always an array
  }));
  return (
    <div className="flex w-full flex-col overflow-hidden px-8">
      <div className="mb-4 flex items-center justify-end">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="my-2 rounded-md border border-gray-300 p-2 text-sm shadow-sm"
        >
          <option value="ALL">ALL</option>
          {Object.keys(statusMapping).map((status) => (
            <option key={status} value={status}>
              {status.replace("_", " ")}
            </option>
          ))}
        </select>
      </div>
      <div className="custom-scrollbar grid max-h-[70vh] grid-cols-1 gap-4 overflow-y-auto md:grid-cols-2">
        {filteredIncidents?.map((item) => (
          <div
            key={item.incidentReport.id}
            className="cursor-pointer rounded-lg border bg-white p-5 shadow-md hover:shadow-lg"
            onClick={() => {
              setSelectedIncident(item);
              setOpen(true);
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex gap-3">
                <img
                  src={
                    item.media[0]?.url !== ""
                      ? item.media[0]?.url
                      : "https://placehold.co/150x150"
                  }
                  alt="Incident"
                  className="h-16 w-16 rounded-full object-cover shadow"
                />
                <div>
                  <h2 className="font-semibold">{item.incident.title}</h2>

                  <p className="text-sm text-gray-600">
                    {item.incident.description}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-4">
                <span
                  className={`rounded-full px-3 py-1 text-xs ${statusMapping[item.incidentReport.status as keyof typeof statusMapping]}`}
                >
                  {item.incidentReport.status}
                </span>
                <div
                  className={`flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium text-white ${
                    severityMapping[
                      item?.incidentReport
                        ?.priority as keyof typeof severityMapping
                    ] || "bg-gray-400"
                  }`}
                >
                  <AlertTriangle size={18} />
                  <span>{item?.incidentReport?.priority}</span>
                </div>
              </div>
            </div>

            {item.incidentAssignee?.[0]?.assignedToData ? (
              <div className="mt-3 flex items-center gap-3 border-t pt-3">
                <p>Assigned to:</p>
                {/* <img
                    src={
                      item.incidentAssignee?.[0]?.assignedToData.imageUrl ||
                      "https://placehold.co/150x150"
                    }
                    alt={item.incidentAssignee.assignedToData.name}
                    className="h-10 w-10 rounded-full border border-gray-300 object-cover"
                  /> */}
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium capitalize text-gray-800">
                    {item.incidentAssignee?.[0]?.assignedToData.name}
                  </span>
                  {/* <span className="text-xs text-gray-600">
                      {item.incidentAssignee?.[0]?.assignedToData.email}
                    </span> */}
                </div>
              </div>
            ) : (
              <div className="mt-3 flex items-center gap-3 border-t pt-3">
                <p className="text-sm">Not assigned yet</p>
              </div>
            )}
          </div>
        ))}
      </div>
      <ModalBody>
        <ModalContent className="custom-scrollbar overflow-y-auto">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">
              {selectedIncident?.incident.title}
            </h2>
            <div className="flex flex-col items-center gap-4">
              <span
                className={`rounded-full px-3 py-1 text-xs ${statusMapping[selectedIncident?.incidentReport.status as keyof typeof statusMapping]}`}
              >
                {selectedIncident?.incidentReport.status}
              </span>
              <div
                className={`flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium text-white ${
                  severityMapping[
                    selectedIncident?.incidentReport
                      ?.priority as keyof typeof severityMapping
                  ] || "bg-gray-400"
                }`}
              >
                <AlertTriangle size={18} />
                <span>{selectedIncident?.incidentReport?.priority}</span>
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-2 text-sm text-gray-700">
            <p>
              <span className="font-medium text-red-500">
                Hazard Description:
              </span>{" "}
              {selectedIncident?.generalHazard.description}
            </p>
            {selectedIncident?.incidentReport.description && (
              <p>
                <span className="font-medium text-red-500">
                  Report Description:
                </span>{" "}
                {selectedIncident?.incidentReport.description}
              </p>
            )}

            <div className="mt-4">
              {selectedIncident?.incidentAssignee?.[0]?.assignedTo ? (
                <p className="capitalize">
                  <span className="text-sm font-medium text-red-500">
                    Assigned to:{" "}
                  </span>
                  {selectedIncident?.incidentAssignee?.[0]?.assignedToData.name}
                </p>
              ) : (
                <p className="text-sm font-medium">No Contractor assigned.</p>
              )}
            </div>
          </div>
          {selectedIncident?.media?.length ? (
            <div className="mt-6">
              <h3 className="font-semibold text-gray-800">Incident Gallery</h3>
              {groupedImages.map(
                ({ status, images }) =>
                  images?.length > 0 && ( // No more undefined issue
                    <div key={status} className="mt-2">
                      <p className="text-sm font-medium capitalize text-gray-700">
                        {status.toLocaleLowerCase().replace("_", " ")} images
                      </p>
                      <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                        {images?.map((image, index) => (
                          <img
                            key={image.id || index}
                            src={image.url}
                            alt={`Incident Image ${index + 1}`}
                            className="h-28 w-full cursor-pointer rounded-lg object-cover shadow-md transition-transform duration-200 hover:scale-105"
                            onClick={() => window.open(image.url, "_blank")}
                          />
                        ))}
                      </div>
                    </div>
                  ),
              )}
            </div>
          ) : null}
          {selectedIncident?.incidentReport.status === "INITIATED" &&
            !decision && (
              <div className="mt-4 flex items-center gap-4">
                <button
                  onClick={() => setDecision("accept")}
                  className="rounded bg-green-500 px-4 py-2 text-white"
                >
                  Accept
                </button>
                <button
                  onClick={() => setDecision("reject")}
                  className="ml-2 rounded bg-red-500 px-4 py-2 text-white"
                >
                  Reject
                </button>
              </div>
            )}
          {(decision === "accept" ||
            selectedIncident?.incidentAssignee?.every(
              (assignee) => assignee.acceptanceStatus === false,
            )) && (
            <>
              <p className="mt-4 text-sm font-medium text-gray-700">
                {selectedIncident?.incidentAssignee?.every(
                  (assignee) => assignee.acceptanceStatus === false,
                )
                  ? "Assign Contractor"
                  : "Reassign Contractor"}
              </p>
              <select
                className="mt-2 w-full rounded border p-2"
                onChange={(e) => setSelectedContractor(e.target.value)}
                value={selectedContractor}
              >
                <option value="">Select option </option>
                {workers?.data?.map((Contractor) => (
                  <option
                    key={Contractor.id}
                    value={Contractor.id}
                    className="capitalize"
                  >
                    {Contractor.name}
                  </option>
                ))}
              </select>
            </>
          )}
          {decision === "reject" && (
            <textarea
              className="mt-2 w-full rounded border p-2"
              placeholder="Add rejection reason..."
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setComment(e.target.value)
              }
            />
          )}
        </ModalContent>
        {(decision === "accept" && selectedContractor) ||
        (decision === "reject" && comment) ? (
          <ModalFooter>
            <div className="flex gap-4">
              <button
                onClick={handleDone}
                className="rounded-md bg-red-500 px-4 py-2 font-semibold text-white"
              >
                Done
              </button>
            </div>
          </ModalFooter>
        ) : null}
      </ModalBody>
    </div>
  );
}
