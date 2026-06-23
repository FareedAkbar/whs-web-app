"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/Select";
import YesNoQuestion from "@/components/ui/YesNoQuestion";
import {
  ModalBody,
  ModalContent,
  useModal,
} from "@/components/ui/animated-modal";
import Button from "@/components/ui/Button";
import { PlusIcon, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { hasPermission } from "@/lib/auth";
import { useSession } from "next-auth/react";
import { Eye, Trash2 } from "lucide-react";
import { api } from "@/trpc/react";
import { toast } from "react-toastify";
import { UserRole } from "@/types/roles";
import type { NewHazardReport } from "@/types/report";
import HazardLinker, { HazardLinkValue } from "@/components/ui/HazardLinker";
import { AREA_DATA } from "@/constants/area";
import TableFiller, { FilledTable, TableRow } from "@/components/table/TableFiller";

// ── Local-only types ──────────────────────────────────────────────────────────

type FormValue = string | string[];

// Add this type near the top
interface SectionTableRows {
  [tableId: string]: TableRow[];
}

interface SectionFormState {
  answers: Record<string, FormValue>;
  linkHazard: boolean;
  hazardLinks: HazardLinkValue[];
  tableRows: SectionTableRows;   // ← new
}

interface InspectionMetaFields {
  areaBuilding: string;
  areaDescriptions: string[];
  businessUnit: string;
  inspectionBuddy: string;
  nextInspectionDue: string;
  comments?:string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const defaultSectionState = (): SectionFormState => ({
  answers: {},
  linkHazard: false,
  hazardLinks: [{ mode: "existing" }],
  tableRows: {},
});

const defaultMetaFields = (): InspectionMetaFields => ({
  areaBuilding: "",
  areaDescriptions: [],
  businessUnit: "",
  inspectionBuddy: "",
  nextInspectionDue: "",
  comments:""
});

function itemHasAnswers(item: InspectionItem): boolean {
  return (
    Array.isArray(item.sections) &&
    item.sections.length > 0 &&
    item.sections.some((sec) => sec.questions.some((q) => q.answer != null))
  );
}

// ── Main component ────────────────────────────────────────────────────────────

const InspectionChecklist = () => {
  const [sectionForms, setSectionForms] = useState<Record<string, SectionFormState>>({});
  const [metaFields, setMetaFields] = useState<InspectionMetaFields>(defaultMetaFields());
  const [modal, setModal] = useState<{
    type: "view" | "delete" | "assign" | null;
    data?: InspectionDetail | null | Inspection;
  }>({ type: null, data: null });

  const router = useRouter();
  const { setOpen } = useModal();

  const { data: inspections, isLoading, refetch } =
    api.inspections.getInspections.useQuery();

  const { data: inspectionDetail } =
    api.inspections.getInspectionById.useQuery(
      { id: modal.data?.id ?? "" },
      {
        enabled:
          (modal.type === "view" || modal.type === "assign") &&
          Boolean(modal.data?.id),
        staleTime: 0,
      },
    );

  const submitInspection = api.inspections.submitInspection.useMutation();
  const deleteInspection = api.inspections.deleteInspection.useMutation({
    onSuccess: () => {
      toast.success("Inspection deleted successfully");
      setOpen(false);
      setModal({ type: null, data: null });
      void refetch();
    },
  });
  const assignMutation = api.inspections.assignInspection.useMutation({
    onSuccess: () => {
      setSelectedUser(null);
      setDueDate("");
      toast.success("Inspection assigned successfully");
      setOpen(false);
      setModal({ type: null, data: null });
      void refetch();
    },
  });

  const session = useSession();
  const user = session.data?.user;

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState("");
  const [assignedTab, setAssignedTab] = useState("All");
  const [filteredInspections, setFilteredInspections] = useState<Inspection[]>([]);

  useEffect(() => {
    if (!inspections?.data) return;
    let data = inspections.data;
    if (assignedTab === "Created by me") {
      data = data.filter((i) => i.createdBy === user?.id);
    } else if (assignedTab === "Assigned to me") {
      data = data.filter((i) => i.createdBy !== user?.id);
    }
    setFilteredInspections(data);
  }, [assignedTab, inspections?.data, user?.id]);

  useEffect(() => {
    if (!inspectionDetail?.data?.sections) return;
    const init: Record<string, SectionFormState> = {};
    for (const sec of inspectionDetail.data.sections) {
      if (!sectionForms[sec.id]) {
        init[sec.id] = defaultSectionState();
      }
    }
    if (Object.keys(init).length > 0) {
      setSectionForms((prev) => ({ ...init, ...prev }));
    }
  }, [inspectionDetail?.data?.sections]);

  const { data: verifiedUsers, isLoading: loadingUsers } =
    api.users.getVerifiedUsers.useQuery();

  const filterByRole = (users: User[], currentUserRole: UserRole) => {
    if (!users) return [];
    switch (currentUserRole) {
      case "ADMIN":
        return users;
      case "P_AND_C_MANAGER":
        return users.filter(
          (u) => u.role === "P_AND_C_OFFICER" || u.role === "STAFF",
        );
      case "FACILITY_MANAGER":
        return users.filter(
          (u) => u.role === "FACILITY_OFFICER" || u.role === "STAFF",
        );
      default:
        return [];
    }
  };

  const filteredUsers = useMemo(
    () =>
      filterByRole(verifiedUsers?.data ?? [], user?.role!).filter(
        (u) =>
          u.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !inspectionDetail?.data?.inspections.some(
            (i) => i.assignedTo?.id === u.id,
          ),
      ),
    [searchTerm, verifiedUsers, inspectionDetail],
  );

  // ── Area helpers ──────────────────────────────────────────────────────────

  const selectedAreaData = AREA_DATA.find(
    (a) => a.areaBuilding === metaFields.areaBuilding,
  );

  const handleAreaBuildingChange = (areaBuilding: string) => {
    setMetaFields((prev) => ({ ...prev, areaBuilding, areaDescriptions: [] }));
  };

  const toggleAreaDescription = (desc: string) => {
    setMetaFields((prev) => {
      const already = prev.areaDescriptions.includes(desc);
      return {
        ...prev,
        areaDescriptions: already
          ? prev.areaDescriptions.filter((d) => d !== desc)
          : [...prev.areaDescriptions, desc],
      };
    });
  };

  // ── Section form helpers ──────────────────────────────────────────────────

  const getSectionState = (sectionId: string): SectionFormState =>
    sectionForms[sectionId] ?? defaultSectionState();

  const updateSectionAnswer = (sectionId: string, questionId: string, value: FormValue) => {
    setSectionForms((prev) => ({
      ...prev,
      [sectionId]: {
        ...getSectionState(sectionId),
        answers: { ...(prev[sectionId]?.answers ?? {}), [questionId]: value },
      },
    }));
  };

const DEFAULT_TABLE_ROWS = 3;
useEffect(() => {
  if (!inspectionDetail?.data?.sections) return;
  const init: Record<string, SectionFormState> = {};
  for (const sec of inspectionDetail.data.sections) {
    if (!sectionForms[sec.id]) {
      init[sec.id] = defaultSectionState();
    }
  }
  if (Object.keys(init).length > 0) {
    setSectionForms((prev) => ({ ...init, ...prev }));
  }
  // Init table rows for all sections that have tables
  for (const sec of inspectionDetail.data.sections) {
    if (sec.tables && sec.tables.length > 0) {
      // In the useEffect:
initTableRowsForSection(
  sec.id,
  sec.tables.map((t: any) => ({
    id: t.id,
    columns: t.columns.map((c: any) => c.name),  // ← extract .name here too
  })),
);
    }
  }
}, [inspectionDetail?.data?.sections]);
const initTableRowsForSection = (
  sectionId: string,
  tables: Array<{ id: string; columns: string[] }>,
) => {
  setSectionForms((prev) => {
    const state = prev[sectionId] ?? defaultSectionState();
    const tableRows = { ...state.tableRows };
    for (const tbl of tables) {
      if (!tableRows[tbl.id]) {
        tableRows[tbl.id] = Array.from({ length: DEFAULT_TABLE_ROWS }, () =>
          Object.fromEntries(tbl.columns.map((c) => [c, ""])),
        );
      }
    }
    return { ...prev, [sectionId]: { ...state, tableRows } };
  });
};

const updateTableRows = (sectionId: string, tableId: string, rows: TableRow[]) => {
  setSectionForms((prev) => {
    const state = getSectionState(sectionId);
    return {
      ...prev,
      [sectionId]: {
        ...state,
        tableRows: { ...state.tableRows, [tableId]: rows },
      },
    };
  });
};

const addHazardLink = (sectionId: string) => {
  setSectionForms((prev) => {
    const state = getSectionState(sectionId);
    return {
      ...prev,
      [sectionId]: {
        ...state,
        hazardLinks: [...state.hazardLinks, { mode: "existing" as const }],
      },
    };
  });
};
const removeHazardLink = (sectionId: string, index: number) => {
  setSectionForms((prev) => {
    const state = getSectionState(sectionId);
    return {
      ...prev,
      [sectionId]: {
        ...state,
        hazardLinks: state.hazardLinks.filter((_, i) => i !== index),
      },
    };
  });
};

const updateHazardLink = (sectionId: string, index: number, val: HazardLinkValue) => {
  setSectionForms((prev) => {
    const state = getSectionState(sectionId);
    const updated = [...state.hazardLinks];
    updated[index] = val;
    return { ...prev, [sectionId]: { ...state, hazardLinks: updated } };
  });
};

  // ── Validation ────────────────────────────────────────────────────────────
// 4. Validation — isSectionValid
const isSectionValid = (sectionId: string, questions: Question[]): boolean => {
  const state = getSectionState(sectionId);
  const answersOk = questions.every((q) => {
    if (q.type === "MULTI_OPTION") {
      const v = state.answers[q.id];
      return Array.isArray(v) && v.length > 0;
    }
    if (q.type === "DATE_RANGE") {
      return Boolean(state.answers[`${q.id}_start`] && state.answers[`${q.id}_end`]);
    }
    return state.answers[q.id] !== undefined && state.answers[q.id] !== "";
  });
  if (!answersOk) return false;

  // Every hazard link in the list must be fully filled
  return state.hazardLinks.every((link) => {
    if (link.mode === "existing") return Boolean(link.hazardId);
    if (link.mode === "new") {
      const nh = link.newHazard;
      return Boolean(nh?.reportTitle && nh?.hazardDescription && nh?.severity && nh?.address);
    }
    return true;
  });
};

  const isMetaValid = (): boolean =>
    Boolean(metaFields.areaBuilding) &&
    metaFields.areaDescriptions.length > 0 ;

  const isFullFormValid = (): boolean => {
    if (!isMetaValid()) return false;
    const sections = inspectionDetail?.data?.sections ?? [];
    return sections.every((sec) => isSectionValid(sec.id, sec.questions));
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const buildPayload = () => {
    const detail = inspectionDetail?.data;
    if (!detail) return null;

    const inspectionItem = detail.inspections.find(
      (i) => i.status === "INITIATED" && i.assignedTo.id === user?.id,
    );
    if (!inspectionItem) return null;

  // 5. Payload builder — sections map
// Inside buildPayload, update the sections map:
const sections = (detail.sections ?? []).map((sec) => {
  const state = getSectionState(sec.id);

  const answers = sec.questions.map((q) => {
    if (q.type === "DATE_RANGE") {
      return {
        questionId: q.id,
        answer: [
          (state.answers[`${q.id}_start`] as string) || "",
          (state.answers[`${q.id}_end`] as string) || "",
        ],
      };
    }
    return {
      questionId: q.id,
      answer: state.answers[q.id]! as string | string[],
    };
  });

// ── NEW ──
const hazardIds: string[] = state.hazardLinks
  .filter((link) => link.mode === "existing" && link.hazardId)
  .map((link) => link.hazardId!);

const newHazards = state.hazardLinks
  .filter((link) => link.mode === "new" && link.newHazard)
  .map((link) => ({
    ...link.newHazard!,
    status: "INITIATED",
    mainType: "HAZARD",
    managerSignatureConfirmationDate: null,
    categoryType: link.newHazard!.categoryType ?? "",
    reportDescription: link.newHazard!.reportDescription ?? "",
  }));



  // ── Tables ──────────────────────────────────────────────────────
  const tables: FilledTable[] = (sec.tables ?? []).map((tbl: any) => ({
    tableId: tbl.id,
    rows: (state.tableRows[tbl.id] ?? []).filter((row) =>
      // only send rows that have at least one non-empty cell
      Object.values(row).some((v) => v.trim() !== ""),
    ),
  }));


return {
  sectionId: sec.id,
  answers,
  hazardId:hazardIds,        // string[]
  hazard: newHazards,  // NewHazardReport[]
  tables,
};
});

    return {
      inspectionId: inspectionItem.id,
      areaBuilding: metaFields.areaBuilding,
      areaDescription: metaFields.areaDescriptions.join(", "),
      businessUnit: metaFields.businessUnit,
      inspectionBuddy: metaFields.inspectionBuddy,
      nextInspectionDue: metaFields.nextInspectionDue,
      comments: metaFields.comments,
      sections,
    };
  };

  const handleSubmit = () => {
    if (!isMetaValid()) {
      toast.error(
        "Please fill out Area/Building, Area Descriptions, Business Unit, Inspection Buddy and Next Inspection Due.",
      );
      return;
    }
    if (!isFullFormValid()) {
      toast.error("Please fill out all questions before submitting.");
      return;
    }

    const payload = buildPayload();
    if (!payload) return;

    submitInspection.mutate(payload as any, {
      onSuccess: (res: any) => {
        if (res.status) {
          toast.success("Inspection submitted successfully!");
        } else {
          toast.error(res.error ?? "Failed to submit inspection");
        }
        setModal({ type: null, data: null });
        setSectionForms({});
        setMetaFields(defaultMetaFields());
        setOpen(false);
      },
      onError: () => {
        toast.error("Something went wrong!");
      },
    });
  };

  const canFill =
    hasPermission(user?.role!, "fill:inspections") &&
    inspectionDetail?.data?.inspections?.some(
      (i) => i.assignedTo.id === user?.id && i.status === "INITIATED",
    ) &&
    !inspectionDetail?.data?.inspections.some(
      (i) => i.assignedTo.id === user?.id && itemHasAnswers(i),
    );

  if (isLoading) {
    return (
      <div className="relative flex h-2/3 w-full items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-6">
      {user && hasPermission(user.role, "create:inspections") && (
        <>
          <div className="flex w-full items-center justify-end">
            <Button
              onClick={() => router.push("/dashboard/create-inspection")}
              title="Create Inspection Checklist"
              icon={<PlusIcon />}
            />
          </div>
          <div className="mb-3 flex gap-3 px-1">
            {["All", "Created by me", "Assigned to me"].map((tab) => (
              <button
                key={tab}
                onClick={() => setAssignedTab(tab)}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  assignedTab === tab
                    ? "border-primary bg-primary text-white"
                    : "border-gray-300 bg-gray-100 text-gray-800 dark:border-gray-500 dark:bg-gray-700 dark:text-gray-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </>
      )}

      <div className="w-full space-y-6 p-6">
        {filteredInspections?.map((inspection: Inspection) => (
          <div
            key={inspection.id}
            className="relative w-full rounded-lg bg-gray-50 p-6 text-left shadow-md dark:bg-gray-800 dark:text-white dark:shadow-gray-700"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold capitalize">{inspection.title}</h2>
                <p className="text-gray-600 dark:text-gray-400">{inspection.description}</p>
              </div>
              <div className="flex flex-col items-end justify-center gap-2">
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setSectionForms({});
                      setMetaFields(defaultMetaFields());
                      setModal({ type: "view", data: inspection });
                      setOpen(true);
                    }}
                    className="text-primary hover:scale-105"
                  >
                    <Eye size={20} />
                  </button>
                  {user?.id === inspection.createdBy && (
                    <button
                      onClick={() => {
                        setModal({ type: "delete", data: inspection });
                        setOpen(true);
                      }}
                      className="text-primary hover:scale-105"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
                {user &&
                  hasPermission(user.role, "assign:inspections") &&
                  inspection.createdBy === user.id && (
                    <Button
                      title="Assign Inspection"
                      icon={<UserPlus size={16} />}
                      onClick={() => {
                        setSearchTerm("");
                        setModal({ type: "assign", data: inspection });
                        setOpen(true);
                      }}
                    />
                  )}
              </div>
            </div>
          </div>
        ))}
        {inspections?.data?.length === 0 && (
          <p className="text-center text-gray-500">No inspections found.</p>
        )}
      </div>

      {/* ── View Modal ── */}
      {modal.type === "view" && modal.data && inspectionDetail && (
        <ModalBody className="w-full overflow-y-auto">
          <ModalContent className="w-full">
            <h2 className="mb-4 text-2xl font-bold capitalize dark:text-white">
              {modal.data.title}
            </h2>
            <p className="mb-4 text-gray-600 dark:text-gray-400">
              {modal.data.description}
            </p>

            {/* 1. View-only: template questions */}
            {inspectionDetail.data?.sections &&
              inspectionDetail.data.sections.length > 0 &&
              !canFill &&
              !hasPermission(user?.role!, "view:filled-inspections") && (
                <div className="mb-3 space-y-4">
                  {inspectionDetail.data.sections
                    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                    .map((sec) => (
                      <div
                        key={sec.id}
                        className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900"
                      >
                        <h3 className="mb-1 text-lg font-semibold dark:text-white">
                          {sec.title}
                        </h3>
                        {sec.description && (
                          <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
                            {sec.description}
                          </p>
                        )}
                        {sec.questions
                          .sort((a, b) => (a.questionNumber ?? 0) - (b.questionNumber ?? 0))
                          .map((q) => (
                            <div
                              key={q.id}
                              className="mb-3 border-b border-gray-200 pb-3 dark:border-gray-700"
                            >
                              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                {q.questionNumber}. {q.title}
                              </p>
                              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Type: {q.type.replaceAll("_", " ")}
                              </p>
                              {(q.type === "SINGLE_OPTION" || q.type === "MULTI_OPTION") && (
                                <div className="ml-3 mt-1">
                                  {q.options?.map((opt, i) => (
                                    <p key={i} className="text-xs text-gray-500 dark:text-gray-400">
                                      • {opt}
                                    </p>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    ))}
                </div>
              )}

            {/* 2. Admin / manager: view filled answers */}
            {user &&
              hasPermission(user?.role!, "view:filled-inspections") &&
              inspectionDetail.data?.inspections && (
                <ViewFilledInspections
                  inspectionItems={inspectionDetail.data.inspections}
                  templateSections={inspectionDetail.data.sections ?? []}
                  isUserAdmin={inspectionDetail.data.createdBy === user.id}
                />
              )}

            {/* 3. Fill form */}
            {canFill && inspectionDetail.data?.sections && (
              <div className="mt-4 space-y-6">
                {/* ── Meta fields ── */}
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                  <h3 className="mb-4 text-lg font-semibold dark:text-white">
                    Inspection Details
                  </h3>
                  <div className="space-y-4">
                    <Select
                      label="Area - Building"
                      options={[
                        ...AREA_DATA.map((a) => ({
                          label: a.areaBuilding,
                          value: a.areaBuilding,
                        })),
                      ]}
                      value={metaFields.areaBuilding}
                      onChange={(e) => handleAreaBuildingChange(e.target.value)}
                    />

                    {selectedAreaData && (
                      <div>
                        <Label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Area Description{" "}
                          <span className="text-xs font-normal text-gray-400">
                            (select all that apply)
                          </span>
                        </Label>
                        <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
                          {selectedAreaData.descriptions.map((desc) => (
                            <label key={desc} className="flex cursor-pointer items-center gap-3">
                              <input
                                type="checkbox"
                                checked={metaFields.areaDescriptions.includes(desc)}
                                onChange={() => toggleAreaDescription(desc)}
                                className="h-4 w-4 cursor-pointer accent-primary"
                              />
                              <span className="text-sm text-gray-700 dark:text-gray-200">
                                {desc}
                              </span>
                            </label>
                          ))}
                        </div>
                        {metaFields.areaDescriptions.length > 0 && (
                          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                            Selected: {metaFields.areaDescriptions.join(", ")}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex flex-col gap-4 sm:flex-row">
                      <Input
                        label="Business Unit"
                        value={metaFields.businessUnit}
                        onChange={(e) =>
                          setMetaFields((prev) => ({ ...prev, businessUnit: e.target.value }))
                        }
                        placeholder="Enter business unit"
                      />
                      <Input
                        label="Inspection Buddy"
                        value={metaFields.inspectionBuddy}
                        onChange={(e) =>
                          setMetaFields((prev) => ({ ...prev, inspectionBuddy: e.target.value }))
                        }
                        placeholder="Enter inspection buddy name"
                      />
                      <Input
                        label="Next Inspection Due"
                        value={metaFields.nextInspectionDue}
                        onChange={(e) =>
                          setMetaFields((prev) => ({
                            ...prev,
                            nextInspectionDue: e.target.value,
                          }))
                        }
                        placeholder="e.g. July 2025 or 3 months"
                      />
                    </div>
                  </div>
                </div>

                {/* ── Section forms ── */}
                {inspectionDetail.data.sections
                  .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                  .map((sec) => {
                    const state = getSectionState(sec.id);
                    return (
                      <div
                        key={sec.id}
                        className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900"
                      >
                        <h3 className="mb-1 text-lg font-semibold dark:text-white">
                          {sec.title}
                        </h3>
                        {sec.description && (
                          <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
                            {sec.description}
                          </p>
                        )}

                        <div className="space-y-4">
                          {sec.questions
                            .sort((a, b) => (a.questionNumber ?? 0) - (b.questionNumber ?? 0))
                            .map((q) =>
                              renderQuestion(q, state.answers, (qId, val) =>
                                updateSectionAnswer(sec.id, qId, val),
                              ),
                            )}
                        </div>
                        {sec.notes && (
                          <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                            <Label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">   
                              Section Notes   
                              </Label>
                              <p className="text-sm text-gray-500 dark:text-gray-400 whitespace-pre-wrap">
                                {sec.notes}
                              </p>
                            </div>
                          )}
                          {/* ── Tables ── */}
                        {sec.tables && sec.tables.length > 0 && (
                          <div className="mt-5 space-y-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                              Tables
                            </p>
                            {sec.tables.map((tbl: any) => (
                              <TableFiller
                                key={tbl.id}
                                tableId={tbl.id}
                                tableName={tbl.name}
                            columns={tbl.columns.map((c: any) => c.name)}  // ← extract .name
                                rows={
                                  state.tableRows[tbl.id] ??
                                  Array.from({ length: 3 }, () =>
                                    Object.fromEntries((tbl.columns ?? []).map((c: string) => [c, ""])),
                                  )
                                }
                                onChange={(rows) => updateTableRows(sec.id, tbl.id, rows)}
                              />
                            ))}
                          </div>
                        )}
                        {/* Hazard linking */}
                      <div className="mt-5 space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                          Linked Hazards
                        </p>

                        {state.hazardLinks.map((link, idx) => (
                          <div
                            key={idx}
                            className="relative rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"
                          >
                            <div className="mb-3 flex items-center justify-between">
                              <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                                Hazard {idx + 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeHazardLink(sec.id, idx)}
                                className="text-xs text-red-500 hover:text-red-700 dark:text-red-400"
                              >
                                Remove
                              </button>
                            </div>
                            <HazardLinker
                              value={link}
                              onChange={(val) => updateHazardLink(sec.id, idx, val)}
                            />
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() => addHazardLink(sec.id)}
                          className="flex items-center gap-2 rounded-md border border-dashed border-primary/60 px-4 py-2 text-sm text-primary transition hover:border-primary hover:bg-primary/5"
                        >
                          <PlusIcon size={15} />
                          {state.hazardLinks.length === 0 ? "Link a hazard" : "Add another hazard"}
                        </button>
                      </div>

                      </div>
                    );
                  })}

                <div>
                  <div className="mt-8 rounded-xl border border-primary-200 bg-primary/10 p-5 shadow-sm">
                    <h3 className="mb-4 text-lg font-semibold text-primary">Important Actions</h3>
                    <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                      <li className="flex gap-3">
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                        <span>
                          Complete any actions that can be resolved immediately and record them
                          under the relevant section above.
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                        <span>
                          Escalate unresolved items to the Business Unit Manager or Pulse Support.
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                        <span>
                          Ensure all outstanding actions are tracked and added to the Action Log.
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                        <span>Follow up on action items until they are completed.</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                        <span>Submit the completed checklist to the WHS Committee Chair.</span>
                      </li>
                    </ul>
                    <div className="mt-4 rounded-lg bg-white/70 p-3 text-sm dark:bg-gray-800/50">
                      <span className="font-medium dark:text-white">Once this form is completed, please return this checklist to Silvana Naumovski, WHS Committee Chair via </span>
                      <a href="mailto:silvana@uow.edu.au" className="text-primary hover:underline">
                        silvana@uow.edu.au
                      </a>
                    </div>
                  </div>
                </div>

                        {/* Additional comments — optional */}
                        <div className="mt-4">
                          <Label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Additional Comments{" "}
                            <span className="text-xs font-normal text-gray-400">(optional)</span>
                          </Label>
                          <textarea
                            rows={3}
                            value={metaFields.comments}
                            onChange={(e) => setMetaFields((prev) => ({ ...prev, comments: e.target.value }))}
                            placeholder="Any additional comments"
                            className="w-full rounded-md border border-gray-200 bg-gray-50 p-3 text-sm placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-[2px] focus-visible:ring-neutral-400 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                          />
                        </div>
                {hasPermission(user?.role!, "submit:inspection") && (
                  <div className="mt-6 flex justify-end">
                    <Button
                      title="Submit"
                      onClick={handleSubmit}
                      disabled={!isFullFormValid()}
                      loading={submitInspection.isPending}
                    />
                  </div>
                )}
              </div>
            )}
          </ModalContent>
        </ModalBody>
      )}

      {/* ── Delete Modal ── */}
      {modal.type === "delete" && modal.data && (
        <ModalBody className="mx-3 w-full">
          <ModalContent className="w-full">
            <h2 className="mb-4 text-xl font-bold dark:text-white">Delete Inspection</h2>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              Are you sure you want to delete{" "}
              <span className="font-semibold">{modal.data.title}</span>? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                title="Delete"
                loading={deleteInspection.isPending}
                onClick={() => deleteInspection.mutate({ id: modal.data?.id! })}
                disabled={deleteInspection.isPending}
              />
              <Button
                title="Cancel"
                onClick={() => {
                  setOpen(false);
                  setModal({ type: null, data: null });
                }}
                variant="secondary"
              />
            </div>
          </ModalContent>
        </ModalBody>
      )}

      {/* ── Assign Modal ── */}
      {modal.type === "assign" && modal.data && (
        <ModalBody className="mx-3 w-full">
          <ModalContent className="w-full">
            <h2 className="mb-4 text-xl font-bold capitalize dark:text-white">
              {modal.data.title}
            </h2>

            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div className="mb-4 max-h-60 overflow-y-auto rounded-md border p-2 shadow-md dark:border-gray-500">
              {loadingUsers ? (
                <p>Loading users...</p>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <div
                    key={u.id}
                    onClick={() => setSelectedUser(u.id)}
                    className={`cursor-pointer p-2 ${
                      selectedUser === u.id
                        ? "bg-primary text-white"
                        : "border-b hover:bg-gray-200 dark:border-gray-500 dark:text-white dark:hover:bg-gray-700"
                    }`}
                  >
                    {u.name} ({u.email})
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No users found</p>
              )}
            </div>

            <Label className="mb-1 block">Due Date</Label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="mb-6"
              min={new Date().toISOString().split("T")[0]}
            />

            <div className="flex justify-end gap-3">
              <Button
                title="Cancel"
                variant="secondary"
                onClick={() => {
                  setOpen(false);
                  setModal({ type: null, data: null });
                }}
              />
              <Button
                title="Assign"
                disabled={!selectedUser || !dueDate || assignMutation.isPending}
                onClick={() =>
                  assignMutation.mutate({
                    surveyId: modal.data?.id!,
                    assignedTo: selectedUser!,
                    dueDate,
                  })
                }
                loading={assignMutation.isPending}
              />
            </div>
          </ModalContent>
        </ModalBody>
      )}
    </div>
  );
};

// ── ViewFilledInspections ─────────────────────────────────────────────────────

interface ViewFilledInspectionsProps {
  inspectionItems: InspectionItem[];
  templateSections: InspectionSection[];
  isUserAdmin: boolean;
}

function ViewFilledInspections({
  inspectionItems,
  templateSections,
  isUserAdmin,
}: ViewFilledInspectionsProps) {
  const completed = inspectionItems.filter((item) => itemHasAnswers(item));

  if (completed.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">No submissions yet.</p>
    );
  }

  return (
    <div className="space-y-8">
      {completed.map((item) => (
        <div
          key={item.id}
          className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900"
        >
          {/* Assignee header */}
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                Submitted by:{" "}
                <span className="font-normal">{item.assignedTo.name}</span>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{item.assignedTo.email}</p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                item.status === "COMPLETED"
                  ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                  : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
              }`}
            >
              {item.status}
            </span>
          </div>

          {/* Meta fields display */}
          {(item.areaBuilding ||
            item.areaDescription ||
            item.businessUnit ||
            item.inspectionBuddy ||
            item.nextInspectionDue ||
            item.comments) && (
            <div className="mb-5 rounded-lg border border-blue-100 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                Inspection Details
              </p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                {item.areaBuilding && (
                  <div>
                    <span className="font-medium text-gray-600 dark:text-gray-400">
                      Area - Building:{" "}
                    </span>
                    <span className="text-gray-800 dark:text-gray-200">{item.areaBuilding}</span>
                  </div>
                )}
                {item.areaDescription && (
                  <div>
                    <span className="font-medium text-gray-600 dark:text-gray-400">
                      Area Description:{" "}
                    </span>
                    <span className="text-gray-800 dark:text-gray-200">{item.areaDescription}</span>
                  </div>
                )}
                {item.businessUnit && (
                  <div>
                    <span className="font-medium text-gray-600 dark:text-gray-400">
                      Business Unit:{" "}
                    </span>
                    <span className="text-gray-800 dark:text-gray-200">{item.businessUnit}</span>
                  </div>
                )}
                 
                {item.businessUnit && (
                  <div>
                    <span className="font-medium text-gray-600 dark:text-gray-400">
                      Business Unit:{" "}
                    </span>
                    <span className="text-gray-800 dark:text-gray-200">{item.businessUnit}</span>
                  </div>
                )}
                {item.inspectionBuddy && (
                  <div>
                    <span className="font-medium text-gray-600 dark:text-gray-400">
                      Inspection Buddy:{" "}
                    </span>
                    <span className="text-gray-800 dark:text-gray-200">
                      {item.inspectionBuddy}
                    </span>
                  </div>
                )}
                {item.nextInspectionDue && (
                  <div>
                    <span className="font-medium text-gray-600 dark:text-gray-400">
                      Next Inspection Due:{" "}
                    </span>
                    <span className="text-gray-800 dark:text-gray-200">
                      {item.nextInspectionDue}
                    </span>
                  </div>
                )}
                
              </div>
            </div>
          )}

          {/* Sections with answers */}
          <div className="space-y-5">
            {(item.sections ?? [])
              .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
              .map((sec) => (
                <div
                  key={sec.id}
                  className="rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800"
                >
                  <h4 className="mb-3 text-base font-semibold text-gray-800 dark:text-white">
                    {sec.title}
                  </h4>
                  {sec.description && (
                    <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                      {sec.description}
                    </p>
                  )}

                  <div className="space-y-3">
                    {sec.questions
                      .sort((a, b) => (a.questionNumber ?? 0) - (b.questionNumber ?? 0))
                      .map((q) => (
                        <div
                          key={q.id}
                          className="border-b border-gray-200 pb-3 last:border-0 last:pb-0 dark:border-gray-700"
                        >
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {q.questionNumber}. {q.title}
                          </p>
                          <AnswerDisplay answer={q.answer?.answer ?? null} type={q.type} />
                        </div>
                      ))}
                  </div>

                 

                  {/* Linked hazards */}
                  {sec.linkedHazards && sec.linkedHazards.length > 0 && (
                    <div className="mt-4">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Linked Hazards
                      </p>
                      <div className="space-y-2">
                        {sec.linkedHazards.map((lh) => (
                          <div
                            key={lh.linkId}
                            className="flex items-center justify-between rounded-md border border-orange-200 bg-orange-50 px-3 py-2 text-sm dark:border-orange-800 dark:bg-orange-950"
                          >
                            <div>
                              <p className="font-medium text-orange-800 dark:text-orange-300">
                                #{lh.ticket_number} — {lh.reportTitle}
                              </p>
                              {lh.linkDescription && (
                                <p className="text-xs text-orange-600 dark:text-orange-400">
                                  {lh.linkDescription}
                                </p>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span
                                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                  lh.reportPriority === "MAJOR"
                                    ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                                    : lh.reportPriority === "MINOR"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {lh.reportPriority}
                              </span>
                              <span className="text-xs text-orange-500 dark:text-orange-400">
                                {lh.reportStatus}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </div>
          
          {/* Activity log */}
          {item.logs && item.logs.length > 0 && (
            <div className="mt-5">
              <p className="mb-2 text-xs font-semibold  tracking-wide text-gray-500 dark:text-gray-400">
                COMMENTS: {" "}
               <p className="font-normal">{item.comments}
                </p> 
              </p>
              
            </div>
          )}
          {item.logs && item.logs.length > 0 && (
            <div className="mt-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Activity Log
              </p>
              <div className="space-y-2">
                {item.logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400"
                  >
                    <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                    <span>
                      <span className="font-medium">{log.status}</span> — {log.comment}{" "}
                      <span className="text-gray-400">
                        ({new Date(log.createdAt).toLocaleString()})
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── AnswerDisplay ─────────────────────────────────────────────────────────────

function AnswerDisplay({
  answer,
  type,
}: {
  answer: string | string[] | null | undefined;
  type: AnsType;
}) {
  if (answer == null || answer === "") {
    return (
      <p className="mt-1 text-xs italic text-gray-400 dark:text-gray-500">No answer provided</p>
    );
  }

  if (type === "DATE_RANGE" && Array.isArray(answer) && answer.length === 2) {
    return (
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
        {answer[0]} → {answer[1]}
      </p>
    );
  }

  if (Array.isArray(answer)) {
    return (
      <ul className="mt-1 list-inside list-disc space-y-0.5">
        {answer.map((v, i) => (
          <li key={i} className="text-sm text-gray-600 dark:text-gray-300">
            {v}
          </li>
        ))}
      </ul>
    );
  }

  if (type === "YES_NO") {
    return (
      <p
        className={`mt-1 text-sm font-medium ${
          answer.toLowerCase() === "yes"
            ? "text-green-600 dark:text-green-400"
            : "text-red-500 dark:text-red-400"
        }`}
      >
        {answer}
      </p>
    );
  }

  return <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{answer}</p>;
}

// ── Question renderer ─────────────────────────────────────────────────────────

function renderQuestion(
  q: Question,
  formValues: Record<string, FormValue>,
  onChange: (id: string, value: FormValue) => void,
) {
  switch (q.type) {
    case "TEXT":
    case "DATE":
    case "LONG_TEXT":
      return (
        <div key={q.id}>
          {q.type === "LONG_TEXT" ? (
            <div>
              <Label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {q.title}
              </Label>
              <textarea
                className="w-full rounded-md border bg-gray-50 p-3 placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-[2px] focus-visible:ring-neutral-400 dark:bg-gray-700 dark:text-white"
                rows={4}
                value={typeof formValues[q.id] === "string" ? formValues[q.id] : ""}
                onChange={(e) => onChange(q.id, e.target.value)}
                placeholder={`Enter ${q.title}`}
              />
            </div>
          ) : (
            <Input
              key={q.id}
              type={q.type === "TEXT" ? "text" : "date"}
              label={q.title}
              value={typeof formValues[q.id] === "string" ? formValues[q.id] : ""}
              onChange={(e) => onChange(q.id, e.target.value)}
            />
          )}
        </div>
      );

    case "DATE_RANGE":
      return (
        <div key={q.id}>
          <Label>{q.title}</Label>
          <div className="flex space-x-4">
            <Input
              type="date"
              label="Start"
              value={
                typeof formValues[`${q.id}_start`] === "string"
                  ? formValues[`${q.id}_start`]
                  : ""
              }
              onChange={(e) => onChange(`${q.id}_start`, e.target.value)}
            />
            <Input
              type="date"
              label="End"
              value={
                typeof formValues[`${q.id}_end`] === "string"
                  ? formValues[`${q.id}_end`]
                  : ""
              }
              onChange={(e) => onChange(`${q.id}_end`, e.target.value)}
            />
          </div>
        </div>
      );

    case "YES_NO":
      return (
        <YesNoQuestion
          key={q.id}
          question={q.title}
          onChange={(val) => onChange(q.id, val)}
          value={typeof formValues[q.id] === "string" ? (formValues[q.id] as string) : ""}
        />
      );

    case "SINGLE_OPTION":
      return (
        <Select
          key={q.id}
          label={q.title}
          options={q?.options?.map((opt: string) => ({ label: opt, value: opt })) ?? []}
          value={typeof formValues[q.id] === "string" ? formValues[q.id] : ""}
          onChange={(e) => onChange(q.id, e.target.value)}
        />
      );

    case "MULTI_OPTION": {
      const value = formValues[q.id];
      const selectedValues = Array.isArray(value) ? value : [];
      return (
        <div key={q.id}>
          <Label className="mb-1 block">{q.title}</Label>
          <div className="space-y-2">
            {q?.options?.map((opt: string) => (
              <label key={opt} className="flex cursor-pointer items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedValues.includes(opt)}
                  onChange={(e) => {
                    if (Array.isArray(value)) {
                      onChange(
                        q.id,
                        e.target.checked
                          ? [...value, opt]
                          : value.filter((o) => o !== opt),
                      );
                    } else {
                      onChange(q.id, e.target.checked ? [opt] : []);
                    }
                  }}
                  className="accent-primary"
                />
                <span className="text-sm dark:text-gray-50">{opt}</span>
              </label>
            ))}
          </div>
        </div>
      );
    }

    default:
      return null;
  }
}

export default InspectionChecklist;