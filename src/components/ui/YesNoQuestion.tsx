import React from "react";

interface YesNoRadioProps {
  // name: string;
  question: string;
  value?: string;
  onChange: (value: string) => void;
}

const YesNoRadio: React.FC<YesNoRadioProps> = ({
  question,
  value,
  onChange,
}) => {
  return (
    <div className="mb-4 flex flex-row justify-between">
      <p className="mb-2 text-gray-700">{question}</p>
      <div>
        <label className="mr-4">
          <input
            type="radio"
            // name={name}
            value="yes"
            checked={value === "yes"}
            onChange={() => onChange("yes")}
            className="mr-1"
          />
          Yes
        </label>
        <label>
          <input
            type="radio"
            // name={name}
            value="no"
            checked={value === "no"}
            onChange={() => onChange("no")}
            className="mr-1"
          />
          No
        </label>
      </div>
    </div>
  );
};

export default YesNoRadio;
