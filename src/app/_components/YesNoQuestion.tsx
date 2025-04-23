"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Check } from "lucide-react"; // you can use heroicons/react-icons too
import React from "react";

interface YesNoQuestionProps {
  name: string;
  question: string;
}

const YesNoQuestion: React.FC<YesNoQuestionProps> = ({ name, question }) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="mb-6">
      <p className="text-md mb-4 text-gray-500">{question}</p>

      <Controller
        control={control}
        name={name}
        rules={{ required: "This field is required" }}
        render={({ field: { value, onChange } }) => (
          <div className="space-y-4">
            {/* Yes Option */}
            <button
              type="button"
              onClick={() => onChange("yes")}
              className="group flex items-center gap-2"
            >
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all ${
                  value === "yes" ? "border-black" : "border-gray-400"
                }`}
              >
                {value === "yes" && <Check className="h-4 w-4 text-black" />}
              </div>
              <span
                className={`text-md transition-colors ${
                  value === "yes" ? "text-black" : "text-gray-400"
                }`}
              >
                Yes
              </span>
            </button>

            {/* No Option */}
            <button
              type="button"
              onClick={() => onChange("no")}
              className="group flex items-center gap-2"
            >
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all ${
                  value === "no" ? "border-black" : "border-gray-400"
                }`}
              >
                {value === "no" && <Check className="h-4 w-4 text-black" />}
              </div>
              <span
                className={`text-md transition-colors ${
                  value === "no" ? "text-black" : "text-gray-400"
                }`}
              >
                No
              </span>
            </button>

            {/* Error Message */}
            {errors[name] && (
              <p className="text-sm text-red-500">
                {String(errors[name]?.message)}
              </p>
            )}
          </div>
        )}
      />
    </div>
  );
};

export default YesNoQuestion;
