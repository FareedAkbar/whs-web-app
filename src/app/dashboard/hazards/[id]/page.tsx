// src/app/incidents/[id]/page.tsx
"use client";

import { useState } from "react";
import { Download, DownloadIcon, UserPlus } from "lucide-react";
import { api } from "@/trpc/react";
import { toast } from "react-toastify";
import { useParams } from "next/navigation";
import { useRouter } from "next/router";
import { severityMapping } from "@/constants/severity";
import Button from "@/components/ui/Button";
import { ModalBody, useModal } from "@/components/ui/animated-modal";
import { hasPermission } from "@/lib/auth";
import { useSession } from "next-auth/react";
import { Select } from "@/components/ui/Select";
import { type } from "os";
import { User } from "@/types/user";
import CommentsSection from "@/components/ui/CommentsSection";
import FollowUpsSection from "@/components/ui/FollowUpsSection";
import { Comment, IncidentMedia } from "@/types/report";
import Image from "next/image";
export default function HazardDetailScreen() {
  const params = useParams();
  // const { data: departments, isLoading: isLoadingDepartments } =
  //   api.groups.getGroupData.useQuery({ groupType: "DEPARTMENT" });
  const { data: officers } = api.users.getUsersByRole.useQuery({
    role: "FACILITY_OFFICER",
  });
  const { setOpen } = useModal();
  const session = useSession();
  const router = useRouter();
  //   const incidentId = params.id as string;
  const { id } = params as { id: string };
  const {
    data: incidentData,
    isLoading,
    refetch,
  } = api.incidents.getReportById.useQuery({
    reportId: id,
    type: "HAZARD",
  });
  // const { data: workers } = api.workers.getWorkers.useQuery();
  // const { data: departments } = api.department.getDepartments.useQuery();
  const assignIncidentToOfficer = api.incidents.assignIncident.useMutation();
  const updateIncidentStatus = api.incidents.updateIncidentStatus.useMutation();
  const updateReportStatus = api.reports.updateReportStatus.useMutation();
  const incidentAcceptance = api.incidents.incidentAcceptance.useMutation();
  const hazard = incidentData?.data;
  const [selectedOfficer, setSelectedOfficer] = useState("");
  // const [selectedDepartment, setSelectedDepartment] = useState("");
  // const [comment, setComment] = useState("");
  // const [decision, setDecision] = useState<"accept" | "reject" | null>(null);
  const [modalMode, setModalMode] = useState<
    "accept" | "reject" | "assign" | "cancel" | "" | "assign-officer"
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

  const statusOrder = [
    "INITIATED",
    "ASSIGNED",
    "IN_PROGRESS",
    "COMPLETED",
    "CANCELLED",
  ];
  const handleAcceptAndReject = (flag: boolean) => {
    if (!hazard) return;
    incidentAcceptance.mutate(
      {
        incidentReportId: hazard.report.id,
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

  const handleDownload = (url?: string, filename?: string) => {
    if (!url) return;
    // open in new tab (user can right click -> save) and also force download
    const a = document.createElement("a");
    a.href = url;
    a.download = filename ?? "image";
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const groupedImages = statusOrder.map((status) => ({
    status,
    images:
      hazard?.media?.filter(
        (image: IncidentMedia) => image.status === status,
      ) ?? [],
  }));
  const handleUpdateStatus = (newStatus: string) => {
    if (!hazard) return;
    updateIncidentStatus.mutate(
      {
        hazardId: hazardMeta?.id! ?? "",
        status: newStatus,
      },
      {
        onSuccess: () => {
          toast.success(`Hazard ${newStatus.toLowerCase()} successfully`);
          void refetch();
        },
        onError: (error) => {
          toast.error(error.message ?? "Something went wrong");
        },
      },
    );
  };
  const closeIncident = () => {
    if (!hazard) return;
    updateReportStatus.mutate(
      {
        incidentReportId: hazard.report.id,
        status: "CLOSED",
      },
      {
        onSuccess: () => {
          toast.success(`Hazard report has been closed`);
          void refetch();
        },
        onError: (error) => {
          toast.error(error.message ?? "Something went wrong");
        },
      },
    );
  };
  const handleDone = () => {
    if (!hazard) return;

    try {
      // if (modalMode === "cancel") {
      //    updateIncidentStatus.mutate({
      //     incidentReportId: hazard.report.id,
      //     status: "CANCELLED",
      //     comments: comment,
      //   });
      //   toast.success("Hazard cancelled successfully");
      //   void refetch();
      // } else
      // if (
      //   modalMode === "assign-officer"
      //   // ||
      //   // (assignees.length > 0 &&
      //   //   assignees.every((assignee) => assignee.acceptanceStatus === false))
      // ) {

      assignIncidentToOfficer.mutate(
        {
          assignedTo:
            user?.role === "FACILITY_MANAGER"
              ? selectedOfficer
              : (user?.id! ?? ""),
          hazardId: hazard.hazard?.id! ?? "",
          reportId: hazard.report.id,
        },
        {
          onSuccess: () => {
            toast.success(
              `${
                user?.role === "FACILITY_MANAGER"
                  ? "Hazard assigned successfully"
                  : "Hazard picked successfully"
              }`,
            );
            setOpen(false); // ✅ This will now close the modal
            setModalMode("");
            void refetch();
          },
          onError: (error: ErrorResponse) => {
            toast.error(error.message ?? "Something went wrong");
          },
        },
      );
      // }
    } catch (error) {
      toast.error("Failed to update hazard");
      console.error(error);
    }
  };

  if (isLoading || !hazard) {
    return (
      <div className="relative flex h-2/3 w-full items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    );
  }
  // convenience getters
  const report = hazard.report;
  const hazardMeta = hazard.hazard;
  const assignee = hazard.incidentAssignee ?? null;

  return (
    <div className="flex w-full flex-col px-8 py-6">
      <button
        onClick={() => router.back()}
        className="mb-4 flex items-center text-sm text-primary"
      >
        ← Back to List
      </button>

      <div className="rounded-lg border bg-white p-6 shadow-md dark:border-gray-500 dark:bg-gray-800 dark:text-white dark:shadow-gray-700">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-row items-center gap-4">
            <h2
              className="text-xl font-semibold capitalize"
              style={{
                color: severityMapping[report.priority] ?? "black",
              }}
            >
              {report.title}
            </h2>

            <span
              className={`rounded-full px-3 py-1 text-xs ${
                // try to use statusMapping constant, otherwise fallback styles
                statusMapping[report.status as keyof typeof statusMapping] ??
                "bg-gray-100 text-gray-700"
              }`}
            >
              {report.status.replaceAll("_", " ")}
            </span>
          </div>

          <div className="flex flex-row items-center gap-4">
            {/* Cancel (example) */}
            {hasPermission(user?.role!, "assign:officer") &&
              !hazard?.incidentAssignee && (
                <Button
                  title="Assign Officer"
                  onClick={() => {
                    setModalMode("assign-officer");
                    setOpen(true);
                    // open modal logic left to you — this demonstrates the button
                  }}
                />
              )}
            severu
            {hasPermission(user?.role!, "pick:hazard") &&
              !hazard?.incidentAssignee && (
                <Button
                  title="Pick Hazard"
                  onClick={() => {
                    setSelectedOfficer(user?.id ?? "");
                    handleDone();
                  }}
                  loading={assignIncidentToOfficer.isPending}
                  disabled={assignIncidentToOfficer.isPending}
                />
              )}
            {/* Complete Hazard - allowed roles & when assigned / in progress */}
            {user &&
              hasPermission(user.role, "complete:hazard") &&
              hazardMeta?.status === "ASSIGNED" && (
                <Button
                  title={"Complete Hazard"}
                  onClick={() => {
                    if (
                      report.followUp &&
                      !hazard.followUps?.some(
                        (f: Comment) => f.userId === user.id,
                      )
                    ) {
                      toast.error(
                        "Please add a follow-up before completing the hazard",
                      );
                      return;
                    }
                    void handleUpdateStatus("COMPLETED");
                  }}
                  loading={updateIncidentStatus.isPending}
                  disabled={updateIncidentStatus.isPending}
                  // disabled={isUpdatingStatus}
                />
              )}
            {/* Close Hazard - P_AND_C_MANAGER when hazard completed */}
            {hasPermission(user?.role!, "close:hazard") &&
              hazardMeta?.status === "COMPLETED" &&
              report.status !== "CLOSED" && (
                <Button
                  title={"Close Hazard"}
                  onClick={closeIncident}
                  loading={updateReportStatus.isPending}
                  disabled={updateReportStatus.isPending}
                  // disabled={isUpdatingStatus}
                  // variant="secondary"
                />
              )}
            {hasPermission(session.data?.user?.role!, "cancel:incidents") &&
              report.status === "INITIATED" && (
                <Button
                  title="Cancel Hazard"
                  variant="secondary"
                  onClick={() => {
                    setModalMode("cancel");
                    // open modal logic left to you — this demonstrates the button
                  }}
                />
              )}
          </div>
        </div>

        <div className="mt-4 space-y-4">
          {/* Report Description */}
          <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <p>
              <span className="font-medium">Report Description:</span>
              <br />
              {report.description}
            </p>

            {/* Detailed description from hazard object (if present) */}
            {hazardMeta?.hazardDescription && (
              <p>
                <span className="font-medium text-red-500">
                  Hazard Detailed Description:
                </span>
                {hazardMeta.hazardDescription}
              </p>
            )}

            {/* Assigned to */}
            <div className="mt-4">
              {assignee ? (
                <div className="mt-3 space-y-2">
                  <p className="text-sm font-semibold text-red-500">
                    Assigned to:
                  </p>
                  <p className="text-sm capitalize text-gray-700 dark:text-gray-300">
                    {assignee.name} ({assignee.role.replaceAll("_", " ")})
                  </p>
                </div>
              ) : (
                <p className="text-sm font-medium">No Officer assigned.</p>
              )}
            </div>
          </div>

          {/* Images */}
          {groupedImages.length ? (
            <div className="mt-6">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                Hazard Gallery
              </h3>

              {groupedImages.map(({ status, images }) =>
                images?.length ? (
                  <div key={status} className="mt-2">
                    {/* <p className="text-sm font-medium capitalize text-gray-700 dark:text-gray-300">
                      {status.toLocaleLowerCase().replaceAll("_", " ")} images
                    </p> */}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {images.map(
                        (
                          image: { id?: string; url?: string; status?: string },
                          index: number,
                        ) => (
                          <div
                            key={image.id ?? index}
                            className="relative cursor-pointer rounded-lg"
                          >
                            <Image
                              src={image.url ?? "/images/n-img.jpg"}
                              alt={`Hazard Image ${index + 1}`}
                              className="h-20 w-20 rounded-lg object-cover shadow-md transition-transform duration-200 hover:scale-105 sm:h-28 sm:w-28"
                              onClick={() =>
                                image.url && window.open(image.url, "_blank")
                              }
                            />
                            <button
                              onClick={() =>
                                handleDownload(
                                  image.url,
                                  `incident_${index}.jpg`,
                                )
                              }
                              className="absolute right-1 top-1 rounded-full bg-white/90 p-1 text-xs shadow"
                            >
                              <DownloadIcon className="h-3 w-3" color="red" />
                            </button>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                ) : null,
              )}
            </div>
          ) : null}

          <CommentsSection
            comments={hazard?.comments}
            reportId={hazard?.report.id}
            onCommentAdded={() => void refetch()}
          />

          {/* Role-based action buttons */}
          <div className="mt-4 flex items-center gap-4">
            {/* Pick Hazard (for P_AND_C_OFFICER or any user who can self pick) */}

            {modalMode == "assign-officer" && (
              <ModalBody className="max-w-2xl">
                <div className="mt-4">
                  <Select
                    label="Assign Officer"
                    className="mt-2 w-full rounded border p-2"
                    onChange={(e) => setSelectedOfficer(e.target.value)}
                    value={selectedOfficer}
                    options={
                      officers?.data?.map((o: User) => ({
                        value: o.id,
                        label: o.name,
                      })) ?? []
                    }
                  />
                  <div className="mt-4 flex justify-end">
                    <Button
                      title="Confirm"
                      onClick={handleDone}
                      loading={assignIncidentToOfficer.isPending}
                      disabled={!selectedOfficer}
                    />
                  </div>
                </div>
              </ModalBody>
            )}
            {/* Capture / Upload (for staff when hazard is completed but report not closed) */}
            {user?.role === "STAFF" &&
              hazardMeta?.status === "COMPLETED" &&
              report.status !== "CLOSED" && (
                <Button
                  title="Capture or Upload"
                  onClick={() => {
                    // for now, just a placeholder
                    console.log("open upload");
                  }}
                />
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
