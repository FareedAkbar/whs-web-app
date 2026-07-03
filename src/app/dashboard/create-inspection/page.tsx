"use client";

import { QuestionInput } from "@/components/ui/QuestionInput";
import Button from "@/components/ui/Button";
import { Pencil, Trash2, ChevronDown, ChevronUp, Plus } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { IconChecklist } from "@tabler/icons-react";
import { toast } from "react-toastify";
import SectionTableEditor, { NewTable } from "@/components/table/SectionTableEditor";


export default function CreateInspectionPage() {
  const [sections, setSections] = useState<NewSection[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<{
    sectionIndex: number;
    questionIndex: number;
  } | null>(null);
  
  const [collapsedSections, setCollapsedSections] = useState<Set<number>>(
    new Set()
  );
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const router = useRouter();
  const createInspection = api.inspections.createInspection.useMutation();

  // ── Section helpers ──────────────────────────────────────────────

  const addSection = () => {
    setSections((prev): NewSection[] => [
      ...prev,
      { title: "", description: "", order: prev.length + 1, questions: [],notes: "",tables: [] },
    ]);
  };

  const updateSection = (
    index: number,
    field: keyof Pick<NewSection, "title" | "description"|"notes">,
    value: string,
  ) => {
    setSections((prev) =>
      prev.map((s, i): NewSection =>
        i === index ? { ...s, [field]: value } : s
      )
    );
  };

  const deleteSection = (index: number) => {
    setSections((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((s, i): NewSection => ({ ...s, order: i + 1 }))
    );
    if (editingQuestion?.sectionIndex === index) setEditingQuestion(null);
  };

  const toggleCollapse = (index: number) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  };


// 3. Add a handler to update tables for a section
const updateSectionTables = (index: number, tables: NewTable[]) => {
  setSections((prev) =>
    prev.map((s, i): NewSection => (i === index ? { ...s, tables } : s)),
  );
};

  // ── Question helpers ─────────────────────────────────────────────

  const addQuestion = (sectionIndex: number) => {
    const section = sections[sectionIndex]!;
    const newIdx = section.questions.length;
    const newQuestion: NewQuestion = {
      title: "",
      questionNumber: newIdx + 1,
      type: "TEXT",
      options: [],
    };
    setSections((prev) =>
      prev.map((s, i): NewSection =>
        i === sectionIndex
          ? { ...s, questions: [...s.questions, newQuestion] }
          : s
      )
    );
    setEditingQuestion({ sectionIndex, questionIndex: newIdx });
  };

  const updateQuestion = (
    sectionIndex: number,
    questionIndex: number,
    data: NewQuestion
  ) => {
    setSections((prev) =>
      prev.map((s, i): NewSection =>
        i === sectionIndex
          ? { ...s, questions: s.questions.map((q, qi) => (qi === questionIndex ? data : q)) }
          : s
      )
    );
  };

const deleteQuestion = (sectionIndex: number, questionIndex: number) => {
  setSections((prev) =>
    prev.map((s, i): NewSection =>
      i === sectionIndex
        ? { ...s, questions: s.questions.filter((_, qi) => qi !== questionIndex) }
        : s
    )
  );

  setEditingQuestion((prev) => {
    if (!prev || prev.sectionIndex !== sectionIndex) return prev;
    if (prev.questionIndex === questionIndex) return null;
    if (prev.questionIndex > questionIndex) {
      return { ...prev, questionIndex: prev.questionIndex - 1 };
    }
    return prev;
  });
};

  // ── Submit ───────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      toast.error("Please fill in both inspection title and description.");
      return;
    }
    if (sections.length === 0) {
      toast.error("Please add at least one section.");
      return;
    }
    if (sections.some((s) => !s.title.trim())) {
      toast.error("Please ensure all sections have a title.");
      return;
    }
   const hasQuestionsOrTables = sections.some(
    (s) => s.questions.length > 0 || (s.tables?.length ?? 0) > 0
    );

    if (!hasQuestionsOrTables) {
      toast.error("Please add at least one question or table.");
      return;
    }
    const invalidTable = sections.some((section) =>
      (section.tables ?? []).some(
        (table) =>
          !table.name.trim() ||
          table.columns.length === 0 ||
          table.columns.some((column) => !column.trim())
      )
    );

    if (invalidTable) {
      toast.error(
        "Please ensure all tables have a name and at least one valid column."
      );
      return;
    }
    if (sections.some((s) => s.questions.some((q) => !q.title.trim()))) {
      toast.error("Please ensure all questions have a title.");
      return;
    }

    const payload: NewInspection = {
      title,
      description,
      sections,
      status: "not_started",
    };

    await createInspection.mutateAsync(payload, {
      onSuccess: () => {
        router.push("/dashboard/inspections");
        toast.success("Inspection created successfully!");
        setSections([]);
        setTitle("");
        setDescription("");
      },
      onError: (error) => {
        toast.error(`Error creating inspection: ${error.message}`);
      },
    });
  };

  const isEditingAnywhere = editingQuestion !== null;
  const totalQuestions = sections.reduce(
    (acc, s) => acc + s.questions.length,
    0
  );
  const totalTables = sections.reduce(
    (acc, s) => acc + (s.tables?.length ?? 0),
    0
  );
  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
          Create Inspection
        </h1>
        {/* <Button
          onClick={() => router.push("/dashboard/inspections")}
          title="Inspections List"
          icon={<IconChecklist />}
        /> */}
      </div>

      {/* Inspection meta */}
      <div className="mb-8 rounded-xl border bg-white p-4 shadow-sm dark:bg-gray-800 md:p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
          Inspection Details
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            type="text"
            placeholder="Inspection Title"
            label="Inspection Title"
            className="rounded-lg p-2 shadow"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div className="flex flex-col gap-1 md:col-span-2">
            <Label className="text-md text-gray-500">
              Inspection Description <span className="text-red-500">*</span>
            </Label>
            <textarea
              placeholder="Inspection Description"
              className="min-h-24 w-full rounded-lg border bg-gray-50 p-2 shadow focus-visible:outline-none focus-visible:ring-[2px] focus-visible:ring-neutral-400 dark:bg-gray-700 dark:text-white"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
         
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {sections.map((section, sIdx) => {
          const isCollapsed = collapsedSections.has(sIdx);
          return (
            <div
              key={sIdx}
              className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
            >
              {/* Section header */}
              <div className="flex items-start gap-3 border-b border-gray-100 p-4 dark:border-gray-700">
                {/* Order badge */}
                <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {sIdx + 1}
                </span>

                <div className="flex-1 space-y-2">
                  <Input type="text" required label="Section Title" placeholder="Section Title" value={section.title} onChange={(e) => updateSection(sIdx, "title", e.target.value)} />
                  
                  <Input
                    type="text"
                    label="Section Description (optional)"
                    placeholder="Section Description (optional)"
                    value={section.description ?? ""}
                    onChange={(e) =>
                      updateSection(sIdx, "description", e.target.value)
                    }
                    className=""
                  />
                  <div className="flex flex-col gap-1 md:col-span-2">
            <Label className="text-md text-gray-500">
              Additional notes (optional)
            </Label>
            <textarea
              placeholder="Additional notes (optional)"
              className="min-h-24 w-full rounded-lg border bg-gray-50 p-2 shadow focus-visible:outline-none focus-visible:ring-[2px] focus-visible:ring-neutral-400 dark:bg-gray-700 dark:text-white"
              value={section.notes ?? ""}
              onChange={(e) => updateSection(sIdx, "notes", e.target.value)}
            />
          </div>
                </div>

                <div className="flex shrink-0 items-center gap-1 pt-1">
                  <button
                    onClick={() => toggleCollapse(sIdx)}
                    className="rounded p-1 text-gray-400 hover:text-gray-700 dark:hover:text-white"
                    title={isCollapsed ? "Expand" : "Collapse"}
                  >
                    {isCollapsed ? (
                      <ChevronDown size={18} />
                    ) : (
                      <ChevronUp size={18} />
                    )}
                  </button>
                  <button
                    onClick={() => deleteSection(sIdx)}
                    className="rounded p-1 text-gray-400 hover:text-red-500"
                    title="Delete Section"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Questions area */}
              {!isCollapsed && (
                <div className="p-4 md:p-5">
                  <div className="space-y-3">
                    {section.questions.map((q, qIdx) => {
                      const isEditingThis =
                        editingQuestion?.sectionIndex === sIdx &&
                        editingQuestion?.questionIndex === qIdx;

                      return (
                        <div key={qIdx}>
                          {isEditingThis ? (
                            <QuestionInput
                              initialData={q}
                              onDone={(data) => {
                                updateQuestion(sIdx, qIdx, data);
                                setEditingQuestion(null);
                              }}
                              onCancel={() => {
                                if (!q.title.trim())
                                  deleteQuestion(sIdx, qIdx);
                                setEditingQuestion(null);
                              }}
                            />
                          ) : (
                            q.title.trim() && (
                              <div className="flex items-start justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-700/50">
                                <div className="flex gap-3">
                                  <span className="mt-0.5 text-xs font-semibold text-gray-400 dark:text-gray-500">
                                    Q{qIdx + 1}
                                  </span>
                                  <div>
                                    <p className="text-sm font-medium text-gray-800 dark:text-white">
                                      {q.title}
                                    </p>
                                    <p className="mt-0.5 text-xs capitalize text-gray-400 dark:text-gray-500">
                                      {q.type?.replace(/_/g, " ")}
                                    </p>
                                    {q.options && q.options.length > 0 && (
                                      <ul className="mt-1 list-disc pl-4 text-xs text-gray-400 dark:text-gray-500">
                                        {q.options.map((opt, i) => (
                                          <li key={i} className="capitalize">
                                            {opt}
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                  </div>
                                </div>
                                <div className="flex shrink-0 gap-1.5">
                                  <button
                                    onClick={() =>
                                      setEditingQuestion({
                                        sectionIndex: sIdx,
                                        questionIndex: qIdx,
                                      })
                                    }
                                    title="Edit"
                                    className="rounded p-1 text-gray-400 hover:text-primary"
                                  >
                                    <Pencil size={15} />
                                  </button>
                                  <button
                                    onClick={() =>
                                      deleteQuestion(sIdx, qIdx)
                                    }
                                    title="Delete"
                                    className="rounded p-1 text-gray-400 hover:text-red-500"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Add question button */}
                    <Button
                      title="Add Question"
                      variant="secondary"
                      onClick={() => addQuestion(sIdx)}
                      disabled={editingQuestion !== null && editingQuestion.sectionIndex === sIdx}
                      className="mt-4"
                    />                  
                    <div className="mt-5 border-t border-gray-100 pt-4 dark:border-gray-700">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                      Tables
                    </p>
                    <SectionTableEditor
                      tables={section.tables ?? []}
                      onChange={(tables) => updateSectionTables(sIdx, tables)}
                    />
                  </div>
                </div>
              )}

              {/* Collapsed summary */}
              {isCollapsed && (
                <div className="px-5 py-2 text-xs text-gray-400 dark:text-gray-500">
                  {section.questions.length} question
                  {section.questions.length !== 1 ? "s" : ""}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom actions */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button
          onClick={addSection}
          title="Add Section"
          icon={<Plus size={16} />}
          disabled={isEditingAnywhere}
        />
        <div className="mt-4 flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-start sm:gap-4">
          <Button
            variant="secondary"
            title="Back"
            onClick={() => router.back()}
            />
            <Button
              onClick={handleSubmit}
              title="Create Inspection"
              disabled={
                createInspection.isPending ||
                isEditingAnywhere ||
                sections.length === 0 ||
                (totalQuestions === 0 && totalTables === 0)
              }              
              loading={createInspection.isPending}
            />
         </div>
      </div>
    </div>
  );
}