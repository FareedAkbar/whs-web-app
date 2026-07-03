// src/app/incidents/[id]/page.tsx
"use client";

import { useState } from "react";
import { Download, DownloadIcon, UserPlus } from "lucide-react";
import { api } from "@/trpc/react";
import { toast } from "react-toastify";
import { useParams, useRouter } from "next/navigation";
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
import { statusMapping } from "@/utils/statusColors";
import LogsSection from "@/components/ui/LogsSection";
import HazardForm from "../../incident-form/page";


// Add this component above HazardDetailScreen
function LinkedInspectionsCard({ linkedInspections }: { linkedInspections: any[] }) {
  if (!linkedInspections?.length) return null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-gray-200">
        Linked Inspection(s)
      </h3>

      <div className="space-y-4">
        {linkedInspections.map((item) => (
          <div
            key={item.linkId}
            className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3"
          >
            {/* Title + status badge */}
            <div className="flex items-start justify-between gap-2">
              <p className="font-semibold text-gray-900 dark:text-white flex-1 capitalize">
                {item.survey.title}
              </p>
              <span
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                statusMapping[
                  item.inspectionStatus as keyof typeof statusMapping
                ] ?? "bg-gray-100 text-gray-700"
              }`}
              >
                {item.inspectionStatus.replaceAll("_", " ")}
              </span>
            </div>

            {/* Survey description */}
            {item.survey.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {item.survey.description}
              </p>
            )}

            {/* Meta info */}
            <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
              {item.areaBuilding && (
                <p>
                  <span className="font-medium">Area: </span>
                  {item.areaBuilding}
                  {item.areaDescription ? ` — ${item.areaDescription}` : ""}
                </p>
              )}
              {item.businessUnit && (
                <p>
                  <span className="font-medium">Business Unit: </span>
                  {item.businessUnit}
                </p>
              )}
              {item.inspectionExpiryDate && (
                <p>
                  <span className="font-medium">Due: </span>
                  {item.inspectionExpiryDate.split("T")[0]}
                </p>
              )}
              {item.inspectionComments && (
                <p>
                  <span className="font-medium">Comments: </span>
                  {item.inspectionComments}
                </p>
              )}
            </div>

            {/* Sections list */}
            {item.sections?.length > 0 && (
              <div>
                <p className="mb-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Sections
                </p>
                <ul className="space-y-0.5">
                  {[...item.sections]
                    .sort((a, b) => a.order - b.order)
                    .map((sec) => (
                      <li
                        key={sec.id}
                        className="text-xs text-gray-500 dark:text-gray-400 ml-2"
                      >
                        {sec.order}. {sec.title}
                        {sec.description ? ` — ${sec.description}` : ""}
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
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
  const assignIncidentToOfficer = api.incidents.assignIncident.useMutation();
  const updateReportStatus = api.reports.updateReportStatus.useMutation();
  const incidentAcceptance = api.incidents.incidentAcceptance.useMutation();
  const hazard = incidentData?.data;
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



  // const handleUpdateStatus = (newStatus: string) => {
  //   if (!hazard) return;
  //   updateIncidentStatus.mutate(
  //     {
  //       hazardId: hazardMeta?.id! ?? "",
  //       status: newStatus,
  //     },
  //     {
  //       onSuccess: () => {
  //         toast.success(`Hazard ${newStatus.toLowerCase()} successfully`);
  //         void refetch();
  //       },
  //       onError: (error) => {
  //         toast.error(error.message ?? "Something went wrong");
  //       },
  //     },
  //   );
  // };
  const closeHazard = () => {
    if (!hazard) return;
    updateReportStatus.mutate(
      {
        incidentReportId: hazard.report.id,
        status: "CLOSED",
        comments: `Hazard closed by ${user?.name} (${user?.email})`,
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
  const completeHazard = () => {
    if (!hazard) return;
    updateReportStatus.mutate(
      {
        incidentReportId: hazard.report.id,
        status: "COMPLETED",
        comments: `Hazard completed by ${user?.name} (${user?.email})`,
      },
      {
        onSuccess: () => {
          toast.success(`Hazard report has been completed`);
          void refetch();
        },
        onError: (error) => {
          toast.error(error.message ?? "Something went wrong");
        },
      },
    );
  };
 // Dedicated pick handler — uses session user id directly
const handlePickHazard = () => {
  if (!hazard || !user?.id) return;

  assignIncidentToOfficer.mutate(
    {
      assignedTo: user.id,
      hazardId: hazard.hazard?.id ?? "",
      reportId: hazard.report.id,
      comments:`Hazard is picked by ${user.name}(${user.email})`

    },
    {
      onSuccess: () => {
        toast.success("Hazard picked successfully");
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
  if (!hazard || !selectedOfficer) return;
const isSelectingSelf = selectedOfficer === user?.id;

const assignedToName = isSelectingSelf
  ? user?.name
  : officers?.data?.find((o: User) => o.id === selectedOfficer)?.name;

const assignedToEmail = isSelectingSelf
  ? user?.email
  : officers?.data?.find((o: User) => o.id === selectedOfficer)?.email;
  const isReassign = modalMode === "reassign-officer";
const comments = isSelectingSelf
    ? `Hazard is picked by ${user?.name} (${user?.email})`
    : isReassign
      ? `Hazard reassigned to ${assignedToName} (${assignedToEmail}) by ${user?.name} (${user?.email})`
      : `Hazard assigned to ${assignedToName} (${assignedToEmail}) by ${user?.name} (${user?.email})`;

  assignIncidentToOfficer.mutate(
    {
      assignedTo: selectedOfficer,
      hazardId: hazard.hazard?.id ?? "",
      reportId: hazard.report.id,
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
    <div className="page-container py-6">
      <button
        onClick={() => router.back()}
        className="mb-4 flex items-center text-sm text-primary"
      >
        ← Back to List
      </button>

      <div className="rounded-lg border bg-white p-4 shadow-md dark:border-gray-500 dark:bg-gray-900 dark:text-white dark:shadow-gray-700 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
           <div>
                
               <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-white whitespace-nowrap">
                Ticket#{hazard.hazard?.ticket_number}</span> 

              <h2
                className="text-xl font-semibold capitalize"
                style={{
                  color: severityMapping[report.priority] ?? "black",
                }}
              >     
                {report.title}
              </h2>
              </div>

            <span
              className={`rounded-full px-3 py-1 text-xs ${
                statusMapping[
                  report?.status as keyof typeof statusMapping
                ] ?? "bg-gray-100 text-gray-700"
              }`}
            >
                {report.status=="ASSIGNED"&& assignee?.assignType=="SELF_ASSIGNED"?"PICKED":report?.status.replaceAll("_", " ")}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
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
            {hasPermission(user?.role!, "assign:officer") &&
              hazard.hazard?.status === "ASSIGNED" &&
              hazard?.incidentAssignee && (
                <Button
                  title="Reassign Officer"
                  onClick={() => {
                    setModalMode("reassign-officer");
                    setOpen(true);
                    // open modal logic left to you — this demonstrates the button
                  }}
                />
              )}
            {hasPermission(user?.role!, "pick:hazard") &&
              !hazard?.incidentAssignee && (
                <Button
                  title="Pick Hazard"
                      onClick={handlePickHazard}  // ← clean, dedicated handler
                  loading={assignIncidentToOfficer.isPending}
                  disabled={assignIncidentToOfficer.isPending}
                />
              )}
            {/* Complete Hazard - allowed roles & when assigned / in progress */}
            {user &&
              hasPermission(user.role, "complete:hazard") &&
              hazard.report?.status === "ASSIGNED" &&
              hazard?.incidentAssignee.id === user.id && (
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
                    void completeHazard();
                  }}
                  loading={updateReportStatus.isPending}
                  disabled={updateReportStatus.isPending}
                  // disabled={isUpdatingStatus}
                />
              )}
            {/* Close Hazard - P_AND_C_MANAGER when hazard completed */}
            {hasPermission(user?.role!, "close:hazard") &&
              report?.status === "COMPLETED"  && (
                <Button
                  title={"Close Hazard"}
                  onClick={() => closeHazard()}
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
            

            {/* Detailed description from hazard object (if present) */}
            {hazardMeta?.hazardDescription && (
              <p>
                <span className="font-medium text-primary">
                  Hazard Detailed Description:{" "}
                </span>
                {hazardMeta.hazardDescription}
              </p>
            )}

            {/* Assigned to */}
            <div className="mt-4">
              {assignee ? (
                <div className="mt-3 space-y-1">
                  <p className="text-sm font-semibold text-red-500">
                    {hazard.incidentAssignee.assignType === "SELF_ASSIGNED"
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
          {hazard.media?.length > 0 ? (
            <div className="mt-6">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                Hazard Gallery
              </h3>

              <div className="mt-2 flex flex-wrap gap-2">
                {hazard.media.map(
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
              No images available for this hazard.
            </p>
          )}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Linked Incident</h3>
            </div>

            {hazard.links?.length ? (
              <div className="space-y-4">
                {hazard.links.map((link) => (
                  <div
                    key={link.linkId}
                    className="rounded-lg shadow dark:bg-gray-700 bg-gray-50 p-4"
                  >
                    {/* Top row: ticket + status */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-white whitespace-nowrap">
                        Ticket#{link.ticket_number}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs whitespace-nowrap ${
                          statusMapping[link.reportStatus as keyof typeof statusMapping] ?? "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {link.reportStatus.replaceAll("_", " ")}
                      </span>
                    </div>

                    {/* Content */}
                    <p className="font-medium">Title: {link.reportTitle}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Type: {link.linkType}
                    </p>
                    {link.reportDescription && (
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Description: {link.reportDescription}
                      </p>
                    )}
                    {link.linkDescription && (
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Detailed Description: {link.linkDescription}
                      </p>
                    )}

                    {/* View button */}
                    {hasPermission(user?.role!, "view:hazards") && (
                      <div className="mt-3 flex justify-end">
                        <Button
                          variant="primary"
                          onClick={() => router.push(`/dashboard/hazards/${link.reportId}`)}
                          title="View Hazard"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No linked hazard found.</p>
            )}
          </div>
          <LinkedInspectionsCard linkedInspections={hazard.linkedInspections ?? []} />

          <CommentsSection
            comments={hazard?.comments}
            reportId={hazard?.report.id}
            onCommentAdded={() => void refetch()}
          />
          <LogsSection logs={hazard?.reportLogs ?? []} />

          {/* Role-based action buttons */}
          <div className="mt-4 flex items-center gap-4">
            {/* Pick Hazard (for P_AND_C_OFFICER or any user who can self pick) */}

            {modalMode == "assign-officer" && (
              <ModalBody className="max-w-2xl p-4">
                <div className="mt-4">
                  <div className="max-h-64 overflow-y-auto rounded-md border border-gray-200 dark:border-gray-600">
                    {(officers?.data ?? []).map((o: User) => (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => setSelectedOfficer(o.id)}
                        className={`flex w-full items-center justify-between gap-3 border-b px-4 py-3 text-left last:border-0 transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50 ${
                          selectedOfficer === o.id ? "bg-primary/40" : ""
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
                      loading={assignIncidentToOfficer.isPending}
                      disabled={!selectedOfficer}
                    />
                  </div>
                </div>
              </ModalBody>
            )}
          {modalMode == "reassign-officer" && (
  <ModalBody className="max-w-2xl p-4">
    <div className="mt-4">
       <div className="max-h-64 overflow-y-auto rounded-md border border-gray-200 dark:border-gray-600">
                    {(
                      (officers?.data
                        ?.filter(
                          (o: User) =>
                            o.id !== hazard?.incidentAssignee?.id &&
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
                            ? "bg-primary/40"
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
            {/* Capture / Upload (for staff when hazard is completed but report not closed) */}
            {/* {user?.role === "STAFF" &&
              hazardMeta?.status === "COMPLETED" &&
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
