// src/app/incidents/[id]/page.tsx
"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { api } from "@/trpc/react";
import { toast } from "react-toastify";
import { useParams, useRouter } from "next/navigation";
import { severityMapping } from "@/constants/severity";
import Button from "@/components/ui/Button";
import { ModalBody, useModal } from "@/components/ui/animated-modal";
import { hasPermission } from "@/lib/auth";
import { useSession } from "next-auth/react";
import { Select } from "@/components/ui/Select";
export default function IncidentDetailScreen() {
  const params = useParams();
  const { setOpen } = useModal();
  const session = useSession();
  const router = useRouter();
  //   const incidentId = params.id as string;
  const { id } = params as { id: string };
  const {
    data: incidentData,
    isLoading,
    refetch,
  } = api.incidents.getIncidentById.useQuery({
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
  const [modalMode, setModalMode] = useState<
    "accept" | "reject" | "assign" | "cancel" | ""
  >("accept");
  const user = session.data?.user;

  const statusMapping = {
    INITIATED: "bg-blue-100 dark:bg-blue-900 dark:bg-opacity-50 text-blue-600",
    IN_PROGRESS:
      "bg-yellow-100 dark:bg-yellow-900 dark:bg-opacity-50 text-yellow-600",
    COMPLETED:
      "bg-green-100 dark:bg-green-900 dark:bg-opacity-50 text-green-600",
    CANCELLED: "bg-red-100 dark:bg-red-900 dark:bg-opacity-50 text-red-600",
    ASSIGNED:
      "bg-purple-100 dark:bg-purple-900 dark:bg-opacity-50 text-purple-600",
  };
  const assignees = Array.isArray(incident?.incidentAssignee)
    ? incident?.incidentAssignee
    : incident?.incidentAssignee
      ? [incident.incidentAssignee]
      : [];
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
        acceptanceStatus: flag,
      },
      {
        onSuccess: () => {
          toast.success(`Report has been ${flag ? "Accepted" : "Rejected"}`);
          void refetch();
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
          void refetch();
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
          void refetch();
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

    const assignees = Array.isArray(incident?.incidentAssignee)
      ? incident.incidentAssignee
      : incident?.incidentAssignee
        ? [incident.incidentAssignee]
        : [];

    try {
      if (modalMode === "cancel") {
        await updateIncidentStatus.mutateAsync({
          incidentReportId: incident.incidentReport.id,
          status: "CANCELLED",
          comments: comment,
        });
        toast.success("Incident cancelled successfully");
        void refetch();
      } else if (
        modalMode === "assign" ||
        (assignees.length > 0 &&
          assignees.every((assignee) => assignee.acceptanceStatus === false))
      ) {
        await assignIncidentToWorker.mutateAsync({
          incidentReportId: incident.incidentReport.id,
          assignedTo: selectedContractor,
        });
        toast.success("Contractor assigned successfully");
        void refetch();
      }
    } catch (error) {
      toast.error("Failed to update incident");
      console.error(error);
    } finally {
      setOpen(false);
      setModalMode("");
    }
  };

  if (isLoading || !incident) {
    return (
      <div className="relative flex h-2/3 w-full items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
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

      <div className="rounded-lg border bg-white p-6 shadow-md dark:border-gray-500 dark:bg-gray-800 dark:text-white dark:shadow-gray-700">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-row items-center gap-4">
            <h2
              className="text-xl font-semibold capitalize"
              style={{
                color:
                  severityMapping[incident?.incidentReport?.priority] ??
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
              {incident.incidentReport.status.replace("_", " ")}
            </span>
          </div>
          <div className="flex flex-row items-center gap-4">
            {user &&
              hasPermission(user.role, "assign:contractors") &&
              incident.incidentReport.status !== "COMPLETED" &&
              incident.incidentReport.status !== "CANCELLED" && (
                <>
                  {assignees.length === 0 ||
                  incident.incidentAssignee == null ? (
                    // Show "Assign Contractor" if no one is assigned
                    <Button
                      title="Assign Contractor"
                      icon={<UserPlus size={14} />}
                      onClick={() => {
                        setModalMode("assign");
                        setOpen(true);
                      }}
                    />
                  ) : assignees.every(
                      (assignee) => assignee.acceptanceStatus === false,
                    ) ? (
                    // Show "Reassign Contractor" if all rejected
                    <div className="flex items-center gap-4">
                      <p className="font-semibold text-primary">Rejected!</p>
                      <Button
                        title="Reassign Contractor"
                        icon={<UserPlus size={16} />}
                        onClick={() => {
                          setModalMode("assign");
                          setOpen(true);
                        }}
                      />
                    </div>
                  ) : null}
                </>
              )}

            {user &&
              hasPermission(user.role, "cancel:incidents") &&
              incident.incidentReport.status === "INITIATED" && (
                <Button
                  title="Cancel Incident"
                  //   icon={<UserPlus size={16} />}
                  onClick={() => {
                    setModalMode("cancel");
                    setOpen(true);
                  }}
                  variant="secondary"
                />
              )}
          </div>
        </div>

        <div className="mt-4 space-y-4">
          <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
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
              {incident.incidentAssignee && assignees.length > 0 ? (
                <div className="mt-3 space-y-2">
                  <p className="text-sm font-semibold text-red-500">
                    Assigned Contractor(s):
                  </p>
                  {assignees.map((assignee, index) =>
                    assignee.assignedToData ? (
                      <p
                        key={index}
                        className="text-sm capitalize text-gray-700 dark:text-gray-300"
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
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                Incident Gallery
              </h3>
              {groupedImages.map(
                ({ status, images }) =>
                  images?.length > 0 && (
                    <div key={status} className="mt-2">
                      <p className="text-sm font-medium capitalize text-gray-700 dark:text-gray-300">
                        {status.toLocaleLowerCase().replace("_", " ")} images
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {images && images.length > 0 ? (
                          images.map((image, index) => (
                            <img
                              key={image.id || index}
                              src={image.url || "/images/n-img.jpg"}
                              alt={`Incident Image ${index + 1}`}
                              className="h-20 w-20 cursor-pointer rounded-lg object-contain shadow-md transition-transform duration-200 hover:scale-105 sm:h-28 sm:w-28"
                              onClick={() =>
                                image.url && window.open(image.url, "_blank")
                              }
                              width={1000}
                              height={1000}
                            />
                          ))
                        ) : (
                          <img
                            src="/images/no-img.jpg"
                            alt="No Image Available"
                            className="h-20 w-20 rounded-lg object-contain shadow-md sm:h-28 sm:w-28"
                            width={1000}
                            height={1000}
                          />
                        )}
                      </div>
                    </div>
                  ),
              )}
            </div>
          ) : null}
          <div className="flex items-center gap-4">
            {user &&
              hasPermission(user.role, "start:incident") &&
              incident.incidentReport.status === "ASSIGNED" &&
              assignees?.[0]?.acceptanceStatus == true && (
                <Button title="Mark as Start" onClick={() => handleStart()} />
              )}
            {user &&
              hasPermission(user.role, "complete:incident") &&
              incident.incidentReport.status === "IN_PROGRESS" &&
              assignees?.[0]?.acceptanceStatus == true && (
                <Button
                  title="Mark as Completed"
                  onClick={() => handleComplete()}
                />
              )}
          </div>

          {user &&
            hasPermission(user.role, "accept/reject:incidents") &&
            incident.incidentReport.status === "ASSIGNED" &&
            assignees?.[0]?.acceptanceStatus == null &&
            !decision && (
              <div className="mt-6 flex items-center gap-4">
                <button
                  onClick={() => {
                    setDecision("accept");
                    void handleAcceptAndReject(true);
                  }}
                  className="rounded-full bg-primary px-4 py-2 text-white"
                >
                  Accept
                </button>
                <button
                  onClick={() => {
                    setDecision("reject");
                    void handleAcceptAndReject(true);
                  }}
                  className="rounded-full border border-primary px-4 py-2 text-primary"
                >
                  Reject
                </button>
              </div>
            )}

          {(modalMode === "assign" || modalMode === "cancel") && (
            <ModalBody className="max-w-2xl">
              <div className="mt-4">
                {modalMode === "assign" ? (
                  <Select
                    label={
                      (assignees.length ?? 0) > 0 &&
                      assignees.every(
                        (assignee) => assignee.acceptanceStatus === false,
                      )
                        ? "Reassign Contractor"
                        : "Assign Contractor"
                    }
                    className="mt-2 w-full rounded border p-2"
                    onChange={(e) => setSelectedContractor(e.target.value)}
                    value={selectedContractor}
                    options={
                      workers?.data?.map((contractor) => ({
                        value: contractor.id,
                        label: contractor.name,
                      })) ?? []
                    }
                  />
                ) : modalMode === "cancel" ? (
                  <div className="mt-4">
                    <textarea
                      className="mb-4 min-h-28 w-full rounded-lg border bg-gray-50 p-2 shadow focus-visible:outline-none focus-visible:ring-[2px] focus-visible:ring-neutral-400 dark:bg-gray-700 dark:text-white"
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
                </div>
              </div>
            </ModalBody>
          )}
        </div>
      </div>
    </div>
  );
}
