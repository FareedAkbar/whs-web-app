"use client";

import React, { useEffect, useState } from "react";
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
  const [selectedInspection, setSelectedInspection] =
    useState<Inspection | null>(null);
  const [formValues, setFormValues] = useState<Record<string, FormValue>>({});
  const [confirmDelete, setConfirmDelete] = useState<Inspection | null>(null);

  const router = useRouter();
  const { setOpen } = useModal();

  const {
    data: inspections,
    isLoading,
    refetch,
  } = api.inspections.getInsepctions.useQuery();
  const deleteInspection = api.inspections.deleteInspection.useMutation({
    onSuccess: () => {
      setConfirmDelete(null);
      refetch();
    },
  });
  const assignMutation = api.inspections.assignInspection.useMutation({
    onSuccess: () => {
      setAssignInspection(null);
      setSelectedUser(null);
      setDueDate("");
      refetch();
    },
  });
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
    api.users.getVerifiedUsers.useQuery(undefined, {
      enabled: user?.role === "ADMIN",
    });

  // ✅ Filter users by search
  const filteredUsers =
    verifiedUsers?.data?.filter((u) =>
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()),
    ) ?? [];

  const updateStatus = (id: string, status: Inspection["status"]) => {
    const updated = inspections?.data?.map((insp) =>
      insp.id === id ? { ...insp, status } : insp,
    );
    // setInspections(updated);
    // localStorage.setItem("inspections", JSON.stringify(updated));
  };
  const handleInputChange = (id: string, value: FormValue) => {
    setFormValues((prev) => ({ ...prev, [id]: value }));
    if (!selectedInspection?.id) return;
    updateStatus(selectedInspection.id, "in_progress");
  };

  const isFormValid = () => {
    return (
      selectedInspection?.questions.every((q: Question) => {
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
      alert("Please fill out all questions before submitting.");
      return;
    }

    if (!selectedInspection?.id) return;
    updateStatus(selectedInspection.id, "submitted");
    setSelectedInspection(null);
    setFormValues({});
    setOpen(false);
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
      {user && hasPermission(user.role, "create:checklist") && (
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
                      setSelectedInspection(inspection);
                      setFormValues({});
                      setOpen(true);
                    }}
                    className="text-primary hover:scale-105"
                  >
                    <Eye size={20} />
                  </button>

                  {/* Delete icon */}
                  <button
                    onClick={() => {
                      setConfirmDelete(inspection);
                      setOpen(true);
                    }}
                    className="text-primary hover:scale-105"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
                <Button
                  title="Assign Inspection"
                  icon={<UserPlus size={16} />}
                  onClick={() => {
                    setAssignInspection(inspection);
                    setOpen(true);
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View Modal */}
      {selectedInspection && (
        <ModalBody className="mx-3 w-full overflow-y-auto">
          <ModalContent className="w-full">
            <h2 className="mb-4 text-2xl font-bold dark:text-white">
              {selectedInspection.title}
            </h2>

            <div className="gap-4">
              {selectedInspection.questions.map((q: Question) => (
                <div
                  key={q.id}
                  // className={`${
                  //   q.type === "YES_NO" || q.type === "DATE_RANGE"
                  //     ? "col-span-2"
                  //     : ""
                  // }`}
                >
                  {user && hasPermission(user.role, "fill:checklist")
                    ? renderQuestion(q, formValues, handleInputChange)
                    : user &&
                      hasPermission(user.role, "view:checklist") &&
                      renderQuestionViewOnly(q)}
                </div>
              ))}
            </div>

            {user && hasPermission(user.role, "fill:checklist") && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
              >
                <Button
                  type="submit"
                  title="Submit"
                  className="mt-4 w-full"
                  disabled={!isFormValid()}
                />
              </form>
            )}
          </ModalContent>
        </ModalBody>
      )}

      {/* Delete Modal */}
      {confirmDelete && (
        <ModalBody className="mx-3 w-full">
          <ModalContent className="w-full">
            <h2 className="mb-4 text-xl font-bold dark:text-white">
              Delete Inspection
            </h2>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              Are you sure you want to delete{" "}
              <span className="font-semibold">{confirmDelete.title}</span>? This
              action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                title="Cancel"
                onClick={() => setConfirmDelete(null)}
                variant="secondary"
              />
              <Button
                title={deleteInspection.isPending ? "Deleting..." : "Delete"}
                onClick={() =>
                  deleteInspection.mutate({ id: confirmDelete.id })
                }
                disabled={deleteInspection.isPending}
              />
            </div>
          </ModalContent>
        </ModalBody>
      )}

      {/* Assign Modal */}
      {assignInspection && (
        <ModalBody className="mx-3 w-full">
          <ModalContent className="w-full">
            <h2 className="mb-4 text-xl font-bold dark:text-white">
              Assign Inspection: {assignInspection.title}
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
                title={assignMutation.isPending ? "Assigning..." : "Assign"}
                disabled={!selectedUser || !dueDate || assignMutation.isPending}
                onClick={() =>
                  assignMutation.mutate({
                    surveyId: assignInspection.id,
                    assignedTo: selectedUser!,
                    dueDate,
                  })
                }
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
