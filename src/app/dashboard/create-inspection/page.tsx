"use client";

import { QuestionInput } from "@/components/ui/QuestionInput";
import Button from "@/components/ui/Button";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";

export default function CreateInspectionPage() {
  const [questions, setQuestions] = useState<NewQuestion[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const router = useRouter();
  const createInspection = api.inspections.createInspection.useMutation();
  const addNewQuestion = () => {
    const newQuestion: NewQuestion = {
      title: "",
      questionNumber: questions.length + 1,
      type: "TEXT",
      options: [],
    };
    setQuestions([...questions, newQuestion]);
    setEditingIndex(questions.length);
  };

  const updateQuestion = (index: number, data: NewQuestion) => {
    const updated = [...questions];
    updated[index] = data;
    setQuestions(updated);
  };

  const deleteQuestion = (index: number) => {
    const updated = [...questions];
    updated.splice(index, 1);
    setQuestions(updated);
    if (editingIndex === index) setEditingIndex(null);
  };

  const handleSubmit = () => {
    if (!title.trim() || !description.trim()) {
      alert("Please fill in both title and description.");
      return;
    }

    const timestamp = new Date().getTime();

    const checklist: NewInspection = {
      title,
      description,
      questions: questions.map((q, i) => ({
        ...q,
        id: `Q${i + 1}`,
      })),
      status: "not_started",
    };

    // const storedInspections = JSON.parse(
    //   localStorage.getItem("inspections") ?? "[]",
    // ) as Inspection[];

    // const updatedInspections: Inspection[] = [...storedInspections, checklist];
    // localStorage.setItem("inspections", JSON.stringify(updatedInspections));
    createInspection.mutate(checklist);
    router.push("/dashboard/inspections-checklist");
    setQuestions([]);
    setTitle("");
    setDescription("");
  };

  return (
    <div className="p-8">
      <Input
        type="text"
        placeholder="Inspection Title"
        label="Inspection Title"
        className="mb-4 rounded-lg p-2 shadow md:w-1/2"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <Label className="text-md mb-2 text-gray-500">
        Inspection Description
      </Label>
      <textarea
        placeholder="Inspection Description"
        className="mb-4 min-h-28 w-full rounded-lg border bg-gray-50 p-2 shadow focus-visible:outline-none focus-visible:ring-[2px] focus-visible:ring-neutral-400 dark:bg-gray-700 dark:text-white"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <div className="space-y-6">
        {questions.map((q, i) => (
          <div key={i}>
            {editingIndex === i ? (
              <QuestionInput
                initialData={q}
                onDone={(data) => {
                  updateQuestion(i, data);
                  setEditingIndex(null);
                }}
              />
            ) : (
              q.title.trim() && (
                <div className="flex items-start justify-between rounded-lg border bg-white p-4 shadow dark:bg-gray-700 dark:text-white">
                  <div>
                    <p className="font-medium">Q: {q.title}</p>
                    <p className="text-sm capitalize text-gray-600 dark:text-gray-400">
                      Type: {q.type?.replace("_", " ")}
                    </p>
                    {q.options && q.options.length > 0 && (
                      <ul className="mt-1 list-decimal pl-4 text-sm text-gray-500 dark:text-gray-400">
                        {q.options.map((opt, idx) => (
                          <li key={idx} className="capitalize">
                            {opt}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="flex gap-2 text-lg text-gray-600">
                    <button onClick={() => setEditingIndex(i)} title="Edit">
                      <Pencil className="text-primary" />
                    </button>
                    <button onClick={() => deleteQuestion(i)} title="Delete">
                      <Trash2 className="text-primary" />
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        ))}

        <div className="flex gap-4">
          <Button
            onClick={addNewQuestion}
            title="Add New Question"
            disabled={editingIndex !== null}
          />
          {questions.length > 0 && (
            <Button
              onClick={handleSubmit}
              variant="secondary"
              title="Submit Checklist"
            />
          )}
        </div>
      </div>
    </div>
  );
}
