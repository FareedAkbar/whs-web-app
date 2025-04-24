"use client";

import { QuestionInput } from "@/components/ui/QuestionInput";
import Button from "@/components/ui/Button";
import { Question } from "@/types/questions";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CreateInspectionPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const addNewQuestion = () => {
    const newQuestion: Question = {
      question: "",
      type: "text",
      options: [],
    };
    setQuestions([...questions, newQuestion]);
    setEditingIndex(questions.length);
  };

  const updateQuestion = (index: number, data: Question) => {
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
    console.log("Checklist submitted:", questions);
    // Implement actual submit logic here
  };

  return (
    <div className="p-8">
      {/* <h1 className="mb-6 text-3xl font-bold">Create Inspection Checklist</h1> */}

      <Input
        type="text"
        placeholder="Inspection Title"
        label="Inspection Title"
        className="mb-4 rounded-lg border bg-white p-2 shadow md:w-1/2"
      />
      <Label className="text-md mb-2 text-gray-500">
        Inspection Description
      </Label>
      <textarea
        placeholder="Inspection Description"
        className="mb-4 min-h-28 w-full rounded-lg border bg-white p-2 shadow focus-visible:outline-none focus-visible:ring-[2px] focus-visible:ring-neutral-400"
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
              q.question.trim() && (
                <div className="flex items-start justify-between rounded-lg border bg-white p-4 shadow">
                  <div>
                    <p className="font-medium">Q: {q.question}</p>
                    <p className="text-sm capitalize text-gray-600">
                      Type: {q.type?.replace("_", " ")}
                    </p>
                    {q.options && q.options.length > 0 && (
                      <ul className="mt-1 list-decimal pl-4 text-sm text-gray-500">
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
