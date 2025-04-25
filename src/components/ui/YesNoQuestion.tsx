import React from "react";

interface YesNoRadioProps {
  // name: string;
  question: string;
  value?: string;
  onChange: (value: string) => void;
  className?: string;
}

const YesNoRadio: React.FC<YesNoRadioProps> = ({
  question,
  value,
  onChange,
  className,
}) => {
  return (
    <div
      className={`flex flex-row justify-between bg-gray-100 p-4 ${className}`}
    >
      <p className="text-gray-700">{question}</p>
      <div className="flex space-x-3">
        <label className="flex items-center text-sm">
          <input
            type="radio"
            // name={name}
            value="yes"
            checked={value === "yes"}
            onChange={() => onChange("yes")}
            className="mr-0.5 accent-primary"
          />
          Yes
        </label>
        <label className="flex items-center text-sm">
          <input
            type="radio"
            // name={name}
            value="no"
            checked={value === "no"}
            onChange={() => onChange("no")}
            className="mr-0.5 accent-primary"
          />
          No
        </label>
      </div>
    </div>
  );
};

export default YesNoRadio;
