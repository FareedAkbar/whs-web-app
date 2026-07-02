// src/app/incidents/[id]/page.tsx
"use client";

import { useState } from "react";
import { Download, DownloadIcon, UserPlus } from "lucide-react";
import { api } from "@/trpc/react";
import { toast } from "react-toastify";
import { useParams, useRouter } from "next/navigation";
import { severityMapping, severityDisplayMapping } from "@/constants/severity";
import Button from "@/components/ui/Button";
import { ModalBody, useModal } from "@/components/ui/animated-modal";
import { hasPermission } from "@/lib/auth";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Select } from "@/components/ui/Select";
import { type } from "os";
import { User } from "@/types/user";
import CommentsSection from "@/components/ui/CommentsSection";
import FollowUpsSection from "@/components/ui/FollowUpsSection";
import { Comment, IncidentMedia } from "@/types/report";
import Image from "next/image";

import LogsSection from "@/components/ui/LogsSection";
export default function IncidentDetailScreen() {
  const params = useParams();
  const { data: officers, isLoading: isLoadingOfficers } =
    api.users.getUsersByRole.useQuery({ role: "P_AND_C_OFFICER" });
  const { data: allUsersRes } = api.users.getUsers.useQuery();
  const { setOpen } = useModal();
  const session = useSession();
  const router = useRouter();
  const { id } = params as { id: string };
  const {
    data: incidentData,
    isLoading,
    refetch,
  } = api.incidents.getReportById.useQuery({
    reportId: id,
    type: "INCIDENT",
  });
  // const { data: workers } = api.workers.getWorkers.useQuery();
  // const { data: departments } = api.department.getDepartments.useQuery();
  const assignIncidentToOfficer = api.incidents.assignIncident.useMutation();
  const updateIncidentStatus = api.incidents.updateIncidentStatus.useMutation();
  const updateReportStatus = api.reports.updateReportStatus.useMutation();
  const incidentAcceptance = api.incidents.incidentAcceptance.useMutation();
  const incident = incidentData?.data;
  const [selectedOfficer, setSelectedOfficer] = useState("");
  // const [selectedDepartment, setSelectedDepartment] = useState("");
  // const [comment, setComment] = useState("");
  // const [decision, setDecision] = useState<"accept" | "reject" | null>(null);
  const [modalMode, setModalMode] = useState<
    | "accept"
    | "reject"
    | "assign"
    | "cancel"
    | ""
    | "assign-officer"
    | "reassign-officer"
  >("accept");
  const user = session.data?.user;
  const statusMapping = {
    INITIATED: "bg-blue-100 dark:bg-blue-900 dark:bg-opacity-50 text-blue-600",
    CLOSED:
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
  const handleAcceptAndReject = async (flag: boolean) => {
    if (!incident) return;
    await incidentAcceptance.mutateAsync(
      {
        incidentReportId: incident.report.id,
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


  // const handleUpdateStatus = async (newStatus: string) => {
  //   if (!incident) return;
  //   await updateIncidentStatus.mutateAsync(
  //     {
  //       incidentId: incidentMeta?.id! ?? "",
  //       status: newStatus,
  //     },
  //     {
  //       onSuccess: () => {
  //         toast.success(`Incident ${newStatus.toLowerCase()} successfully`);
  //         void refetch();
  //       },
  //       onError: (error) => {
  //         toast.error(error.message ?? "Something went wrong");
  //       },
  //     },
  //   );
  // };
  const closeIncident = async () => {
    if (!incident) return;
    await updateReportStatus.mutateAsync(
      {
        incidentReportId: incident.report.id,
        comments:`Incident closed by ${user?.name} (${user?.email})`,
        status: "CLOSED",
      },
      {
        onSuccess: () => {
          toast.success(`Incident report has been closed`);
          void refetch();
        },
        onError: (error) => {
          toast.error(error.message ?? "Something went wrong");
        },
      },
    );
  };
  const completeIncident = async () => {
    if (!incident) return;
    await updateReportStatus.mutateAsync(
      {
        incidentReportId: incident.report.id,
        comments:`Incident completed by ${user?.name} (${user?.email})`,
        status: "COMPLETED",
      },
      {
        onSuccess: () => {
          toast.success(`Incident report has been completed`);
          void refetch();
        },
        onError: (error) => {
          toast.error(error.message ?? "Something went wrong");
        },
      },
    );
  };
 // Dedicated pick handler — uses session user id directly
const handlePickIncident = () => {
  if (!incident || !user?.id) return;

  assignIncidentToOfficer.mutate(
    {
      assignedTo: user.id,
      incidentId: incident.incident?.id ?? "",
      reportId: incident.report.id,
      comments:`Incident is picked by ${user.name}(${user.email})`
    },
    {
      onSuccess: () => {
        toast.success("Incident picked successfully");
        void refetch();
      },
      onError: (error: any) => {
        toast.error(error.message ?? "Something went wrong");
      },
    },
  );
};

// Assign / Reassign handler — uses selectedOfficer from dropdown
const handleDone = () => {
  if (!incident || !selectedOfficer) return;
const isSelectingSelf = selectedOfficer === user?.id;

const assignedToName = isSelectingSelf
  ? user?.name
  : officers?.data?.find((o: User) => o.id === selectedOfficer)?.name;

const assignedToEmail = isSelectingSelf
  ? user?.email
  : officers?.data?.find((o: User) => o.id === selectedOfficer)?.email;
  const isReassign = modalMode === "reassign-officer";
 const comments = isSelectingSelf
    ? `Incident is picked by ${user?.name} (${user?.email})`
    : isReassign
      ? `Incident reassigned to ${assignedToName} (${assignedToEmail}) by ${user?.name} (${user?.email})`
      : `Incident assigned to ${assignedToName} (${assignedToEmail}) by ${user?.name} (${user?.email})`;

  assignIncidentToOfficer.mutate(
    {
      assignedTo: selectedOfficer,
      incidentId: incident.incident?.id ?? "",
      reportId: incident.report.id,
      comments

    },
    {
      onSuccess: () => {
        toast.success(
          modalMode === "reassign-officer"
            ? "Officer reassigned successfully"
            : "Officer assigned successfully",
        );
        setOpen(false);
        setModalMode("");
        setSelectedOfficer("");
        void refetch();
      },
      onError: (error: any) => {
        toast.error(error.message ?? "Something went wrong");
      },
    },
  );
};

  if (isLoading || !incident) {
    return (
      <div className="relative flex h-2/3 w-full items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    );
  }
  // convenience getters
  const report = incident.report;
  const incidentMeta = incident.incident;
  const assignee = incident.incidentAssignee ?? null;

  const reporter = allUsersRes?.data?.find((u) => u.id === report.userId);
  const reporterText = reporter ? `${reporter.name} (${reporter.email})` : "N/A";

  return (
    <div className="flex w-full flex-col px-8 py-6">
      <button
        onClick={() => router.back()}
        className="mb-4 flex items-center text-sm text-primary"
      >
        ← Back to List
      </button>

      <div className="rounded-lg border bg-white p-6 shadow-md dark:border-gray-500 dark:bg-gray-900 dark:text-white dark:shadow-gray-700">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
           
            <div className="flex flex-row items-center gap-4">
              <h2
                className="text-xl font-semibold capitalize"
                style={{
                  color: severityMapping[report.priority] ?? "black",
                }}
              >Ticket#{incident.incident?.ticket_number} - {" "}
                {report.title}
              </h2>

              <span
                className={`rounded-full px-3 py-1 text-xs ${statusMapping[report?.status as keyof typeof statusMapping]}`}
              >
                {report?.status.replaceAll("_", " ")}
              </span>
            </div>
          </div>

          <div className="flex flex-row items-center gap-4">
            {/* Cancel (example) */}
            {hasPermission(user?.role!, "assign:officer") &&
              !incident?.incidentAssignee && (
                <Button
                  title="Assign Officer"
                  onClick={() => {
                    setModalMode("assign-officer");
                    setOpen(true);
                    // open modal logic left to you — this demonstrates the button
                  }}
                />
              )}
            {hasPermission(user?.role!, "assign:officer") &&
              incident?.incidentAssignee &&
              incident.report?.status === "ASSIGNED" && (
                <Button
                  title="Reassign Officer"
                  onClick={() => {
                    setModalMode("reassign-officer");
                    setOpen(true);
                  }}
                />
              )}
            {hasPermission(user?.role!, "pick:incident") &&
              !incident?.incidentAssignee && (
                <Button
                  title="Pick Incident"
                  onClick={handlePickIncident}
                  loading={assignIncidentToOfficer.isPending}
                  disabled={assignIncidentToOfficer.isPending}
                />
              )}
            {/* Complete Incident - allowed roles & when assigned / in progress */}
            {user &&
              hasPermission(user.role, "complete:incident") &&
              incident.report?.status === "ASSIGNED" &&
              incident?.incidentAssignee.id === user.id && (
                <Button
                  title={"Complete Incident"}
                  onClick={() => {
                    if (
                      report.followUp &&
                      !incident.followUps?.some(
                        (f: Comment) => f.userId === user.id,
                      )
                    ) {
                      toast.error(
                        "Please add a follow-up before completing the incident",
                      );
                      return;
                    }
                    void completeIncident();
                  }}
                  loading={updateReportStatus.isPending}
                  disabled={updateReportStatus.isPending}
                  // disabled={isUpdatingStatus}
                />
              )}

            {/* Close Incident - P_AND_C_MANAGER when incident completed */}
            {hasPermission(user?.role!, "close:incident") &&
              report?.status === "COMPLETED" &&
               (
                <Button
                  title={"Close Incident"}
                  onClick={() =>   void closeIncident() }
                  loading={updateReportStatus.isPending}
                  disabled={updateReportStatus.isPending}
                  // disabled={isUpdatingStatus}
                  // variant="secondary"
                />
              )}
            {hasPermission(session.data?.user?.role!, "cancel:incidents") &&
              report.status === "INITIATED" && (
                <Button
                  title="Cancel Incident"
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
              <span className="font-medium text-primary">
                Report Description:
              </span>
              <br />
              {report.description}
            </p>

            {/* Detailed description from incident object (if present) */}
            {incidentMeta?.incidentDescription && (
              <p>
                <span className="font-medium text-primary">
                  Incident Detailed Description:
                </span>
                <br />
                {incidentMeta.incidentDescription}
              </p>
            )}

            {/* Assigned to */}
            <div className="mt-4">
              {assignee ? (
                <div className="mt-3 space-y-1">
                  <p className="text-sm font-semibold text-red-500">
                    {incident.incidentAssignee.assigntype === "SELF_ASSIGNED"
                      ? "Picked by:"
                      : "Assigned to:"}
                  </p>
                  <p className="text-sm capitalize text-gray-700 dark:text-gray-300">
                    {assignee.name} ({assignee.role.replaceAll("_", " ")})
                  </p>
                  <p className="text-sm  text-gray-700 dark:text-gray-300">
                    {assignee.email} 
                  </p>
                </div>
              ) : (
                <p className="text-sm font-medium underline">
                  No Officer assigned.
                </p>
              )}
            </div>
          </div>

          {/* Images */}
          {incident.media?.length > 0 ? (
            <div className="mt-6">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                Incident Gallery
              </h3>

              <div className="mt-2 flex flex-wrap gap-2">
                {incident.media.map(
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
                        alt={`Incident Image ${index + 1}`}
                        className="h-20 w-20 rounded-lg object-cover shadow-md transition-transform duration-200 hover:scale-105 sm:h-28 sm:w-28"
                        onClick={() =>
                          image.url && window.open(image.url, "_blank")
                        }
                        width={112}
                        height={112}
                      />
                      
                      {/* <button
                        onClick={() =>
                          handleDownload(
                            image.url,
                            `hazard_${index}.jpg`,
                          )
                        }
                        className="absolute right-1 top-1 rounded-full bg-white/90 p-1 text-xs shadow"
                      >
                        <DownloadIcon className="h-3 w-3" color="red" />
                      </button> */}
                    </div>
                  ),
                )}
              </div>
            </div>
          ) : (
            <p className="mt-6 text-sm text-gray-500">
              No images available for this incident.
            </p>
          )}

          {/* Medical Details */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h4 className="mb-2 text-lg font-semibold text-gray-700 dark:text-gray-300">
              Medical Details
            </h4>

            <div className="space-y-2 text-sm">
              <div className="flex gap-2">
                <span className="font-medium text-gray-600 dark:text-gray-400">
                  Incident:
                </span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {incidentMeta?.name ?? "N/A"}
                </span>
              </div>

              <div className="flex gap-2">
                <span className="font-medium text-gray-600 dark:text-gray-400">
                  Injured Part:
                </span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {incidentMeta?.injuredBodyPart ?? "N/A"}
                </span>
              </div>

              <div className="flex gap-2">
                <span className="font-medium text-gray-600 dark:text-gray-400">
                  Treatment Type:
                </span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {incidentMeta?.treatmentType?.replaceAll("_", " ") ?? "N/A"}
                </span>
              </div>
              {incidentMeta?.treatmentDescription!="" && (

                            <div className="flex gap-2">
                              <span className="font-medium text-gray-600 dark:text-gray-400">
                                Treatment Description:
                              </span>
                              <span className="font-semibold text-gray-800 dark:text-gray-200">
                                {incidentMeta?.treatmentDescription }
                              </span>
                            </div>
              )}

              <div className="flex gap-2">
                <span className="font-medium text-gray-600 dark:text-gray-400">
                  Created at:
                </span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {incidentMeta?.createdAt
                    ? new Date(incidentMeta.createdAt).toLocaleString()
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Linked Hazard</h3>
            </div>

            {incident.links?.length ? (
              <div className="space-y-4">
                {incident.links.map((link) => (
                  <div
                    key={link.linkId}
                    className="flex items-center justify-between rounded-lg shadow dark:bg-gray-700 bg-gray-50 p-4"
                  >
                    <div>
                      <p className="font-medium">
                        {link.reportTitle}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Type: {link.linkType}
                      </p>
                      {link.reportDescription && (
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                          {link.reportDescription}
                        </p>
                      )}
                      {link.linkDescription && (
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                          {link.linkDescription}
                        </p>
                      )}

                    </div>
          {hasPermission(user?.role!, "view:hazards") && (
                    <Button
                      variant="primary"
                      onClick={() =>
                        router.push(
                          `/dashboard/hazards/${link.reportId}?`
                        )
                      }
                      title="View Hazard"
                    />
                  )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No linked hazard found.</p>
            )}
          </div>
          <CommentsSection
            comments={incident?.comments}
            reportId={incident?.report.id}
            onCommentAdded={() => void refetch()}
          />
          {incident?.report.followUp && (
            <FollowUpsSection
              followUps={incident?.followUps ?? []}
              reportId={incident?.report.id}
              onFollowUpAdded={() => void refetch()}
            />
          )}
          <LogsSection logs={incident?.reportLogs ?? []} />


          {/* Role-based action buttons */}
          <div className="mt-4 flex items-center gap-4">
            {/* Pick Incident (for P_AND_C_OFFICER or any user who can self pick) */}

            {modalMode === "assign-officer" && (
              <ModalBody className="max-w-2xl p-4">
                <div className="mt-4">
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Assign Officer
                  </label>

                  <div className="max-h-64 overflow-y-auto rounded-md border border-gray-200 dark:border-gray-600">
                    {(officers?.data ?? []).map((o: User) => (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => setSelectedOfficer(o.id)}
                        className={`flex w-full items-center justify-between gap-3 border-b px-4 py-3 text-left last:border-0 transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50 ${
                          selectedOfficer === o.id ? "bg-primary/10 dark:bg-primary/20" : ""
                        }`}
                      >
                        {/* Left: name + email */}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {o.name}
                          </p>
                          <p className="text-xs text-red-500">{o.email}</p>
                        </div>

                        {/* Right: role */}
                        <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                          {o.role.replaceAll("_", " ")}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 flex justify-end">
                    <Button
                      title="Confirm"
                      onClick={handleDone}
                      loading={
                        assignIncidentToOfficer.isPending ||
                        updateIncidentStatus.isPending
                      }
                      disabled={!selectedOfficer}
                    />
                  </div>
                </div>
              </ModalBody>
            )}
           {modalMode === "reassign-officer" && (
              <ModalBody className="max-w-2xl p-4">
                <div className="mt-4">
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Reassign Officer
                  </label>

                  {/* Custom dropdown list */}
                  <div className="max-h-64 overflow-y-auto rounded-md border border-gray-200 dark:border-gray-600">
                    {(
                      (officers?.data
                        ?.filter(
                          (o: User) =>
                            o.id !== incident?.incidentAssignee?.id &&
                            o.id !== user?.id,
                        )
                        .map((o: User) => ({
                          value: o.id,
                          name: o.name,
                          email: o.email,
                          role: o.role.replaceAll("_", " "),
                          isYou: false,
                        })) ?? []
                      ).concat(
                        user?.id
                          ? [{ value: user.id, name: user.name??"", email: user.email ?? "", role: "You", isYou: true }]
                          : [],
                      )
                    ).map((o) => (
                      <button
                        key={o.value}
                        type="button"
                        onClick={() => setSelectedOfficer(o.value)}
                        className={`flex w-full items-center justify-between gap-3 border-b px-4 py-3 text-left last:border-0 transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50 ${
                          selectedOfficer === o.value
                            ? "bg-primary/10 dark:bg-primary/20"
                            : ""
                        }`}
                      >
                        {/* Left: name + email */}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {o.name}
                            {o.isYou && (
                              <span className="ml-1 text-xs text-primary">(You)</span>
                            )}
                          </p>
                          <p className="text-xs text-red-500">{o.email}</p>
                        </div>

                        {/* Right: role */}
                        <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                          {o.role}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 flex justify-end">
                    <Button
                      title="Confirm Reassignment"
                      onClick={handleDone}
                      loading={assignIncidentToOfficer.isPending}
                      disabled={!selectedOfficer}
                    />
                  </div>
                </div>
              </ModalBody>
            )}

            {/* Capture / Upload (for staff when incident is completed but report not closed) */}
            {/* {user?.role === "STAFF" &&
              incidentMeta?.status === "COMPLETED" &&
              report.status !== "CLOSED" && (
                <Button
                  title="Capture or Upload"
                  onClick={() => {
                    // for now, just a placeholder
                    console.log("open upload");
                  }}
                />
              )} */}
          </div>
        </div>
      </div>
    </div>
  );
}
