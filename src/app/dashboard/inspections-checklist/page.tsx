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
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { CheckCircle, Clock, Hourglass, Send } from "lucide-react";
import { hasPermission } from "@/lib/auth";
import { useSession } from "next-auth/react";
import type { Question } from "@/types/questions";

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
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const router = useRouter();
  const { setOpen } = useModal();
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const getInspections = () => {
      setIsLoading(true);
      const stored = JSON.parse(
        localStorage.getItem("inspections") ?? "[]",
      ) as Inspection[];

      setInspections(stored);

      setIsLoading(false);
    };
    getInspections();
  }, []);

  const updateStatus = (id: string, status: Inspection["status"]) => {
    const updated = inspections.map((insp) =>
      insp.id === id ? { ...insp, status } : insp,
    );
    setInspections(updated);
    localStorage.setItem("inspections", JSON.stringify(updated));
  };
  const session = useSession();
  const user = session.data?.user;
  const handleInputChange = (id: string, value: FormValue) => {
    setFormValues((prev) => ({ ...prev, [id]: value }));
    if (!selectedInspection?.id) return;
    updateStatus(selectedInspection.id, "in_progress");
  };

  const isFormValid = () => {
    return selectedInspection?.questions.every((q: Question) => {
      if (q.type === "multiple_selection") {
        const value = formValues[q.id];
        if (Array.isArray(value)) {
          return value.length;
        }
        return 0;
      }
      if (q.type === "date_range")
        return formValues[`${q.id}_start`] && formValues[`${q.id}_end`];
      return formValues[q.id] !== undefined && formValues[q.id] !== "";
    });
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
        {inspections.map((inspection: Inspection) => (
          <div
            key={inspection.id}
            className="relative w-full cursor-pointer rounded-lg border bg-white p-6 text-left shadow-md dark:bg-gray-800 dark:text-white"
            onClick={() => {
              setSelectedInspection(inspection);
              setFormValues({});
              setOpen(true);
            }}
          >
            <div className="flex justify-between">
              <div>
                <h2 className="text-xl font-bold">{inspection.title}</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {inspection.description}
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                {statusIcons[inspection.status]?.icon}
                <span className="text-gray-600 dark:text-gray-400">
                  {statusIcons[inspection.status]?.label}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ModalBody className="mx-3 w-full overflow-y-auto">
        {selectedInspection && (
          // <form
          //   onSubmit={(e) => {
          //     e.preventDefault();
          //     handleSubmit();
          //   }}
          // >
          <ModalContent className="w-full">
            <h2 className="mb-4 text-2xl font-bold dark:text-white">
              {selectedInspection.title}
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {selectedInspection.questions.map((q: Question) => (
                <div
                  key={q.id}
                  className={`${
                    q.type === "yes_no" || q.type === "date_range"
                      ? "col-span-2"
                      : ""
                  }`}
                >
                  {user && hasPermission(user.role, "fill:checklist")
                    ? renderQuestion(q, formValues, handleInputChange)
                    : user &&
                      hasPermission(user.role, "view:checklist") &&
                      renderQuestionViewOnly(q)}
                  {/* {renderQuestion(q, formValues, handleInputChange)} */}
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
          // </form>
        )}
      </ModalBody>
    </div>
  );
};

function renderQuestion(
  q: Question,
  formValues: Record<string, FormValue>,
  onChange: (id: string, value: FormValue) => void,
) {
  switch (q.type) {
    case "text":
    case "date":
      return (
        <Input
          type={q.type}
          label={q.question}
          value={typeof formValues[q.id] === "string" ? formValues[q.id] : ""}
          onChange={(e) => onChange(q.id, e.target.value)}
        />
      );

    case "date_range":
      return (
        <div>
          <Label>{q.question}</Label>
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

    case "yes_no":
      return (
        <YesNoQuestion
          question={q.question}
          onChange={(val) => onChange(q.id, val)}
          value={
            typeof formValues[q.id] === "string"
              ? (formValues[q.id] as string)
              : ""
          }
        />
      );

    case "single_selection":
      return (
        <Select
          label={q.question}
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

    case "multiple_selection": {
      const value = formValues[q.id];
      const selectedValues = Array.isArray(value) ? value : [];

      return (
        <div>
          <Label className="mb-1 block">{q.question}</Label>
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
        {q.id}: {q.question}
      </Label>
      <p className="text-sm capitalize text-gray-500">
        Type: {q.type.replaceAll("_", " ")}
      </p>
      {(q.type === "single_selection" || q.type === "multiple_selection") &&
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
