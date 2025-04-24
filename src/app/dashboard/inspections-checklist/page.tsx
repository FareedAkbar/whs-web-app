"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/Select";
import { Question } from "@/types/questions";
import YesNoQuestion from "@/components/ui/YesNoQuestion";

const InspectionChecklist = () => {
  const inspections: Inspection[] = [
    {
      id: "inspection1",
      title: "Daily Vehicle Inspection",
      description: "Checklist for daily vehicle safety and readiness.",
      questions: [
        {
          id: "q1",
          question: "Driver Name",
          type: "text",
        },
        {
          id: "q2",
          question: "Inspection Date",
          type: "date",
        },
        {
          id: "q3",
          question: "Is the vehicle clean?",
          type: "yes_no",
        },
        {
          id: "q4",
          question: "Select Vehicle Type",
          type: "single_selection",
          options: ["Truck", "Van", "Car", "Motorbike"],
        },
        {
          id: "q5",
          question: "Issues Noticed During Inspection",
          type: "multiple_selection",
          options: ["Brakes", "Lights", "Tires", "Oil Level", "Windshield"],
        },
        {
          id: "q6",
          question: "Availability Period",
          type: "date_range",
        },
      ],
    },
    {
      id: "inspection2",
      title: "Office Equipment Checklist",
      description:
        "Routine check of IT and electronic equipment in the office.",
      questions: [
        {
          id: "q1",
          question: "Inspector Name",
          type: "text",
        },
        {
          id: "q2",
          question: "Inspection Date",
          type: "date",
        },
        {
          id: "q3",
          question: "All Computers Functional?",
          type: "yes_no",
        },
        {
          id: "q4",
          question: "Primary Internet Provider",
          type: "single_selection",
          options: ["Provider A", "Provider B", "Provider C"],
        },
        {
          id: "q5",
          question: "Check all that are in working condition",
          type: "multiple_selection",
          options: [
            "Projector",
            "Wi-Fi Router",
            "Printer",
            "AC Unit",
            "Scanner",
          ],
        },
      ],
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {inspections.map((inspection) => (
        <div
          key={inspection.id}
          className="rounded-lg border bg-white p-4 shadow-md"
        >
          <h2 className="mb-2 text-xl font-bold">{inspection.title}</h2>
          <p className="mb-4 text-gray-600">{inspection.description}</p>
          <div className="mx-3 flex-wrap">
            {inspection.questions.map((question) => (
              <div key={question.id} className="mb-4">
                {renderQuestion(question)}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

function renderQuestion(q: Question) {
  switch (q.type) {
    case "text":
    case "date":
      return (
        <Input
          type={q.type === "date" ? "date" : "text"}
          id={q.id}
          label={q.question}
          onChange={(e) => console.log(e.target.value)}
          className="w-2/5"
        />
      );
    case "date_range":
      return (
        <div className="flex space-x-4">
          <Input type="date" id={`${q.id}_start`} label="Start Date" />
          <Input type="date" id={`${q.id}_end`} label="End Date" />
        </div>
      );
    case "yes_no":
      return (
        <YesNoQuestion
          question={q.question}
          onChange={(value) => console.log(value)}
        />
        // <Select
        //   id={q.id}
        //   label={q.question}
        //   options={[
        //     { label: "Yes", value: "yes" },
        //     { label: "No", value: "no" },
        //   ]}
        // />
      );
    case "single_selection":
      return (
        <Select
          id={q.id}
          label={q.question}
          options={q.options?.map((opt) => ({ label: opt, value: opt })) || []}
          //   className="w-2/5"
        />
      );
    case "multiple_selection":
      return (
        <div>
          <Label className="mb-1 block">{q.question}</Label>
          <div className="space-y-2">
            {q.options?.map((opt) => (
              <label key={opt} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name={q.id}
                  value={opt}
                  className="accent-primary"
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        </div>
      );
    default:
      return null;
  }
}

export default InspectionChecklist;
