"use client";

import React, { use, useEffect, useMemo, useState } from "react";
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
import { CheckCircle, Clock, Hourglass, Send } from "lucide-react";
import { hasPermission } from "@/lib/auth";
import { useSession } from "next-auth/react";
import { Eye, Trash2 } from "lucide-react";
import { api } from "@/trpc/react";
import { toast } from "react-toastify";
import { m } from "framer-motion";
import ViewInspections from "@/components/ui/ViewInspections";
import { UserRole } from "@/types/roles";
import { set } from "zod";

const statusIcons: Record<string, { icon: React.JSX.Element; label: string }> =
  {
    not_started: {
      icon: <Clock className="text-gray-400" />,
      label: "Not Started",
    },
    in_progress: {
      icon: <Hourglass className="text-yellow-500" />,
      label: "In Progress",
    },
    completed: {
      icon: <CheckCircle className="text-green-500" />,
      label: "Completed",
    },
    submitted: { icon: <Send className="text-blue-500" />, label: "Submitted" },
  };

type FormValue = string | string[];

const InspectionChecklist = () => {
  const [formValues, setFormValues] = useState<Record<string, FormValue>>({});
  const [confirmDelete, setConfirmDelete] = useState<Inspection | null>(null);
  const [modal, setModal] = useState<{
    type: "view" | "delete" | "assign" | null;
    data?: InspectionDetail | null | Inspection;
  }>({ type: null, data: null });

  const router = useRouter();
  const { setOpen } = useModal();

  const {
    data: inspections,
    isLoading,
    refetch,
  } = api.inspections.getInspections.useQuery();
  const { data: inspectionDetail } = api.inspections.getInspectionById.useQuery(
    { id: modal.data?.id ?? "" },
    {
      enabled:
        (modal.type === "view" || modal.type === "assign") &&
        Boolean(modal.data?.id),
      staleTime: 0, // always fresh
    },
  );
  const submitInspection = api.inspections.submitInspection.useMutation();

  const deleteInspection = api.inspections.deleteInspection.useMutation({
    onSuccess: () => {
      setConfirmDelete(null);
      void refetch();
    },
  });
  const assignMutation = api.inspections.assignInspection.useMutation({
    onSuccess: () => {
      setAssignInspection(null);
      setSelectedUser(null);
      setDueDate("");
      toast.success("Inspection assigned successfully");
      setOpen(false);
      setModal({ type: null, data: null });
      void refetch();
    },
  });
  const buildPayload = (): {
    inspectionId: string;
    answers: { questionId: string; answer: string | string[] }[];
  } | null => {
    const inspection = inspectionDetail?.data;
    if (!inspection) return null;

    return {
      inspectionId: inspection.inspections.find(
        (i) => i.status === "INITIATED" && i.assignedTo.id === user?.id,
      )!.id,
      answers: inspection.questions.map((q) => {
        if (q.type === "DATE_RANGE") {
          return {
            questionId: q.id,
            answer: [
              (formValues[`${q.id}_start`] as string) || "",
              (formValues[`${q.id}_end`] as string) || "",
            ],
          };
        }

        return {
          questionId: q.id,
          answer: formValues[q.id] as string | string[],
        };
      }),
    };
  };

  const session = useSession();
  const user = session.data?.user;
  // NEW STATE for assign modal
  const [assignInspection, setAssignInspection] = useState<Inspection | null>(
    null,
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState("");

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
        return []; // others cannot assign inspections
    }
  };

  // ✅ Filter users by search
  const filteredUsers = useMemo(
    () =>
      filterByRole(verifiedUsers?.data ?? [], user?.role!).filter((u) => {
        return (
          u.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !inspectionDetail?.data?.inspections.some(
            (i) => i.assignedTo?.id === u.id,
          )
        );
      }),
    [searchTerm, verifiedUsers, inspectionDetail],
  );

  const updateStatus = (id: string, status: Inspection["status"]) => {
    const updated = inspections?.data?.map((insp) =>
      insp.id === id ? { ...insp, status } : insp,
    );
    // setInspections(updated);
    // localStorage.setItem("inspections", JSON.stringify(updated));
  };
  const handleInputChange = (id: string, value: FormValue) => {
    setFormValues((prev) => ({ ...prev, [id]: value }));
    if (!modal.data?.id) return;
    updateStatus(modal.data.id, "in_progress");
  };

  const isFormValid = () => {
    return (
      modal.data?.questions.every((q: Question) => {
        if (q.type === "MULTI_OPTION") {
          const value = formValues[q.id];
          return Array.isArray(value) && value.length > 0;
        }

        if (q.type === "DATE_RANGE") {
          return Boolean(
            formValues[`${q.id}_start`] && formValues[`${q.id}_end`],
          );
        }

        return formValues[q.id] !== undefined && formValues[q.id] !== "";
      }) ?? false
    );
  };

  const handleSubmit = () => {
    if (!isFormValid()) {
      toast.error("Please fill out all questions before submitting.");
      return;
    }

    const payload = buildPayload();
    if (!payload) return;

    submitInspection.mutate(payload, {
      onSuccess: (res) => {
        if (res.status) {
          toast.success("Inspection submitted successfully!");
        } else {
          toast.error(res.error ?? "Failed to submit inspection");
        }

        setModal({ type: null, data: null });
        setFormValues({});
        setOpen(false);
      },
      onError: () => {
        toast.error("Something went wrong!");
      },
    });
  };

  if (isLoading) {
    return (
      <div className="relative flex h-2/3 w-full items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-6">
      {user && hasPermission(user.role, "create:inspections") && (
        <div className="flex w-full items-center justify-end">
          <Button
            onClick={() => router.push("/dashboard/create-inspection")}
            title="Create Inspection Checklist"
            icon={<PlusIcon />}
          />
        </div>
      )}

      <div className="w-full space-y-6 p-6">
        {inspections?.data?.map((inspection: Inspection) => (
          <div
            key={inspection.id}
            className="relative w-full rounded-lg border bg-white p-6 text-left shadow-md dark:bg-gray-800 dark:text-white"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold capitalize">
                  {inspection.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {inspection.description}
                </p>
              </div>
              <div className="flex flex-col items-end justify-center gap-2">
                {/* Right Side Icons */}
                <div className="flex justify-end space-x-3">
                  {/* View icon */}
                  <button
                    onClick={() => {
                      setFormValues({});
                      setModal({ type: "view", data: inspection });
                      setOpen(true);
                    }}
                    className="text-primary hover:scale-105"
                  >
                    <Eye size={20} />
                  </button>

                  {/* Delete icon */}
                  <button
                    onClick={() => {
                      setModal({ type: "delete", data: inspection });
                      setOpen(true);
                    }}
                    className="text-primary hover:scale-105"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
                {user &&
                  hasPermission(user.role, "assign:inspections") &&
                  inspection.createdBy === user.id && (
                    <Button
                      title="Assign Inspection"
                      icon={<UserPlus size={16} />}
                      onClick={() => {
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

      {/* View Modal */}
      {modal.type === "view" && modal.data && inspectionDetail && (
        <ModalBody className="w-full overflow-y-auto">
          <ModalContent className="w-full">
            <h2 className="mb-4 text-2xl font-bold dark:text-white">
              {modal.data.title}
            </h2>
            <p className="mb-4 text-gray-600 dark:text-gray-400">
              {modal.data.description}
            </p>

            {/* --------------------------------------
          1. VIEW QUESTIONS (no inspection filled)
      --------------------------------------- */}
            {inspectionDetail.data?.questions &&
              inspectionDetail.data?.questions?.length > 0 &&
              user?.id !==
                inspectionDetail?.data?.inspections?.[0]?.assignedTo.id &&
              hasPermission(user?.role!, "view:inspections") &&
              !inspectionDetail?.data?.inspections.some(
                (insp) => insp.answers?.length > 0,
              ) && (
                <div className="mb-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                  <h3 className="mb-3 text-xl font-semibold dark:text-white">
                    Questions
                  </h3>

                  {inspectionDetail.data?.questions
                    .sort((a, b) => a.questionNumber! - b.questionNumber!)
                    .map((q) => (
                      <div
                        key={q.id}
                        className="mb-3 border-b border-gray-500 pb-3"
                      >
                        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                          {q.questionNumber}. {q.title}
                        </p>

                        <p className="mt-1 text-gray-600 dark:text-gray-400">
                          Type: {q.type.replaceAll("_", " ")}
                        </p>

                        {(q.type === "SINGLE_OPTION" ||
                          q.type === "MULTI_OPTION") && (
                          <div className="ml-4 mt-2">
                            {q.options?.map((opt, i) => (
                              <p
                                key={i}
                                className="text-gray-500 dark:text-gray-400"
                              >
                                • {opt}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}

            {/* --------------------------------------
          2. ASSIGN USER SECTION
      --------------------------------------- */}
            {user && hasPermission(user.role, "view:filled-inspections") && (
              <ViewInspections
                inspections={inspectionDetail.data?.inspections!}
                questions={inspectionDetail.data?.questions!}
                isUserAdmin={inspectionDetail.data?.createdBy === user.id}
              />
            )}

            {/* --------------------------------------
          3. FILL INSPECTION ANSWERS (no answers yet)
      --------------------------------------- */}
            {modal.data.questions &&
              hasPermission(user?.role!, "fill:inspections") &&
              inspectionDetail?.data?.inspections?.[0]?.assignedTo.id ===
                user?.id! &&
              !inspectionDetail?.data?.inspections.some(
                (insp) => insp.answers && (insp.answers?.length ?? 0) > 0,
              ) && (
                <div className="mt-4 space-y-4">
                  {modal.data.questions.map((q) =>
                    renderQuestion(q, formValues, handleInputChange),
                  )}

                  {hasPermission(user?.role!, "submit:inspection") && (
                    <div className="mt-6 flex justify-end">
                      <Button
                        title="Submit"
                        onClick={handleSubmit}
                        disabled={!isFormValid()}
                        loading={submitInspection.isPending}
                      />
                    </div>
                  )}
                </div>
              )}
          </ModalContent>
        </ModalBody>
      )}

      {/* Delete Modal */}
      {modal.type === "delete" && modal.data && (
        <ModalBody className="mx-3 w-full">
          <ModalContent className="w-full">
            <h2 className="mb-4 text-xl font-bold dark:text-white">
              Delete Inspection
            </h2>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              Are you sure you want to delete{" "}
              <span className="font-semibold">{modal.data.title}</span>? This
              action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                title={deleteInspection.isPending ? "Deleting..." : "Delete"}
                onClick={() => deleteInspection.mutate({ id: modal.data?.id! })}
                disabled={deleteInspection.isPending}
              />
              <Button
                title="Cancel"
                onClick={() => setConfirmDelete(null)}
                variant="secondary"
              />
            </div>
          </ModalContent>
        </ModalBody>
      )}

      {/* Assign Modal */}
      {modal.type === "assign" && modal.data && (
        <ModalBody className="mx-3 w-full">
          <ModalContent className="w-full">
            <h2 className="mb-4 text-xl font-bold dark:text-white">
              Assign Inspection: {modal.data.title}
            </h2>

            {/* Search Users */}
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              // className="mb-4"
            />

            {/* Users List */}
            <div className="mb-4 max-h-60 overflow-y-auto rounded-md border p-2">
              {loadingUsers ? (
                <p>Loading users...</p>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <div
                    key={u.id}
                    onClick={() => setSelectedUser(u.id)}
                    className={`cursor-pointer rounded-md p-2 ${
                      selectedUser === u.id
                        ? "bg-primary text-white"
                        : "border-b hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    {u.name} ({u.email})
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No users found</p>
              )}
            </div>

            {/* Due Date */}
            <Label className="mb-1 block">Due Date</Label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="mb-6"
            />

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button
                title="Cancel"
                variant="secondary"
                onClick={() => setAssignInspection(null)}
              />
              <Button
                title={"Assign"}
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

function renderQuestion(
  q: Question,
  formValues: Record<string, FormValue>,
  onChange: (id: string, value: FormValue) => void,
) {
  switch (q.type) {
    case "TEXT":
    case "DATE":
      return (
        <Input
          type={q.type}
          label={q.title}
          value={typeof formValues[q.id] === "string" ? formValues[q.id] : ""}
          onChange={(e) => onChange(q.id, e.target.value)}
        />
      );

    case "DATE_RANGE":
      return (
        <div>
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
          question={q.title}
          onChange={(val) => onChange(q.id, val)}
          value={
            typeof formValues[q.id] === "string"
              ? (formValues[q.id] as string)
              : ""
          }
        />
      );

    case "SINGLE_OPTION":
      return (
        <Select
          label={q.title}
          options={
            q?.options?.map((opt: string) => ({
              label: opt,
              value: opt,
            })) ?? []
          }
          value={typeof formValues[q.id] === "string" ? formValues[q.id] : ""}
          onChange={(e) => onChange(q.id, e.target.value)}
        />
      );

    case "MULTI_OPTION": {
      const value = formValues[q.id];
      const selectedValues = Array.isArray(value) ? value : [];

      return (
        <div>
          <Label className="mb-1 block">{q.title}</Label>
          <div className="space-y-2">
            {q?.options?.map((opt: string) => (
              <label key={opt} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedValues.includes(opt)}
                  onChange={(e) => {
                    const checked = e.target.checked;

                    if (Array.isArray(value)) {
                      // 'value' is typed as string | string[], but inside here it is string[]
                      onChange(
                        q.id,
                        checked
                          ? [...value, opt]
                          : value.filter((o) => o !== opt),
                      );
                    } else {
                      // value is not an array, initialize as array with opt if checked, else empty array
                      onChange(q.id, checked ? [opt] : []);
                    }
                  }}
                  className="accent-primary"
                />
                <span>{opt}</span>
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

function renderQuestionViewOnly(q: Question) {
  return (
    <div className="mb-4">
      <Label className="block font-semibold">
        {q.questionNumber}: {q.title}
      </Label>
      <p className="text-sm capitalize text-gray-500">
        Type: {q.type.replaceAll("_", " ")}
      </p>
      {(q.type === "SINGLE_OPTION" || q.type === "MULTI_OPTION") &&
        q.options &&
        q.options?.length > 0 && (
          <div className="mt-1 text-sm text-gray-700">
            Options: {q.options.join(", ")}
          </div>
        )}
    </div>
  );
}

export default InspectionChecklist;
