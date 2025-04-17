// src/app/incidents/[id]/page.tsx
"use client";

import { use, useEffect, useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  Filter,
  Search,
  UserPlus,
} from "lucide-react";
import { api } from "@/trpc/react";
import { toast } from "react-toastify";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { severityMapping } from "@/constants/severity";
import Button from "@/components/ui/Button";
import { Modal, ModalBody, useModal } from "@/components/ui/animated-modal";
import { hasPermission } from "@/lib/auth";
import { useSession } from "next-auth/react";

export default function IncidentDetailScreen() {
  const params = useParams();
  const { setOpen } = useModal();
  const session = useSession();
  const router = useRouter();
  //   const incidentId = params.id as string;
  const { id } = params as { id: string };
  const { data: incidentData, isLoading } =
    api.incidents.getIncidentById.useQuery({
      incidentReportId: id,
    });
  const { data: workers } = api.workers.getWorkers.useQuery();
  const assignIncidentToWorker = api.incidents.assignIncident.useMutation();
  const updateIncidentStatus = api.incidents.updateStatus.useMutation();
  const incidentAcceptance = api.incidents.incidentAcceptance.useMutation();
  const incident = incidentData?.data;
  const [selectedContractor, setSelectedContractor] = useState("");
  const [comment, setComment] = useState("");
  const [decision, setDecision] = useState<"accept" | "reject" | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"accept" | "reject" | "assign">(
    "accept",
  );
  const user = session.data?.user;

  const statusMapping = {
    INITIATED: "bg-blue-100 text-blue-600",
    IN_PROGRESS: "bg-yellow-100 text-yellow-600",
    COMPLETED: "bg-green-100 text-green-600",
    CANCELLED: "bg-red-100 text-red-600",
    ASSIGNED: "bg-purple-100 text-purple-600",
  };

  const statusOrder = [
    "INITIATED",
    "ASSIGNED",
    "IN_PROGRESS",
    "COMPLETED",
    "CANCELLED",
  ];
  const handleAcceptAndReject = async (flag: boolean) => {
    if (!incident) return;
    await incidentAcceptance.mutateAsync(
      {
        incidentReportId: incident.incidentReport.id,
        status: flag,
      },
      {
        onSuccess: () => {
          toast.success(`Report has been ${flag ? "Accepted" : "Rejected"}`);
          //   setDecision(null);
        },
        onError: (error) => {
          toast.error(error.message ?? "Something went wrong");
        },
      },
    );
  };
  const handleStart = async () => {
    if (!incident) return;

    await updateIncidentStatus.mutateAsync(
      {
        incidentReportId: incident.incidentReport.id,
        status: "IN_PROGRESS",
        comments: "",
      },
      {
        onSuccess: () => {
          toast.success("Incident has been started");
        },
        onError: (error) => {
          toast.error(error.message ?? "Something went wrong");
        },
      },
    );
  };
  const handleComplete = async () => {
    if (!incident) return;

    await updateIncidentStatus.mutateAsync(
      {
        incidentReportId: incident.incidentReport.id,
        status: "COMPLETED",
        comments: "",
      },
      {
        onSuccess: () => {
          toast.success("Incident has been completed");
        },
        onError: (error) => {
          toast.error(error.message ?? "Something went wrong");
        },
      },
    );
  };
  const groupedImages = statusOrder.map((status) => ({
    status,
    images: incident?.media?.filter((image) => image.status === status) ?? [],
  }));

  const handleDone = async () => {
    if (!incident) return;

    try {
      if (modalMode == "reject") {
        await updateIncidentStatus.mutateAsync({
          incidentReportId: incident.incidentReport.id,
          status: "CANCELLED",
          comments: comment,
        });
        toast.success("Incident cancelled successfully");
        router.push("/incidents");
      } else if (
        modalMode === "assign" ||
        ((incident?.incidentAssignee?.length ?? 0) > 0 &&
          incident?.incidentAssignee?.every(
            (assignee) => assignee.acceptanceStatus === false,
          ))
      ) {
        await assignIncidentToWorker.mutateAsync({
          incidentReportId: incident.incidentReport.id,
          assignedTo: selectedContractor,
        });
        toast.success("Contractor assigned successfully");
        router.push("/incidents");
      }
    } catch (error) {
      toast.error("Failed to update incident");
      console.error(error);
    }
  };

  if (isLoading || !incident) {
    return (
      <div className="relative flex h-full w-full items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col px-8 py-6">
      <button
        onClick={() => router.back()}
        className="mb-4 flex items-center text-sm text-primary"
      >
        ← Back to LIst
      </button>

      <div className="rounded-lg border bg-white p-6 shadow-md">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-row items-center gap-4">
            <h2
              className="text-xl font-semibold capitalize"
              style={{
                color:
                  severityMapping[incident?.incidentReport?.priority] ||
                  "black",
              }}
              color={severityMapping[incident?.incidentReport?.priority]}
            >
              {incident.incident.title}
            </h2>
            <span
              className={`rounded-full px-3 py-1 text-xs ${
                statusMapping[
                  incident.incidentReport.status as keyof typeof statusMapping
                ]
              }`}
            >
              {incident.incidentReport.status}
            </span>
          </div>
          <div className="flex flex-row items-center gap-4">
            {user && hasPermission(user.role, "assign:contractors") && (
              <>
                {incident.incidentAssignee?.length === 0 ? (
                  // Show "Assign Contractor" if no one is assigned
                  <Button
                    title="Assign Contractor"
                    icon={<UserPlus size={16} />}
                    onClick={() => {
                      setModalOpen(true);
                      setModalMode("assign");
                      setOpen(true);
                    }}
                  />
                ) : // ) : incident.incidentAssignee.every(
                //     (assignee) => assignee.acceptanceStatus === false,
                //   ) ? (
                //   // Show "Reassign Contractor" if all rejected
                //   <div>
                //     <p className="text-primary">Rejected</p>
                //     <Button
                //       title="Reassign Contractor"
                //       icon={<UserPlus size={16} />}
                //       onClick={() => {
                //         setModalOpen(true);
                //         setModalMode("accept");
                //         setOpen(true);
                //       }}
                //     />
                //   </div>
                null}
              </>
            )}

            {user &&
              hasPermission(user.role, "cancel:incidents") &&
              incident.incidentReport.status === "INITIATED" && (
                <Button
                  title="Cancel Incident"
                  //   icon={<UserPlus size={16} />}
                  onClick={() => {
                    setModalOpen(true);
                    setModalMode("reject");
                    setOpen(true);
                  }}
                  variant="secondary"
                />
              )}
          </div>
        </div>

        <div className="mt-4 space-y-4">
          <div className="space-y-2 text-sm text-gray-700">
            <p>
              <span className="font-medium">Hazard Description:</span>
              <br />
              {incident.generalHazard.description}
            </p>
            {incident.incidentReport.description && (
              <p>
                <span className="font-medium text-red-500">
                  Report Description:
                </span>{" "}
                {incident.incidentReport.description}
              </p>
            )}

            <div className="mt-4">
              {incident.incidentAssignee &&
              incident.incidentAssignee.length > 0 ? (
                <div className="mt-3 space-y-2">
                  <p className="text-sm font-semibold text-red-500">
                    Assigned Contractor(s):
                  </p>
                  {incident.incidentAssignee.map((assignee, index) =>
                    assignee.assignedToData ? (
                      <p
                        key={index}
                        className="text-sm capitalize text-gray-700"
                      >
                        {assignee.assignedToData.name} (
                        {assignee.acceptanceStatus === true
                          ? "Accepted"
                          : assignee.acceptanceStatus === false
                            ? "Rejected"
                            : "Pending"}
                        )
                      </p>
                    ) : null,
                  )}
                </div>
              ) : (
                <p className="text-sm font-medium">No Contractor assigned.</p>
              )}
            </div>
          </div>

          {incident.media?.length ? (
            <div className="mt-6">
              <h3 className="font-semibold text-gray-800">Incident Gallery</h3>
              {groupedImages.map(
                ({ status, images }) =>
                  images?.length > 0 && (
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
                            width={150}
                            height={150}
                          />
                        ))}
                      </div>
                    </div>
                  ),
              )}
            </div>
          ) : null}
          {user && hasPermission(user.role, "start:incident") && (
            <Button title="Mark as Start" onClick={() => handleStart()} />
          )}
          {user && hasPermission(user.role, "complete:incident") && (
            <Button
              title="Mark as Completed"
              onClick={() => handleComplete()}
            />
          )}

          {user &&
            hasPermission(user.role, "accept/reject:incidents") &&
            incident.incidentReport.status === "INITIATED" &&
            !decision && (
              <div className="mt-6 flex items-center gap-4">
                <button
                  onClick={() => {
                    setDecision("accept");
                    handleAcceptAndReject(true);
                  }}
                  className="rounded-full bg-primary px-4 py-2 text-white"
                >
                  Accept
                </button>
                <button
                  onClick={() => {
                    setDecision("reject");
                    handleAcceptAndReject(false);
                  }}
                  className="rounded-full border border-primary px-4 py-2 text-primary"
                >
                  Reject
                </button>
              </div>
            )}

          {modalOpen && modalMode === "assign" && (
            <ModalBody>
              <div className="mt-4">
                {modalMode === "assign" ? (
                  <>
                    <p className="text-sm font-medium text-gray-700">
                      {(incident.incidentAssignee?.length ?? 0) > 0 &&
                      incident.incidentAssignee?.every(
                        (assignee) => assignee.acceptanceStatus === false,
                      )
                        ? "Reassign Contractor"
                        : "Assign Contractor"}
                    </p>
                    <select
                      className="mt-2 w-full rounded border p-2"
                      onChange={(e) => setSelectedContractor(e.target.value)}
                      value={selectedContractor}
                    >
                      <option value="">Select option</option>
                      {workers?.data?.map((contractor) => (
                        <option
                          key={contractor.id}
                          value={contractor.id}
                          className="capitalize"
                        >
                          {contractor.name}
                        </option>
                      ))}
                    </select>
                  </>
                ) : modalMode === "cancel" ? (
                  <div className="mt-4">
                    <textarea
                      className="w-full rounded border p-2"
                      placeholder="Add rejection reason..."
                      rows={3}
                      onChange={(e) => setComment(e.target.value)}
                    />
                  </div>
                ) : null}

                <div className="mt-4 flex justify-end">
                  <Button
                    title="Confirm"
                    onClick={handleDone}
                    loading={
                      assignIncidentToWorker.isPending ||
                      updateIncidentStatus.isPending
                    }
                    disabled={!selectedContractor && !comment}
                  />

                  <button
                    onClick={handleDone}
                    className="rounded-md bg-red-500 px-4 py-2 font-semibold text-white"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </ModalBody>
          )}
        </div>
      </div>
    </div>
  );
}
