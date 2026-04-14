"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import Button from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { PlusIcon, Pencil, Trash2 } from "lucide-react";

interface Props {
  initialData?: NewQuestion;
  onDone: (data: NewQuestion) => void;
  onCancel?: () => void;
}

export const QuestionInput: React.FC<Props> = ({
  initialData,
  onDone,
  onCancel,
}) => {
  const [question, setQuestion] = useState(initialData?.title ?? "");
  const [type, setType] = useState<AnsType>(initialData?.type ?? "TEXT");
  const [options, setOptions] = useState<string[]>(initialData?.options ?? []);
  const [newOption, setNewOption] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState("");

  const handleAddOption = () => {
    if (newOption.trim()) {
      setOptions([...options, newOption.trim()]);
      setNewOption("");
    }
  };

  const handleEditOption = (index: number) => {
    setEditingIndex(index);
    setEditingValue(options[index]!);
  };

  const handleSaveEditedOption = () => {
    if (editingIndex !== null && editingValue.trim()) {
      const updated = [...options];
      updated[editingIndex] = editingValue.trim();
      setOptions(updated);
      setEditingIndex(null);
      setEditingValue("");
    }
  };
  const handleDeleteOption = (index: number) => {
    const updated = [...options];
    updated.splice(index, 1);
    setOptions(updated);
  };
  const handleDone = () => {
    const finalData: NewQuestion = {
      questionNumber: initialData?.questionNumber ?? 1,
      title: question.trim(),
      type,
      options:
        type === "SINGLE_OPTION" || type === "MULTI_OPTION" ? options : [],
    };
    onDone(finalData);
  };

  return (
    <div className="flex w-full flex-col gap-6 rounded-xl border bg-white p-6 shadow-md dark:bg-gray-800 md:flex-row md:gap-8 md:p-8">
      {/* Left: Question Textarea */}
      <div className="w-full md:w-1/2">
        <label className="block pb-2 text-sm font-semibold text-gray-600 dark:text-gray-300">
          Question
        </label>
        <textarea
          className="shadow-input h-2/3 w-full appearance-none rounded-md border bg-gray-50 px-3 py-2 pr-10 text-sm text-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:text-white"
          placeholder="Enter your question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
      </div>

      {/* Right: Select + Options Logic */}
      <div className="w-full md:w-1/2">
        <Select
          selectedValue={type}
          onChange={(e) => setType(e.target.value as AnsType)}
          label="Select Question Type"
          options={[
            { label: "Text", value: "TEXT" },
            { label: "Yes No", value: "YES_NO" },
            { label: "Single Selection", value: "SINGLE_OPTION" },
            { label: "Multiple Selection", value: "MULTI_OPTION" },
            { label: "Date", value: "DATE" },
            { label: "Date Range", value: "DATE_RANGE" },
          ]}
        />

        {(type === "SINGLE_OPTION" || type === "MULTI_OPTION") && (
          <div className="mt-4 space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                placeholder="Add option"
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                onClick={handleAddOption}
                title="Add Option"
                icon={<PlusIcon size={16} />}
                disabled={!newOption.trim()}
              />
            </div>

            {options.length > 0 && (
              <p className="text-sm text-gray-500">
                {options.length} option{options.length > 1 ? "s" : ""} added
              </p>
            )}

            <ul className="space-y-2 text-sm">
              {options.map((opt, idx) => (
                <li
                  key={idx}
                  className="flex items-center justify-between gap-2 dark:text-white"
                >
                  {idx + 1}.
                  {editingIndex === idx ? (
                    <div className="flex w-full flex-col gap-2 sm:flex-row">
                      <Input
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        title="Save"
                        onClick={handleSaveEditedOption}
                        variant="secondary"
                      />
                    </div>
                  ) : (
                    <div className="flex w-full justify-between border-b px-5 pb-2">
                      <span className="capitalize">{opt}</span>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <button
                          onClick={() => handleEditOption(idx)}
                          title="Edit"
                        >
                          <Pencil size={16} className="text-primary" />
                        </button>
                        <button
                          onClick={() => handleDeleteOption(idx)}
                          title="Delete"
                        >
                          <Trash2 size={16} className="text-primary" />
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button
            title="Done"
            onClick={handleDone}
            className="w-full sm:w-auto"
            disabled={
              question.trim() === "" ||
              ((type === "SINGLE_OPTION" || type === "MULTI_OPTION") &&
                options.length === 0)
            }
          />
          <Button
            title="Cancel"
            onClick={onCancel}
            className="w-full sm:w-auto"
            variant="secondary"
          />
        </div>
      </div>
    </div>
  );
};
